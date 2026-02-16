import { getSchema, getResourceNames } from '@/lib/schemas/registry';
import { resolveRootRef } from '@/lib/schemas/ref-resolver';
import type { JSONSchema } from '@/lib/schemas/all-schemas';

export interface ValidationWarning {
  path: string;
  message: string;
}

const VALID_BUNDLE_TYPES = new Set([
  'document', 'message', 'transaction', 'transaction-response',
  'batch', 'batch-response', 'searchset', 'history', 'collection',
]);

const knownResourceTypes = new Set(getResourceNames());

/**
 * Validate a bundle object against the BIND schema.
 * Returns an array of warnings (not errors - signing still proceeds).
 */
export function validateBundle(bundle: Record<string, unknown>): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // Top-level structure
  if (bundle.resourceType !== 'Bundle') {
    warnings.push({
      path: 'resourceType',
      message: `Expected "Bundle" but got "${String(bundle.resourceType ?? 'undefined')}"`,
    });
  }

  if (!bundle.type) {
    warnings.push({ path: 'type', message: 'Missing required field "type"' });
  } else if (!VALID_BUNDLE_TYPES.has(bundle.type as string)) {
    warnings.push({ path: 'type', message: `Unknown bundle type "${String(bundle.type)}"` });
  }

  const entry = bundle.entry;
  if (!entry) {
    warnings.push({ path: 'entry', message: 'Missing "entry" array' });
    return warnings;
  }
  if (!Array.isArray(entry)) {
    warnings.push({ path: 'entry', message: '"entry" must be an array' });
    return warnings;
  }

  if (entry.length === 0) {
    warnings.push({ path: 'entry', message: 'Bundle has no entries' });
    return warnings;
  }

  // Validate each entry's resource
  for (let i = 0; i < entry.length; i++) {
    const e = entry[i] as Record<string, unknown> | undefined;
    if (!e || typeof e !== 'object') {
      warnings.push({ path: `entry[${i}]`, message: 'Invalid entry (not an object)' });
      continue;
    }

    const resource = e.resource as Record<string, unknown> | undefined;
    if (!resource || typeof resource !== 'object') {
      warnings.push({ path: `entry[${i}].resource`, message: 'Missing resource' });
      continue;
    }

    const rt = resource.resourceType as string | undefined;
    if (!rt) {
      warnings.push({ path: `entry[${i}].resource`, message: 'Missing resourceType' });
      continue;
    }

    if (!knownResourceTypes.has(rt)) {
      warnings.push({
        path: `entry[${i}].resource`,
        message: `Unknown resourceType "${rt}"`,
      });
      continue;
    }

    // Check required fields against schema
    const schema = getSchema(rt);
    if (schema) {
      const entryWarnings = validateResource(resource, rt, schema, `entry[${i}].resource`);
      warnings.push(...entryWarnings);
    }
  }

  return warnings;
}

function validateResource(
  resource: Record<string, unknown>,
  _resourceType: string,
  schema: JSONSchema,
  basePath: string,
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const root = resolveRootRef(schema);
  if (!root) return warnings;

  const def = root.schema;
  const required = (def.required as string[]) || [];
  const properties = def.properties as Record<string, Record<string, unknown>> | undefined;

  for (const field of required) {
    if (field === 'resourceType') continue; // already checked
    const value = resource[field];
    if (value === undefined || value === null || value === '') {
      // Get a hint about what the field expects
      const prop = properties?.[field];
      const hint = prop?.enum
        ? ` (one of: ${(prop.enum as string[]).slice(0, 4).join(', ')}${(prop.enum as string[]).length > 4 ? ', ...' : ''})`
        : '';
      warnings.push({
        path: `${basePath}.${field}`,
        message: `Required field "${field}" is missing${hint}`,
      });
    }
  }

  // Check enum values for fields that are present
  if (properties) {
    for (const [field, prop] of Object.entries(properties)) {
      const value = resource[field];
      if (value === undefined || value === null) continue;
      if (prop.enum && Array.isArray(prop.enum)) {
        if (!prop.enum.includes(value)) {
          warnings.push({
            path: `${basePath}.${field}`,
            message: `Invalid value "${String(value)}" for "${field}" (expected: ${(prop.enum as string[]).slice(0, 4).join(', ')}${(prop.enum as string[]).length > 4 ? ', ...' : ''})`,
          });
        }
      }
    }
  }

  return warnings;
}
