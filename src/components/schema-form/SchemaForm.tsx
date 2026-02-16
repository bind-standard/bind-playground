import { useState } from 'react';
import { Stack, Button, Group } from '@mantine/core';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { getSchema } from '@/lib/schemas/registry';
import { resolveRootRef } from '@/lib/schemas/ref-resolver';
import { buildInitialValues } from '@/lib/schemas/initial-values';
import { RenderObjectProperties } from './SchemaFieldRenderer';

interface SchemaFormProps {
  schemaName: string;
  initialValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => void;
  submitLabel?: string;
}

export function SchemaForm({
  schemaName,
  initialValues,
  onSubmit,
  submitLabel = 'Add to Bundle',
}: SchemaFormProps) {
  const schema = getSchema(schemaName);
  if (!schema) return <div>Schema "{schemaName}" not found.</div>;

  const rootRef = resolveRootRef(schema);
  if (!rootRef) return <div>Cannot resolve root definition.</div>;

  const defaultValues = buildInitialValues(rootRef.schema, schema);
  const [values, setValues] = useState<Record<string, unknown>>(
    initialValues || defaultValues
  );

  function handleSubmit() {
    // Strip empty strings and undefined at the top level
    const cleaned = cleanValues(values) as Record<string, unknown> | undefined;
    onSubmit(cleaned || {});
  }

  return (
    <Stack gap="lg">
      <RenderObjectProperties
        definition={rootRef.schema}
        rootSchema={schema}
        value={values}
        onChange={setValues}
        depth={0}
      />
      <Group>
        <Button
          leftSection={<IconDeviceFloppy size={16} />}
          onClick={handleSubmit}
        >
          {submitLabel}
        </Button>
      </Group>
    </Stack>
  );
}

function cleanValues(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    const cleaned = obj
      .map(cleanValues)
      .filter((v) => v !== undefined && v !== null && v !== '');
    return cleaned.length > 0 ? cleaned : undefined;
  }

  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      const cleaned = cleanValues(val);
      if (cleaned !== undefined && cleaned !== null && cleaned !== '') {
        result[key] = cleaned;
      }
    }
    return Object.keys(result).length > 0 ? result : undefined;
  }

  return obj;
}
