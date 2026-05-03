// api/profile.js
// GET  /api/profile          → returns profile for token in Authorization header
// POST /api/profile          → saves profile for token in Authorization header
//
// Profile stored as: profile:<username> → { favorites, alerts, hidden, dark, sortBy }

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function redisGet(key) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const res   = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.result ? JSON.parse(data.result) : null;
}

async function redisSet(key, value) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  await fetch(`${url}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(JSON.stringify(value)),
  });
}

async function getUsernameFromToken(authHeader) {
  const token = (authHeader || "").replace("Bearer ", "").trim();
  if (!token) return null;
  return await redisGet(`token:${token}`);
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") { res.writeHead(204, CORS); return res.end(); }
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  const username = await getUsernameFromToken(req.headers.authorization);
  if (!username) return res.status(401).json({ error: "Unauthorized" });

  // ── GET: load profile ─────────────────────────────────────────────────────
  if (req.method === "GET") {
    const profile = await redisGet(`profile:${username}`) || {};
    return res.status(200).json({ ok: true, username, profile });
  }

  // ── POST: save profile ────────────────────────────────────────────────────
  if (req.method === "POST") {
    const { favorites, alerts, hidden, dark, sortBy } = req.body || {};
    const profile = { favorites: favorites||{}, alerts: alerts||{}, hidden: hidden||{}, dark: dark||false, sortBy: sortBy||"wait_asc", updatedAt: Date.now() };
    await redisSet(`profile:${username}`, profile);
    return res.status(200).json({ ok: true, username, profile });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
