import { jobsApi } from './jobsApi';

const job = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  tenantId: 'retail-bank',
  idempotencyKey: 'key-12345678',
  type: 'TRANSFER_SETTLEMENT',
  priority: 'HIGH',
  status: 'PENDING',
  attempt: 0,
  maxAttempts: 5,
  lastError: null,
  createdAt: '2026-06-28T12:00:00Z',
  updatedAt: '2026-06-28T12:00:00Z',
  completedAt: null,
  deduplicated: false,
};

function mockJson(body: unknown) {
  const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('jobsApi', () => {
  it('submits a job with the idempotency header', async () => {
    const fetchMock = mockJson(job);
    await jobsApi.submit(
      {
        tenantId: 'retail-bank',
        type: 'TRANSFER_SETTLEMENT',
        priority: 'HIGH',
        payload: { transferId: 'TRF-1' },
      },
      'key-12345678',
    );

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/jobs',
      expect.objectContaining({ method: 'POST' }),
    );
    const headers = new Headers(fetchMock.mock.calls[0]?.[1]?.headers);
    expect(headers.get('Idempotency-Key')).toBe('key-12345678');
  });

  it('builds job, key, effect, replay, and health requests', async () => {
    let fetchMock = mockJson(job);
    await jobsApi.get(job.id);
    expect(fetchMock).toHaveBeenCalledWith(`/api/v1/jobs/${job.id}`, expect.any(Object));

    fetchMock = mockJson(job);
    await jobsApi.findByKey('retail bank', 'key/value');
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      '/api/v1/jobs/by-key?tenantId=retail+bank&idempotencyKey=key%2Fvalue',
    );

    fetchMock = mockJson({
      id: '5f2e8400-e29b-41d4-a716-446655440001',
      jobId: job.id,
      effectType: 'TRANSFER_SETTLEMENT',
      businessKey: 'TRF-1',
      externalReference: 'SET-TRF-1',
      details: { amount: 10 },
      createdAt: '2026-06-28T12:00:01Z',
    });
    await jobsApi.getEffect(job.id);
    expect(fetchMock).toHaveBeenCalledWith(`/api/v1/jobs/${job.id}/effect`, expect.any(Object));

    fetchMock = mockJson(job);
    await jobsApi.replay(job.id);
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/v1/jobs/${job.id}/replay`,
      expect.objectContaining({ method: 'POST' }),
    );

    fetchMock = mockJson({ status: 'UP' });
    await jobsApi.health();
    expect(fetchMock).toHaveBeenCalledWith(
      '/actuator/health',
      expect.objectContaining({ credentials: 'same-origin' }),
    );
  });
});
