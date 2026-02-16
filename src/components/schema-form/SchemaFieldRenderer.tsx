import { Stack } from '@mantine/core';
import type { JSONSchema } from '@/lib/schemas/all-schemas';
import { resolveRef } from '@/lib/schemas/ref-resolver';
import { detectSpecialTypeFromRef } from '@/lib/schemas/type-detector';
import { buildInitialValues } from '@/lib/schemas/initial-values';
import { StringField } from './fields/StringField';
import { EnumField } from './fields/EnumField';
import { NumberField } from './fields/NumberField';
import { BooleanField } from './fields/BooleanField';
import { DateField } from './fields/DateField';
import { DateTimeField } from './fields/DateTimeField';
import { ObjectField } from './fields/ObjectField';
import { ArrayField } from './fields/ArrayField';
import { CodingField } from './fields/CodingField';
import { CodeableConceptField } from './fields/CodeableConceptField';
import { ReferenceField } from './fields/ReferenceField';
import { MoneyField } from './fields/MoneyField';
import { PeriodField } from './fields/PeriodField';

interface SchemaFieldRendererProps {
  propName: string;
  propSchema: Record<string, unknown>;
  rootSchema: JSONSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  required?: boolean;
  depth?: number;
}

function formatLabel(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

export function SchemaFieldRenderer({
  propName,
  propSchema,
  rootSchema,
  value,
  onChange,
  required,
  depth = 0,
}: SchemaFieldRendererProps) {
  if (depth > 8) return null;

  const label = formatLabel(propName);
  const description = propSchema.description as string | undefined;
  const type = propSchema.type as string | undefined;
  const format = propSchema.format as string | undefined;
  const enumValues = propSchema.enum as string[] | undefined;
  const ref = propSchema.$ref as string | undefined;
  const constValue = propSchema.const;

  // Skip const fields (like resourceType) — they're auto-set
  if (constValue !== undefined) return null;

  // Extract terminology binding metadata
  const xTerminology = propSchema['x-terminology'] as
    | { system: string; binding: string }
    | undefined;
  const terminologySystemFilter = xTerminology?.system;

  // Handle $ref
  if (ref) {
    const specialType = detectSpecialTypeFromRef(ref);

    if (specialType === 'Coding') {
      return (
        <CodingField
          label={label}
          description={description}
          required={required}
          value={(value as Record<string, unknown>) || {}}
          onChange={(v) => onChange(v)}
          systemFilter={terminologySystemFilter}
        />
      );
    }

    if (specialType === 'CodeableConcept') {
      return (
        <CodeableConceptField
          label={label}
          description={description}
          required={required}
          value={(value as Record<string, unknown>) || {}}
          onChange={(v) => onChange(v)}
          systemFilter={terminologySystemFilter}
        />
      );
    }

    if (specialType === 'Reference') {
      return (
        <ReferenceField
          label={label}
          description={description}
          required={required}
          value={(value as Record<string, unknown>) || {}}
          onChange={(v) => onChange(v)}
        />
      );
    }

    if (specialType === 'Money' || specialType === 'MoneyWithConversion' || specialType === 'MultiCurrencyMoney') {
      return (
        <MoneyField
          label={label}
          description={description}
          required={required}
          value={(value as Record<string, unknown>) || {}}
          onChange={(v) => onChange(v)}
        />
      );
    }

    if (specialType === 'Period' || specialType === 'DateTimePeriod') {
      return (
        <PeriodField
          label={label}
          description={description}
          value={(value as Record<string, unknown>) || {}}
          onChange={(v) => onChange(v)}
        />
      );
    }

    // Resolve other $refs and render as nested object
    const resolved = resolveRef(ref, rootSchema);
    if (resolved && resolved.schema.properties) {
      return (
        <ObjectField label={label} description={description}>
          <RenderObjectProperties
            definition={resolved.schema}
            rootSchema={rootSchema}
            value={(value as Record<string, unknown>) || {}}
            onChange={onChange as (v: Record<string, unknown>) => void}
            depth={depth + 1}
          />
        </ObjectField>
      );
    }

    return null;
  }

  // Handle arrays
  if (type === 'array') {
    const items = propSchema.items as Record<string, unknown> | undefined;
    const arr = (value as unknown[]) || [];

    return (
      <ArrayField
        label={label}
        description={description}
        items={arr}
        onAdd={() => {
          if (items?.$ref) {
            const resolved = resolveRef(
              items.$ref as string,
              rootSchema
            );
            if (resolved) {
              onChange([
                ...arr,
                buildInitialValues(resolved.schema, rootSchema, depth + 1),
              ]);
              return;
            }
          }
          if (items?.type === 'string') {
            onChange([...arr, '']);
          } else if (items?.type === 'object') {
            onChange([
              ...arr,
              buildInitialValues(
                items as Record<string, unknown>,
                rootSchema,
                depth + 1
              ),
            ]);
          } else {
            onChange([...arr, {}]);
          }
        }}
        onRemove={(index) => onChange(arr.filter((_, i) => i !== index))}
        renderItem={(index) => {
          if (!items) return null;

          const itemRef = items.$ref as string | undefined;
          if (itemRef) {
            const special = detectSpecialTypeFromRef(itemRef);
            if (special === 'Coding') {
              return (
                <CodingField
                  label={`${label} #${index + 1}`}
                  value={(arr[index] as Record<string, unknown>) || {}}
                  onChange={(v) => {
                    const updated = [...arr];
                    updated[index] = v;
                    onChange(updated);
                  }}
                  systemFilter={terminologySystemFilter}
                />
              );
            }
            if (special === 'CodeableConcept') {
              return (
                <CodeableConceptField
                  label={`${label} #${index + 1}`}
                  value={(arr[index] as Record<string, unknown>) || {}}
                  onChange={(v) => {
                    const updated = [...arr];
                    updated[index] = v;
                    onChange(updated);
                  }}
                  systemFilter={terminologySystemFilter}
                />
              );
            }
            if (special === 'Reference') {
              return (
                <ReferenceField
                  label={`${label} #${index + 1}`}
                  value={(arr[index] as Record<string, unknown>) || {}}
                  onChange={(v) => {
                    const updated = [...arr];
                    updated[index] = v;
                    onChange(updated);
                  }}
                />
              );
            }

            const resolved = resolveRef(itemRef, rootSchema);
            if (resolved && resolved.schema.properties) {
              return (
                <RenderObjectProperties
                  definition={resolved.schema}
                  rootSchema={rootSchema}
                  value={(arr[index] as Record<string, unknown>) || {}}
                  onChange={(v) => {
                    const updated = [...arr];
                    updated[index] = v;
                    onChange(updated);
                  }}
                  depth={depth + 1}
                />
              );
            }
          }

          if (items.type === 'string') {
            return (
              <StringField
                label={`Item #${index + 1}`}
                value={(arr[index] as string) || ''}
                onChange={(v) => {
                  const updated = [...arr];
                  updated[index] = v;
                  onChange(updated);
                }}
              />
            );
          }

          return null;
        }}
      />
    );
  }

  // Handle enums
  if (type === 'string' && enumValues) {
    return (
      <EnumField
        label={label}
        description={description}
        required={required}
        value={(value as string) || ''}
        onChange={(v) => onChange(v)}
        options={enumValues}
      />
    );
  }

  // Handle string with formats
  if (type === 'string' && format === 'date') {
    return (
      <DateField
        label={label}
        description={description}
        required={required}
        value={(value as string) || ''}
        onChange={(v) => onChange(v)}
      />
    );
  }

  if (type === 'string' && format === 'date-time') {
    return (
      <DateTimeField
        label={label}
        description={description}
        required={required}
        value={(value as string) || ''}
        onChange={(v) => onChange(v)}
      />
    );
  }

  // Handle plain strings
  if (type === 'string') {
    const isLong =
      propName === 'notes' ||
      propName === 'description' ||
      propName === 'text';
    return (
      <StringField
        label={label}
        description={description}
        required={required}
        value={(value as string) || ''}
        onChange={(v) => onChange(v)}
        multiline={isLong}
      />
    );
  }

  // Handle numbers
  if (type === 'number' || type === 'integer') {
    return (
      <NumberField
        label={label}
        description={description}
        required={required}
        value={value as number | undefined}
        onChange={(v) => onChange(v)}
        min={propSchema.minimum as number | undefined}
        max={propSchema.maximum as number | undefined}
      />
    );
  }

  // Handle booleans
  if (type === 'boolean') {
    return (
      <BooleanField
        label={label}
        description={description}
        value={(value as boolean) || false}
        onChange={(v) => onChange(v)}
      />
    );
  }

  // Handle inline objects
  if (type === 'object' && propSchema.properties) {
    return (
      <ObjectField label={label} description={description}>
        <RenderObjectProperties
          definition={propSchema}
          rootSchema={rootSchema}
          value={(value as Record<string, unknown>) || {}}
          onChange={onChange as (v: Record<string, unknown>) => void}
          depth={depth + 1}
        />
      </ObjectField>
    );
  }

  return null;
}

function RenderObjectProperties({
  definition,
  rootSchema,
  value,
  onChange,
  depth,
}: {
  definition: Record<string, unknown>;
  rootSchema: JSONSchema;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  depth: number;
}) {
  const properties = definition.properties as
    | Record<string, Record<string, unknown>>
    | undefined;
  const requiredFields = new Set(
    (definition.required as string[] | undefined) || []
  );

  if (!properties) return null;

  return (
    <Stack gap="md">
      {Object.entries(properties).map(([key, prop]) => (
        <SchemaFieldRenderer
          key={key}
          propName={key}
          propSchema={prop}
          rootSchema={rootSchema}
          value={value[key]}
          onChange={(v) => onChange({ ...value, [key]: v })}
          required={requiredFields.has(key)}
          depth={depth}
        />
      ))}
    </Stack>
  );
}

export { RenderObjectProperties };
