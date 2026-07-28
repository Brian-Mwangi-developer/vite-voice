/**
 * Talks to our own Express backend (see the sibling `voice` repo), not
 * Africa's Talking directly. The AT apiKey lives only on that server —
 * this app only ever receives a short-lived capability token.
 */
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

export interface CapabilityTokenData {
  clientName: string;
  incoming: boolean;
  outgoing: boolean;
  lifeTimeSec: string;
  token: string;
}

export async function fetchCapabilityToken(clientName: string): Promise<CapabilityTokenData> {
  const res = await fetch(`${BACKEND_URL}/api/voice/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientName }),
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(body.message ?? "Failed to fetch capability token");
  }

  return body.data as CapabilityTokenData;
}
