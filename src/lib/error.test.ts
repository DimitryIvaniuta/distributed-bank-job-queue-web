import { ApiClientError } from '../api/httpClient';
import { getErrorMessage } from './error';
import { generateIdempotencyKey } from './idempotency';

describe('client helpers', () => {
  it('normalizes API, Error, and unknown messages', () => {
    expect(getErrorMessage(new ApiClientError('Conflict', 409))).toBe('Conflict');
    expect(getErrorMessage(new Error('Failure'))).toBe('Failure');
    expect(getErrorMessage({})).toBe('An unexpected error occurred');
  });

  it('generates a UUID idempotency key', () => {
    expect(generateIdempotencyKey()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});
