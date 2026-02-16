import { TerminologyClient } from '@bind-insurance/sdk/terminology';

let instance: TerminologyClient | null = null;

export function getTerminologyClient(): TerminologyClient {
  if (!instance) {
    instance = new TerminologyClient();
  }
  return instance;
}
