import clsx from 'clsx';
import { LoaderCircle } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  tone?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export function Button({
  children,
  className,
  disabled,
  loading = false,
  tone = 'primary',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={clsx('button', `button--${tone}`, className)}
      disabled={disabled === true || loading}
    >
      {loading ? <LoaderCircle className="spin" size={18} aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  );
}
