import {
  allSchemas,
  resourceNames,
  supportingNames,
  type JSONSchema,
} from './all-schemas';

export function getSchema(name: string): JSONSchema | undefined {
  return allSchemas[name];
}

export function getResourceSchemas(): Map<string, JSONSchema> {
  const map = new Map<string, JSONSchema>();
  for (const name of resourceNames) {
    const schema = allSchemas[name];
    if (schema) map.set(name, schema);
  }
  return map;
}

export function getSupportingSchemas(): Map<string, JSONSchema> {
  const map = new Map<string, JSONSchema>();
  for (const name of supportingNames) {
    const schema = allSchemas[name];
    if (schema) map.set(name, schema);
  }
  return map;
}

export function getResourceNames(): string[] {
  return [...resourceNames];
}

export function getSupportingNames(): string[] {
  return [...supportingNames];
}

export function getAllSchemaNames(): string[] {
  return [...resourceNames, ...supportingNames];
}
