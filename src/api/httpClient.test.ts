import { z } from 'zod';

import { ApiClientError, requestJson } from './httpClient';

const responseSchema = z.object({ value: z.string() });

function mockResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json', ...headers },
      }),
    ),
  );
}

describe('requestJson', () => {
  it('returns a runtime-validated success response with a correlation id', async () => {
    mockResponse({ value: 'accepted' });

    await expect(requestJson('/test', responseSchema)).resolves.toEqual({ value: 'accepted' });
    expect(fetch).toHaveBeenCalledWith(
      '/test',
      expect.objectContaining({
        credentials: 'same-origin',
        redirect: 'error',
      }),
    );
    const headers = vi.mocked(fetch).mock.calls[0]?.[1]?.headers;
    expect(headers).toBeInstanceOf(Headers);
    expect(new Headers(headers).get('Accept')).toBe('application/json');
    expect(new Headers(headers).get('X-Correlation-Id')).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it('prevents callers from overriding security-sensitive transport headers', async () => {
    mockResponse({ value: 'accepted' });

    await requestJson('/test', responseSchema, {
      body: JSON.stringify({ value: 'submitted' }),
      headers: {
        Accept: 'text/html',
        'Content-Type': 'text/plain',
        'X-Correlation-Id': 'caller-controlled',
      },
      method: 'POST',
    });

    const headers = new Headers(vi.mocked(fetch).mock.calls[0]?.[1]?.headers);
    expect(headers.get('Accept')).toBe('application/json');
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.get('X-Correlation-Id')).not.toBe('caller-controlled');
  });

  it('maps the backend error contract and response correlation id', async () => {
    mockResponse(
      {
        timestamp: '2026-06-28T12:00:00Z',
        status: 409,
        error: 'Idempotency key conflicts with the original request',
        details: ['payload fingerprint differs'],
        path: '/api/v1/jobs',
      },
      409,
      { 'X-Correlation-Id': 'corr-123' },
    );

    const error = await requestJson('/test', responseSchema).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiClientError);
    expect(error).toMatchObject({
      status: 409,
      message: 'Idempotency key conflicts with the original request',
      details: ['payload fingerprint differs'],
      correlationId: 'corr-123',
    });
  });

  it('rejects a response that violates the expected schema', async () => {
    mockResponse({ value: 42 });

    await expect(requestJson('/test', responseSchema)).rejects.toMatchObject({
      status: 502,
      message: 'The server returned an unexpected response shape',
    });
  });

  it('rejects invalid JSON from an upstream proxy', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('<html>bad gateway</html>', {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    await expect(requestJson('/test', responseSchema)).rejects.toMatchObject({
      status: 502,
      message: 'The server returned invalid JSON',
    });
  });

  it('rejects an unexpected content type before parsing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('<html>bad gateway</html>', {
          status: 502,
          headers: { 'Content-Type': 'text/html' },
        }),
      ),
    );

    await expect(requestJson('/test', responseSchema)).rejects.toMatchObject({
      status: 502,
      message: 'The server returned a non-JSON response',
    });
  });

  it('rejects an oversized request before calling fetch', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      requestJson('/test', responseSchema, { body: 'x'.repeat(310 * 1024), method: 'POST' }),
    ).rejects.toMatchObject({ status: 413 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a response whose declared size exceeds the configured ceiling', async () => {
    mockResponse({ value: 'accepted' }, 200, { 'Content-Length': '1048577' });

    await expect(requestJson('/test', responseSchema)).rejects.toMatchObject({
      status: 502,
      message: 'The server response exceeded the allowed size',
    });
  });

  it('refuses unsafe absolute or protocol-relative request paths', async () => {
    await expect(requestJson('//attacker.example', responseSchema)).rejects.toMatchObject({
      message: 'Refused an unsafe API path',
    });
    await expect(requestJson('https://attacker.example', responseSchema)).rejects.toMatchObject({
      message: 'Refused an unsafe API path',
    });
  });

  it('preserves caller cancellation for query libraries', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(
        (_input: RequestInfo | URL, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () =>
              reject(new DOMException('Aborted', 'AbortError')),
            );
          }),
      ),
    );
    const controller = new AbortController();
    const request = requestJson('/test', responseSchema, { signal: controller.signal });
    controller.abort();

    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('converts a network failure to a stable client error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network failed')));

    await expect(requestJson('/test', responseSchema)).rejects.toMatchObject({
      status: 0,
      message: 'Unable to reach the job queue service',
    });
  });
});
