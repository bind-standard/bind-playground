import type { Bundle, BundleAction } from './types';

export const emptyBundle: Bundle = {
  resourceType: 'Bundle',
  type: 'collection',
  entry: [],
};

function makeFullUrl(resource: Record<string, unknown>): string {
  const resourceType = (resource.resourceType as string) || 'Resource';
  const id = (resource.id as string) || `${resourceType}-${Date.now()}`;
  return `${resourceType}/${id}`;
}

export function bundleReducer(state: Bundle, action: BundleAction): Bundle {
  switch (action.type) {
    case 'ADD_RESOURCE': {
      const resource = { ...action.resource };
      if (!resource.id) {
        resource.id = `${resource.resourceType || 'Resource'}-${Date.now()}`;
      }
      const fullUrl = makeFullUrl(resource);
      return {
        ...state,
        entry: [...state.entry, { fullUrl, resource }],
      };
    }
    case 'UPDATE_RESOURCE': {
      const entry = [...state.entry];
      const resource = action.resource;
      const fullUrl = makeFullUrl(resource);
      entry[action.index] = { fullUrl, resource };
      return { ...state, entry };
    }
    case 'REMOVE_RESOURCE': {
      return {
        ...state,
        entry: state.entry.filter((_, i) => i !== action.index),
      };
    }
    case 'CLEAR':
      return emptyBundle;
    case 'IMPORT':
      return action.bundle;
    default:
      return state;
  }
}
