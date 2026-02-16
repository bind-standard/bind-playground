import { Select } from '@mantine/core';

interface EnumFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  options: string[];
}

export function EnumField({
  label,
  description,
  required,
  value,
  onChange,
  error,
  options,
}: EnumFieldProps) {
  return (
    <Select
      label={label}
      description={description}
      required={required}
      value={value || null}
      onChange={(v) => onChange(v || '')}
      error={error}
      data={options.map((o) => ({ value: o, label: o }))}
      clearable
      searchable
    />
  );
}
