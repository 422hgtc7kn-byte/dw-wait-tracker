// api/auth.js
// POST { action:"register", username, pin } → { ok, token, username }
// POST { action:"login",    username, pin } → { ok, token, username }
// POST { action:"verify",   token }         → { ok, username }

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function sha256(str) {
  const buf  = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,"0")).join("");
}

function randomToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2,"0")).join("");
}

async function redisGet(key) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const res   = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!data.result) return null;
  // result is already a string — parse once
  try { return JSON.parse(data.result); } catch { return data.result; }
}

async function redisSet(key, value) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  // Use pipeline SET so value is stored as a proper JSON string (single encode)
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([["SET", key, JSON.stringify(value)]]),
  });
  return res.json();
}

async function redisDel(key) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  await fetch(`${url}/del/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") { res.writeHead(204, CORS); return res.end(); }
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { action, username, pin, token } = req.body || {};

  // ── Verify token ──────────────────────────────────────────────────────────
  if (action === "verify") {
    if (!token) return res.status(400).json({ ok: false, error: "Token required" });
    const uname = await redisGet(`token:${token}`);
    if (!uname) return res.status(401).json({ ok: false, error: "Invalid token" });
    return res.status(200).json({ ok: true, username: uname });
  }

  // ── Register ──────────────────────────────────────────────────────────────
  if (action === "register") {
    if (!username || !pin) return res.status(400).json({ ok: false, error: "Username and PIN required" });
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (clean.length < 2) return res.status(400).json({ ok: false, error: "Username must be at least 2 characters" });
    if (!/^\d{4,8}$/.test(pin)) return res.status(400).json({ ok: false, error: "PIN must be 4–8 digits" });

    const existing = await redisGet(`user:${clean}`);
    if (existing) return res.status(409).json({ ok: false, error: "Username already taken" });

    const pinHash  = await sha256(pin + clean);
    const newToken = randomToken();
    await redisSet(`user:${clean}`, { username: clean, pinHash });
    await redisSet(`token:${newToken}`, clean);
    return res.status(200).json({ ok: true, token: newToken, username: clean });
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  if (action === "login") {
    if (!username || !pin) return res.status(400).json({ ok: false, error: "Username and PIN required" });
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    const user  = await redisGet(`user:${clean}`);
    if (!user || !user.pinHash) return res.status(401).json({ ok: false, error: "Invalid username or PIN" });

    const pinHash = await sha256(pin + clean);
    if (pinHash !== user.pinHash) return res.status(401).json({ ok: false, error: "Invalid username or PIN" });

    const newToken = randomToken();
    await redisSet(`token:${newToken}`, clean);
    return res.status(200).json({ ok: true, token: newToken, username: clean });
  }

  // ── Clear user (dev only — remove in production) ──────────────────────────
  if (action === "clear") {
    if (!username) return res.status(400).json({ ok: false, error: "Username required" });
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    await redisDel(`user:${clean}`);
    await redisDel(`profile:${clean}`);
    return res.status(200).json({ ok: true, cleared: clean });
  }

  return res.status(400).json({ ok: false, error: "Invalid action" });
}
