// api/history.js
// GET  /api/history?rideId=<id>&dow=<0-6>   → hourly averages for that ride+day (or all days if no dow)
// POST /api/history                          → body: { snapshots: [{id, wait, ts}] }

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const MAX_PER_SLOT = 10;

async function redisPipeline(commands) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Upstash env vars not set");
  const res = await fetch(url + "/pipeline", {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error("Upstash error: " + res.status);
  return res.json();
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") { res.writeHead(204, CORS); return res.end(); }
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "GET") {
    const { rideId, dow } = req.query;
    if (!rideId) return res.status(400).json({ error: "Missing rideId" });

    try {
      const dowFilter = dow != null ? [parseInt(dow)] : [0,1,2,3,4,5,6];

      // Build keys for requested day(s) × 24 hours
      const keys = [];
      for (const d of dowFilter)
        for (let hod = 0; hod < 24; hod++)
          keys.push({ key: `wt:${rideId}:${d}:${hod}`, d, hod });

      const commands = keys.map(({ key }) => ["LRANGE", key, "0", String(MAX_PER_SLOT - 1)]);
      const results  = await redisPipeline(commands);

      // Aggregate into per-hour averages (collapsed across days)
      const byHour = Array.from({ length: 24 }, () => ({ sum: 0, count: 0 }));
      // Also build per-dow per-hour for the full picture
      const byDowHour = Array.from({ length: 7 }, () =>
        Array.from({ length: 24 }, () => ({ sum: 0, count: 0 }))
      );

      results.forEach(({ result }, i) => {
        if (!result?.length) return;
        const { d, hod } = keys[i];
        result.forEach(v => {
          const w = Number(v);
          if (isNaN(w)) return;
          byHour[hod].sum   += w; byHour[hod].count++;
          byDowHour[d][hod].sum += w; byDowHour[d][hod].count++;
        });
      });

      const hourlyAvg = byHour.map(({ sum, count }) => count > 0 ? Math.round(sum / count) : null);
      // Per-DOW: 7 arrays of 24 nullable numbers
      const dowHourlyAvg = byDowHour.map(hours =>
        hours.map(({ sum, count }) => count > 0 ? Math.round(sum / count) : null)
      );
      const totalReadings = byHour.reduce((s, { count }) => s + count, 0);

      return res.status(200).json({ rideId, hourlyAvg, dowHourlyAvg, totalReadings });
    } catch (err) {
      console.error("Redis GET error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "POST") {
    try {
      const { snapshots } = req.body;
      if (!Array.isArray(snapshots) || !snapshots.length)
        return res.status(400).json({ error: "snapshots array required" });

      const commands = [];
      for (const { id, wait, ts } of snapshots) {
        if (wait == null || typeof wait !== "number") continue;
        const d      = new Date(ts || Date.now());
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
