const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_RESPONSE_BYTES = 1_048_576;
const DEFAULT_MAX_REQUEST_BYTES = 300 * 1024;

export interface RuntimeConfig {
  apiBaseUrl: string;
  apiTimeoutMs: number;
  environmentName: string;
  maxRequestBytes: number;
  maxResponseBytes: number;
  release: string;
}

function boundedInteger(
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}

function nonBlank(raw: string | undefined, fallback: string): string {
  const value = raw?.trim();
  return value === undefined || value === '' ? fallback : value;
}

function normalizeApiBaseUrl(raw: string | undefined): string {
  const value = raw?.trim().replace(/\/+$/, '') ?? '';
  if (value === '') {
    return '';
  }

  const url = new URL(value, window.location.origin);
  if (!['http:', 'https:'].includes(url.protocol) || url.username !== '' || url.password !== '') {
    throw new Error('VITE_API_BASE_URL must be an HTTP(S) URL without embedded credentials');
  }
  if (url.search !== '' || url.hash !== '') {
    throw new Error('VITE_API_BASE_URL must not contain a query string or fragment');
  }
  return url.href.replace(/\/+$/, '');
}

/**
 * Parses public build-time configuration once and applies conservative bounds.
 * Secrets must never be exposed through Vite environment variables because they
 * are embedded into the browser bundle.
 */
export const runtimeConfig: RuntimeConfig = Object.freeze({
  apiBaseUrl: normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL),
  apiTimeoutMs: boundedInteger(
    import.meta.env.VITE_API_TIMEOUT_MS,
    DEFAULT_TIMEOUT_MS,
    1_000,
    60_000,
  ),
  environmentName: nonBlank(import.meta.env.VITE_ENVIRONMENT_NAME, 'Local / Configured'),
  maxRequestBytes: boundedInteger(
    import.meta.env.VITE_API_MAX_REQUEST_BYTES,
    DEFAULT_MAX_REQUEST_BYTES,
    32 * 1024,
    2 * 1024 * 1024,
  ),
  maxResponseBytes: boundedInteger(
    import.meta.env.VITE_API_MAX_RESPONSE_BYTES,
    DEFAULT_MAX_RESPONSE_BYTES,
    64 * 1024,
    5 * 1024 * 1024,
  ),
  release: __APP_VERSION__,
});
