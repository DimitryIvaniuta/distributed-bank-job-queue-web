/** Generates a cryptographically strong idempotency key supported by modern browsers. */
export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}
