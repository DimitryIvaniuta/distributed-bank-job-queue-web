import clsx from 'clsx';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

interface FieldShellProps {
  label: string;
  htmlFor: string;
  error?: string | undefined;
  hint?: string | undefined;
  required?: boolean | undefined;
  children: ReactNode;
}

export function FieldShell({
  label,
  htmlFor,
  error,
  hint,
  required = false,
  children,
}: FieldShellProps) {
  const hintId = `${htmlFor}-hint`;
  const errorId = `${htmlFor}-error`;
  return (
    <div className="field">
      <label htmlFor={htmlFor}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <small id={hintId} className="field__hint">
          {hint}
        </small>
      ) : null}
      {error ? (
        <small id={errorId} className="field__error" role="alert">
          {error}
        </small>
      ) : null}
    </div>
  );
}

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
}

export function InputField({ label, error, hint, id, className, ...props }: InputFieldProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replaceAll(' ', '-');
  return (
    <FieldShell label={label} htmlFor={inputId} error={error} hint={hint} required={props.required}>
      <input
        {...props}
        id={inputId}
        className={clsx('input', className, error && 'input--error')}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
      />
    </FieldShell>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  children: ReactNode;
}

export function SelectField({
  label,
  error,
  hint,
  id,
  className,
  children,
  ...props
}: SelectFieldProps) {
  const selectId = id ?? props.name ?? label.toLowerCase().replaceAll(' ', '-');
  return (
    <FieldShell
      label={label}
      htmlFor={selectId}
      error={error}
      hint={hint}
      required={props.required}
    >
      <select
        {...props}
        id={selectId}
        className={clsx('select', className, error && 'input--error')}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
      >
        {children}
      </select>
    </FieldShell>
  );
}
