export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="loading-state" role="status">
      <span className="skeleton skeleton--title" />
      <span className="skeleton" />
      <span className="skeleton skeleton--short" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
