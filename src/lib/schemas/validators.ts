import type { JSONSchema } from './all-schemas';
import { resolveRef } from './ref-resolver';

type ValidatorFn = (value: unknown) => string | null;

/**
 * Builds a flat map of Mantine form validators from a JSON schema definition.
 * Keys use dot-notation paths for nested fields.
 */
export function buildValidators(
  definition: Record<string, unknown>,
  rootSchema: JSONSchema,
  prefix = '',
  depth = 0
): Record<string, ValidatorFn> {
  if (depth > 8) return {};

  const properties = definition.properties as
    | Record<string, Record<string, unknown>>
    | undefined;
  if (!properties) return {};

  const required = new Set(
    (definition.required as string[] | undefined) || []
  );

  const validators: Record<string, ValidatorFn> = {};

  for (const [key, prop] of Object.entries(properties)) {
    const path = prefix ? `${prefix}.${key}` : key;

    // Skip const fields — they're auto-filled
    if (prop.const !== undefined) continue;

    const isRequired = required.has(key);
    const type = prop.type as string | undefined;
    const ref = prop.$ref as string | undefined;

    if (isRequired && !ref && type !== 'object' && type !== 'array') {
      const minimum = prop.minimum as number | undefined;
      const maximum = prop.maximum as number | undefined;
      const pattern = prop.pattern as string | undefined;

      validators[path] = (value: unknown) => {
        if (value === undefined || value === null || value === '') {
          return 'This field is required';
        }
        if (
          (type === 'number' || type === 'integer') &&
          typeof value === 'number'
        ) {
          if (minimum !== undefined && value < minimum) {
            return `Must be at least ${minimum}`;
          }
          if (maximum !== undefined && value > maximum) {
            return `Must be at most ${maximum}`;
          }
        }
        if (type === 'string' && pattern && typeof value === 'string') {
          if (!new RegExp(pattern).test(value)) {
            return `Invalid format`;
          }
        }
        return null;
      };
    }

    // Recurse into $ref
    if (ref) {
      const resolved = resolveRef(ref, rootSchema);
      if (resolved && resolved.schema.type === 'object') {
        const nested = buildValidators(
          resolved.schema,
          rootSchema,
          path,
          depth + 1
        );
        Object.assign(validators, nested);
      }
    }

    // Recurse into inline objects
    if (type === 'object' && prop.properties) {
      const nested = buildValidators(prop, rootSchema, path, depth + 1);
      Object.assign(validators, nested);
    }
  }

  return validators;
}
