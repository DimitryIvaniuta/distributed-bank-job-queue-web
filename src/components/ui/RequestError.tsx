import { ApiClientError } from '../../api/httpClient';
import { getErrorMessage } from '../../lib/error';
import { InlineError } from './InlineError';

/** Renders a stable user message plus a support-safe backend correlation id. */
export function RequestError({ error, title }: { error: unknown; title?: string }) {
  const reference = error instanceof ApiClientError ? error.correlationId : undefined;
  return (
    <InlineError
      message={getErrorMessage(error)}
      {...(title === undefined ? {} : { title })}
      {...(reference === undefined ? {} : { reference })}
    />
  );
}
