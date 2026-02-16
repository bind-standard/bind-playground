import { TextInput } from '@mantine/core';

interface DateTimeFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function DateTimeField({
  label,
  description,
  required,
  value,
  onChange,
  error,
}: DateTimeFieldProps) {
  return (
    <TextInput
      label={label}
      description={description}
      required={required}
      type="datetime-local"
      value={value || ''}
      onChange={(e) => onChange(e.currentTarget.value)}
      error={error}
    />
  );
}
