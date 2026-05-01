// api/history.js
// GET  /api/history?rideId=<id>   → hourly trend averages for that ride
// POST /api/history               → body: { snapshots: [{id, wait, ts}] }
//
// Uses Upstash Redis via HTTP (no SDK needed — just fetch + env vars).
// Set these in Vercel environment variables:
//   UPSTASH_REDIS_REST_URL
//   UPSTASH_REDIS_REST_TOKEN

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const MAX_PER_SLOT = 10;

async function redis(command) {
  const url  = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Upstash env vars not set");
  const res = await fetch(`${url}/${command.map(encodeURIComponent).join("/")}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.result;
}

async function redisPipeline(commands) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Upstash env vars not set");
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
  });
  return await res.json();
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") { res.writeHead(204, CORS); return res.end(); }
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  // ── GET: return trend data for one ride ───────────────────────────────────
  if (req.method === "GET") {
    const { rideId } = req.query;
    if (!rideId) return res.status(400).json({ error: "Missing rideId" });

    try {
      // Build all 168 keys (7 days × 24 hours)
      const keys = [];
      for (let dow = 0; dow < 7; dow++)
        for (let hod = 0; hod < 24; hod++)
          keys.push(`wt:${rideId}:${dow}:${hod}`);

      // Fetch all in one pipeline
      const commands = keys.map(k => ["LRANGE", k, "0", String(MAX_PER_SLOT - 1)]);
      const results  = await redisPipeline(commands);

      // Aggregate across all days into per-hour averages
      const byHour = Array.from({ length: 24 }, () => ({ sum: 0, count: 0 }));
      results.forEach(({ result }, i) => {
        if (!result?.length) return;
        const hod = i % 24;
        result.forEach(v => {
          const w = Number(v);
          if (!isNaN(w)) { byHour[hod].sum += w; byHour[hod].count++; }
        });
      });

      const hourlyAvg = byHour.map(({ sum, count }) => count > 0 ? Math.round(sum / count) : null);
      const totalReadings = byHour.reduce((s, { count }) => s + count, 0);

      return res.status(200).json({ rideId, hourlyAvg, totalReadings });
    } catch (err) {
      console.error("Redis GET error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST: store a batch of snapshots ─────────────────────────────────────
  if (req.method === "POST") {
    try {
      const { snapshots } = req.body;
      if (!Array.isArray(snapshots) || !snapshots.length)
        return res.status(400).json({ error: "snapshots array required" });

      const commands = [];
      for (const { id, wait, ts } of snapshots) {
        if (wait == null || typeof wait !== "number") continue;
        const d = new Date(ts || Date.now());
        const etHour = ((d.getUTCHours() - 5) + 24) % 24;
        const dow    = d.getUTCDay();
        const key    = `wt:${id}:${dow}:${etHour}`;
        commands.push(["LPUSH", key, String(wait)]);
        commands.push(["LTRIM", key, "0", String(MAX_PER_SLOT - 1)]);
      }

      if (commands.length) await redisPipeline(commands);
      return res.status(200).json({ stored: snapshots.length });
    } catch (err) {
      console.error("Redis POST error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
