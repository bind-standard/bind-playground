const EXCHANGE_URL = 'https://exchange.bind-standard.org/exchange';

export interface CreateExchangeRequest {
  payload: string;
  proof?: string;
  passcode?: string;
  label?: string;
  exp?: number;
}

export interface ExchangeResponse {
  url: string;
  exp: number;
  flag: string;
  passcode?: string;
  trusted: boolean;
  iss?: string;
}

export async function createExchange(
  request: CreateExchangeRequest,
): Promise<ExchangeResponse> {
  const body: Record<string, unknown> = { payload: request.payload };
  if (request.proof) body.proof = request.proof;
  if (request.passcode) body.passcode = request.passcode;
  if (request.label) body.label = request.label;
  if (request.exp) body.exp = request.exp;

  const res = await fetch(EXCHANGE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || `Exchange failed (${res.status})`);
  }

  return res.json() as Promise<ExchangeResponse>;
}
