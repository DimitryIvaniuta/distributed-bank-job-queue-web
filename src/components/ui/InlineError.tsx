import { CircleAlert } from 'lucide-react';

export function InlineError({
  title = 'Unable to complete request',
  message,
  reference,
}: {
  title?: string;
  message: string;
  reference?: string | undefined;
}) {
  return (
    <div className="inline-error" role="alert">
      <CircleAlert size={20} aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <p>{message}</p>
        {reference ? (
          <small className="inline-error__reference">Support reference: {reference}</small>
        ) : null}
      </div>
    </div>
  );
}
