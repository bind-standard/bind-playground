import type { JSONSchema } from './all-schemas';

export interface ResolvedRef {
  name: string;
  schema: Record<string, unknown>;
}

/**
 * Resolves a `$ref` like `#/definitions/Coding` within a schema's definitions block.
 */
export function resolveRef(
  ref: string,
  schema: JSONSchema
): ResolvedRef | undefined {
  if (!ref.startsWith('#/definitions/')) return undefined;
  const name = ref.replace('#/definitions/', '');
  const definitions = schema.definitions as
    | Record<string, Record<string, unknown>>
    | undefined;
  if (!definitions || !definitions[name]) return undefined;
  return { name, schema: definitions[name] };
}

/**
 * Given a schema that has a top-level `$ref`, resolve it to get the root definition.
 */
export function resolveRootRef(
  schema: JSONSchema
): ResolvedRef | undefined {
  const ref = schema.$ref as string | undefined;
  if (!ref) return undefined;
  return resolveRef(ref, schema);
}

/**
 * Gets all definitions from a schema.
 */
export function getDefinitions(
  schema: JSONSchema
): Record<string, Record<string, unknown>> {
  return (schema.definitions as Record<string, Record<string, unknown>>) || {};
}
