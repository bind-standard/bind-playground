import { TextInput } from '@mantine/core';

interface DateFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function DateField({
  label,
  description,
  required,
  value,
  onChange,
  error,
}: DateFieldProps) {
  return (
    <TextInput
      label={label}
      description={description}
      required={required}
      type="date"
      value={value || ''}
      onChange={(e) => onChange(e.currentTarget.value)}
      error={error}
    />
  );
}
