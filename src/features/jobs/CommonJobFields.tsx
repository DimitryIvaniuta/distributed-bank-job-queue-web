import { RefreshCw } from 'lucide-react';
import type { FieldError, FieldErrorsImpl, Merge, UseFormRegisterReturn } from 'react-hook-form';

import { Button } from '../../components/ui/Button';
import { InputField, SelectField } from '../../components/ui/FormField';

type FormFieldError = FieldError | Merge<FieldError, FieldErrorsImpl<Record<string, never>>>;

interface CommonJobFieldsProps {
  tenantRegistration: UseFormRegisterReturn;
  tenantError?: FormFieldError | undefined;
  keyRegistration: UseFormRegisterReturn;
  keyError?: FormFieldError | undefined;
  priorityRegistration: UseFormRegisterReturn;
  priorityError?: FormFieldError | undefined;
  maxAttemptsRegistration: UseFormRegisterReturn;
  maxAttemptsError?: FormFieldError | undefined;
  onRegenerateKey: () => void;
}

export function CommonJobFields({
  tenantRegistration,
  tenantError,
  keyRegistration,
  keyError,
  priorityRegistration,
  priorityError,
  maxAttemptsRegistration,
  maxAttemptsError,
  onRegenerateKey,
}: CommonJobFieldsProps) {
  return (
    <div className="form-section">
      <div className="form-section__heading">
        <span>01</span>
        <div>
          <h2>Queue controls</h2>
          <p>Define the tenant boundary, idempotency key, priority lane, and retry budget.</p>
        </div>
      </div>
      <div className="form-grid form-grid--two">
        <InputField
          {...tenantRegistration}
          label="Tenant ID"
          error={messageOf(tenantError)}
          autoComplete="organization"
          maxLength={80}
          required
        />
        <div className="field-with-action">
          <InputField
            {...keyRegistration}
            label="Idempotency key"
            error={messageOf(keyError)}
            autoComplete="off"
            spellCheck={false}
            maxLength={160}
            required
            hint="Reuse only for the exact same business request."
          />
          <Button
            type="button"
            tone="ghost"
            onClick={onRegenerateKey}
            aria-label="Generate a new idempotency key"
          >
            <RefreshCw size={16} /> New key
          </Button>
        </div>
        <SelectField
          {...priorityRegistration}
          label="Priority lane"
          error={messageOf(priorityError)}
          required
        >
          <option value="HIGH">High — jobs-high</option>
          <option value="LOW">Low — jobs-low</option>
        </SelectField>
        <InputField
          {...maxAttemptsRegistration}
          label="Maximum attempts"
          type="number"
          inputMode="numeric"
          min={1}
          max={20}
          error={messageOf(maxAttemptsError)}
          hint="Leave empty to use the backend default."
        />
      </div>
    </div>
  );
}

function messageOf(error: FormFieldError | undefined): string | undefined {
  return typeof error?.message === 'string' ? error.message : undefined;
}
