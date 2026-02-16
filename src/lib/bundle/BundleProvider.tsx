import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from 'react';
import type { Bundle, BundleAction } from './types';
import { bundleReducer, emptyBundle } from './reducer';

const STORAGE_KEY = 'bind-playground-bundle';

interface BundleContextValue {
  bundle: Bundle;
  dispatch: React.Dispatch<BundleAction>;
}

const BundleContext = createContext<BundleContextValue | null>(null);

function loadBundle(): Bundle {
  if (typeof window === 'undefined') return emptyBundle;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Bundle;
      if (parsed.resourceType === 'Bundle' && Array.isArray(parsed.entry)) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return emptyBundle;
}

export function BundleProvider({ children }: { children: ReactNode }) {
  const [bundle, dispatch] = useReducer(bundleReducer, emptyBundle, loadBundle);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bundle));
    } catch {
      // ignore
    }
  }, [bundle]);

  return (
    <BundleContext.Provider value={{ bundle, dispatch }}>
      {children}
    </BundleContext.Provider>
  );
}

export function useBundle(): BundleContextValue {
  const ctx = useContext(BundleContext);
  if (!ctx) {
    throw new Error('useBundle must be used within BundleProvider');
  }
  return ctx;
}
