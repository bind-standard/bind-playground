import type { Bundle, BundleEntry } from './types';

export function getResourcesByType(
  bundle: Bundle,
  resourceType: string
): BundleEntry[] {
  return bundle.entry.filter(
    (e) => e.resource && (e.resource.resourceType as string) === resourceType
  );
}

export function buildReference(resource: Record<string, unknown>): {
  reference: string;
  display: string;
} {
  const type = (resource.resourceType as string) || 'Resource';
  const id = (resource.id as string) || 'unknown';
  const display = getResourceDisplay(resource);
  return {
    reference: `${type}/${id}`,
    display,
  };
}

export function getEntryFullUrl(entry: BundleEntry): string {
  if (entry.fullUrl) return entry.fullUrl;
  if (entry.resource) return buildReference(entry.resource).reference;
  return 'unknown';
}

export function getResourceDisplay(resource: Record<string, unknown>): string {
  const type = resource.resourceType as string;
  const id = resource.id as string;

  const name = resource.name as Record<string, unknown> | string | undefined;
  if (typeof name === 'string') return name;
  if (name && typeof name === 'object' && name.text)
    return name.text as string;

  const display = resource.display as string | undefined;
  if (display) return display;

  return `${type || 'Resource'}/${id || '?'}`;
}

export function getResourceSummary(bundle: Bundle): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const entry of bundle.entry) {
    if (!entry.resource) continue;
    const type = (entry.resource.resourceType as string) || 'Unknown';
    counts[type] = (counts[type] || 0) + 1;
  }
  return counts;
}
