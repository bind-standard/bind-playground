export interface BundleEntry {
  fullUrl?: string;
  resource: Record<string, unknown>;
  search?: {
    mode?: 'match' | 'include';
    score?: number;
  };
  request?: {
    method: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    ifNoneMatch?: string;
    ifModifiedSince?: string;
    ifMatch?: string;
    ifNoneExist?: string;
  };
  response?: {
    status: string;
    location?: string;
    etag?: string;
    lastModified?: string;
  };
}

export type BundleType =
  | 'document'
  | 'message'
  | 'transaction'
  | 'transaction-response'
  | 'batch'
  | 'batch-response'
  | 'searchset'
  | 'history'
  | 'collection';

export interface Bundle {
  resourceType: 'Bundle';
  id?: string;
  type: BundleType;
  timestamp?: string;
  total?: number;
  link?: { relation: string; url: string }[];
  entry: BundleEntry[];
}

export type BundleAction =
  | { type: 'ADD_RESOURCE'; resource: Record<string, unknown> }
  | {
      type: 'UPDATE_RESOURCE';
      index: number;
      resource: Record<string, unknown>;
    }
  | { type: 'REMOVE_RESOURCE'; index: number }
  | { type: 'CLEAR' }
  | { type: 'IMPORT'; bundle: Bundle };
