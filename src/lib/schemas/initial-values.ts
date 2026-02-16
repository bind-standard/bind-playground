import type { JSONSchema } from './all-schemas';
import { resolveRef } from './ref-resolver';

/**
 * Recursively builds empty initial form values from a JSON schema definition.
 */
export function buildInitialValues(
  definition: Record<string, unknown>,
  rootSchema: JSONSchema,
  depth = 0
): Record<string, unknown> {
  if (depth > 10) return {};

  const properties = definition.properties as
    | Record<string, Record<string, unknown>>
    | undefined;
  if (!properties) return {};

  const values: Record<string, unknown> = {};

  for (const [key, prop] of Object.entries(properties)) {
    if (prop.default !== undefined) {
      values[key] = prop.default;
      continue;
    }

    if (prop.const !== undefined) {
      values[key] = prop.const;
      continue;
    }

    const ref = prop.$ref as string | undefined;
    if (ref) {
      const resolved = resolveRef(ref, rootSchema);
      if (resolved) {
        values[key] = buildInitialValues(resolved.schema, rootSchema, depth + 1);
      } else {
        values[key] = {};
      }
      continue;
    }

    const type = prop.type as string | undefined;
    switch (type) {
      case 'string':
        values[key] = '';
        break;
      case 'number':
      case 'integer':
        values[key] = undefined;
        break;
      case 'boolean':
        values[key] = false;
        break;
      case 'array':
        values[key] = [];
        break;
      case 'object':
        values[key] = buildInitialValues(prop, rootSchema, depth + 1);
        break;
      default:
        values[key] = undefined;
    }
  }

  return values;
}
