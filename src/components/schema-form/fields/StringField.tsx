import { TextInput, Textarea } from '@mantine/core';

interface StringFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  multiline?: boolean;
}

export function StringField({
  label,
  description,
  required,
  value,
  onChange,
  error,
  multiline,
}: StringFieldProps) {
  if (multiline) {
    return (
      <Textarea
        label={label}
        description={description}
        required={required}
        value={value || ''}
        onChange={(e) => onChange(e.currentTarget.value)}
        error={error}
        autosize
        minRows={2}
        maxRows={6}
      />
    );
  }

  return (
    <TextInput
      label={label}
      description={description}
      required={required}
      value={value || ''}
      onChange={(e) => onChange(e.currentTarget.value)}
      error={error}
    />
  );
}
