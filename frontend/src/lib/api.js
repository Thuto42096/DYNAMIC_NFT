// Thin client for the Express API in scripts/server.js.
// The server listens on localhost:3000 with open CORS.
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

// Must match SIGN_IN_MESSAGE in scripts/server.js exactly.
export const SIGN_IN_MESSAGE =
  "Welcome to the Club! Please sign this message to verify your wallet ownership.";

export async function verifyNft({ walletAddress, signature }) {
  const res = await fetch(`${API_BASE}/verify-nft`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress, signature }),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, ...data };
}

export async function mintNft({ walletAddress, signature }) {
  const res = await fetch(`${API_BASE}/mint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress, signature }),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, ...data };
}
