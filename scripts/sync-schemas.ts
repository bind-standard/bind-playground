import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BIND_STANDARD_DIR = path.resolve(__dirname, '../../bind-standard/schemas');
const BIND_STANDARD_TYPES_DIR = path.resolve(__dirname, '../../bind-standard/src/types');
const OUTPUT_FILE = path.resolve(
  __dirname,
  '../src/lib/schemas/all-schemas.ts'
);

interface SchemaEntry {
  name: string;
  schema: string;
  uri: string;
}

interface SchemaIndex {
  resources: SchemaEntry[];
  supporting: SchemaEntry[];
}

interface TerminologyBinding {
  interfaceName: string;
  propertyName: string;
  system: string; // code system ID (e.g., "line-of-business")
  binding: string; // "preferred" | "extensible"
}

/**
 * Parse @terminology annotations from TypeScript source files.
 * Pattern: `@terminology https://bind.codes/{system-id} {binding}`
 * followed by a property declaration on the next non-comment line.
 */
function extractTerminologyBindings(typesDir: string): TerminologyBinding[] {
  const bindings: TerminologyBinding[] = [];

  if (!fs.existsSync(typesDir)) {
    console.warn(`Types directory not found: ${typesDir}, skipping terminology extraction`);
    return bindings;
  }

  const files = fs.readdirSync(typesDir).filter((f) => f.endsWith('.ts'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(typesDir, file), 'utf-8');
    const lines = content.split('\n');

    let currentInterface: string | null = null;
    let pendingTerminology: { system: string; binding: string } | null = null;

    for (const line of lines) {
      // Track current interface/type
      const interfaceMatch = line.match(/export\s+(?:interface|type)\s+(\w+)/);
      if (interfaceMatch) {
        currentInterface = interfaceMatch[1];
      }

      // Detect @terminology annotation
      const terminologyMatch = line.match(
        /@terminology\s+https:\/\/bind\.codes\/([^\s]+)\s+(preferred|extensible)/
      );
      if (terminologyMatch) {
        pendingTerminology = {
          system: terminologyMatch[1],
          binding: terminologyMatch[2],
        };
        continue;
      }

      // If we have a pending @terminology, look for the property name
      if (pendingTerminology && currentInterface) {
        const propMatch = line.match(/^\s+(\w+)[\?:]?\s*:/);
        if (propMatch) {
          bindings.push({
            interfaceName: currentInterface,
            propertyName: propMatch[1],
            system: pendingTerminology.system,
            binding: pendingTerminology.binding,
          });
          pendingTerminology = null;
        }
        // Reset if we hit a non-comment, non-empty, non-property line
        if (line.trim() && !line.trim().startsWith('*') && !line.trim().startsWith('//') && !line.trim().startsWith('/**') && !line.trim().startsWith('*/') && !propMatch) {
          pendingTerminology = null;
        }
      }
    }
  }

  return bindings;
}

/**
 * Inject x-terminology into JSON schema properties based on extracted bindings.
 */
function injectTerminologyBindings(
  schema: Record<string, unknown>,
  bindings: TerminologyBinding[]
): void {
  const definitions = schema.definitions as Record<string, Record<string, unknown>> | undefined;
  if (!definitions) return;

  // Build a lookup: "InterfaceName.propertyName" → binding
  const lookup = new Map<string, TerminologyBinding>();
  for (const b of bindings) {
    lookup.set(`${b.interfaceName}.${b.propertyName}`, b);
  }

  for (const [defName, def] of Object.entries(definitions)) {
    const properties = def.properties as Record<string, Record<string, unknown>> | undefined;
    if (!properties) continue;

    for (const [propName, propSchema] of Object.entries(properties)) {
      const key = `${defName}.${propName}`;
      const binding = lookup.get(key);
      if (binding) {
        propSchema['x-terminology'] = {
          system: binding.system,
          binding: binding.binding,
        };
      }
    }
  }
}

function main() {
  const indexPath = path.join(BIND_STANDARD_DIR, 'index.json');
  const index: SchemaIndex = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

  // Extract @terminology annotations from TypeScript source
  const bindings = extractTerminologyBindings(BIND_STANDARD_TYPES_DIR);
  console.log(`Extracted ${bindings.length} terminology bindings from TypeScript source`);

  const schemas: Record<string, unknown> = {};

  for (const entry of [...index.resources, ...index.supporting]) {
    const schemaPath = path.join(BIND_STANDARD_DIR, entry.schema);
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

    // Inject terminology bindings into schema properties
    injectTerminologyBindings(schema as Record<string, unknown>, bindings);

    schemas[entry.name] = schema;
  }

  const resourceNames = index.resources.map((r) => r.name);
  const supportingNames = index.supporting.map((s) => s.name);

  const output = `// Auto-generated by scripts/sync-schemas.ts — do not edit manually
/* eslint-disable */

export type JSONSchema = Record<string, unknown>;

export const allSchemas: Record<string, JSONSchema> = ${JSON.stringify(schemas, null, 2)} as unknown as Record<string, JSONSchema>;

export const resourceNames: string[] = ${JSON.stringify(resourceNames)};

export const supportingNames: string[] = ${JSON.stringify(supportingNames)};
`;

  const outDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');
  console.log(
    `Synced ${Object.keys(schemas).length} schemas to ${OUTPUT_FILE}`
  );
}

main();
