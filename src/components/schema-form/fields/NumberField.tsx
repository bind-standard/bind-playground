import { NumberInput } from '@mantine/core';

interface NumberFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  error?: string;
  min?: number;
  max?: number;
}

export function NumberField({
  label,
  description,
  required,
  value,
  onChange,
  error,
  min,
  max,
}: NumberFieldProps) {
  return (
    <NumberInput
      label={label}
      description={description}
      required={required}
      value={value ?? ''}
      onChange={(v) => onChange(v === '' ? undefined : (v as number))}
      error={error}
      min={min}
      max={max}
    />
  );
}
