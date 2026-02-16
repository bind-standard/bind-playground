import { useQuery } from '@tanstack/react-query';
import { getTerminologyClient } from './client';

export function useCodeSystemList() {
  return useQuery({
    queryKey: ['terminology', 'list'],
    queryFn: () => getTerminologyClient().list(),
    staleTime: 1000 * 60 * 30,
  });
}

export function useCodeSystem(id: string) {
  return useQuery({
    queryKey: ['terminology', 'system', id],
    queryFn: () => getTerminologyClient().get(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 30,
  });
}

export function useTerminologySearch(query: string) {
  return useQuery({
    queryKey: ['terminology', 'search', query],
    queryFn: () => getTerminologyClient().search(query),
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}
