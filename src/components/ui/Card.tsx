import clsx from 'clsx';
import type { HTMLAttributes, ReactNode } from 'react';

export function Card({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <section {...props} className={clsx('card', className)}>
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card__header">
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
