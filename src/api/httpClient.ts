import type { z } from 'zod';

import { runtimeConfig } from '../config/runtimeConfig';
import { apiErrorSchema } from './schemas';

const JSON_MEDIA_TYPE = /^(application\/(?:[\w.-]+\+)?json)(?:\s*;|$)/i;

export class ApiClientError extends Error {
  public constructor(
    message: string,
    public readonly status: number,
    public readonly details: readonly string[] = [],
    public readonly path?: string,
    public readonly correlationId?: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'signal'> {
  timeoutMs?: number | undefined;
  signal?: AbortSignal | undefined;
}

/**
 * Fetches JSON with bounded request and response sizes and validates data at the
 * browser trust boundary. A per-request correlation identifier lets operators
 * connect a visible failure to backend logs without exposing request contents.
 */
export async function requestJson<T>(
  path: string,
  schema: z.ZodType<T>,
  options: RequestOptions = {},
): Promise<T> {
  assertSafePath(path);
  assertRequestSize(options.body);

  const controller = new AbortController();
  let timedOut = false;
  const timeout = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, options.timeoutMs ?? runtimeConfig.apiTimeoutMs);
  const relayAbort = (): void => controller.abort(options.signal?.reason);
  options.signal?.addEventListener('abort', relayAbort, { once: true });

  const correlationId = crypto.randomUUID();

  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  headers.set('X-Correlation-Id', correlationId);
  if (typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(`${runtimeConfig.apiBaseUrl}${path}`, {
      ...options,
      signal: controller.signal,
      headers,
      credentials: 'same-origin',
      redirect: 'error',
      referrerPolicy: 'no-referrer',
    });

    const responseCorrelationId = response.headers.get('X-Correlation-Id') ?? correlationId;
    const data = await parseBody(response, responseCorrelationId);

    if (!response.ok) {
      const parsedError = apiErrorSchema.safeParse(data);
      if (parsedError.success) {
        throw new ApiClientError(
          parsedError.data.error,
          response.status,
          parsedError.data.details,
          parsedError.data.path,
          responseCorrelationId,
        );
      }
      throw new ApiClientError(
        `Request failed with HTTP ${response.status}`,
        response.status,
        [],
        path,
        responseCorrelationId,
      );
    }

    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      throw new ApiClientError(
        'The server returned an unexpected response shape',
        502,
        [parsed.error.issues.map((issue) => issue.message).join('; ')],
        path,
        responseCorrelationId,
      );
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      if (!timedOut && options.signal?.aborted === true) {
        throw error;
      }
      throw new ApiClientError('The request timed out', 408, [], path, correlationId);
    }
    throw new ApiClientError('Unable to reach the job queue service', 0, [], path, correlationId);
  } finally {
    window.clearTimeout(timeout);
    options.signal?.removeEventListener('abort', relayAbort);
  }
}

function assertSafePath(path: string): void {
  if (!path.startsWith('/') || path.startsWith('//')) {
    throw new ApiClientError('Refused an unsafe API path', 0);
  }
}

function assertRequestSize(body: BodyInit | null | undefined): void {
  if (typeof body !== 'string') {
    return;
  }
  if (new TextEncoder().encode(body).byteLength > runtimeConfig.maxRequestBytes) {
    throw new ApiClientError('The request payload is too large', 413);
  }
}

async function parseBody(response: Response, correlationId: string): Promise<unknown> {
  const declaredLength = Number(response.headers.get('Content-Length'));
  if (Number.isFinite(declaredLength) && declaredLength > runtimeConfig.maxResponseBytes) {
    await response.body?.cancel();
    throw new ApiClientError(
      'The server response exceeded the allowed size',
      502,
      [],
      response.url,
      correlationId,
    );
  }

  const bytes = await readBoundedBody(response, correlationId);
  if (bytes.byteLength === 0) {
    return null;
  }

  const contentType = response.headers.get('Content-Type') ?? '';
  if (!JSON_MEDIA_TYPE.test(contentType)) {
    throw new ApiClientError(
      'The server returned a non-JSON response',
      502,
      [],
      response.url,
      correlationId,
    );
  }

  try {
    return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
  } catch {
    throw new ApiClientError(
      'The server returned invalid JSON',
      502,
      [],
      response.url,
      correlationId,
    );
  }
}

async function readBoundedBody(response: Response, correlationId: string): Promise<Uint8Array> {
  if (response.body === null) {
    return new Uint8Array();
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      total += value.byteLength;
      if (total > runtimeConfig.maxResponseBytes) {
        await reader.cancel();
        throw new ApiClientError(
          'The server response exceeded the allowed size',
          502,
          [],
          response.url,
          correlationId,
        );
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}
