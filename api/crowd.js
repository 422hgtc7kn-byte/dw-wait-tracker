// api/crowd.js
// GET  /api/crowd?parkId=<mk|ep|hs|ak>   → hourly + per-DOW crowd averages
// POST /api/crowd                         → body: { parkId, avgWait, ts }
//
// Key scheme: crowd:<parkId>:<dow>:<hod>  → list of avg wait values (proxy for crowd level)

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const MAX_PER_SLOT = 20; // keep more readings for crowd (park-wide avg is more stable)

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

  // ── GET: return crowd trend for one park ──────────────────────────────────
  if (req.method === "GET") {
    const { parkId } = req.query;
    if (!parkId) return res.status(400).json({ error: "Missing parkId" });

    try {
      // 7 days × 24 hours = 168 keys
      const keys = [];
      for (let dow = 0; dow < 7; dow++)
        for (let hod = 0; hod < 24; hod++)
          keys.push({ key: `crowd:${parkId}:${dow}:${hod}`, dow, hod });

      const commands = keys.map(({ key }) => ["LRANGE", key, "0", String(MAX_PER_SLOT - 1)]);
      const results  = await redisPipeline(commands);

      // Aggregate: all-days hourly avg + per-DOW hourly avg
      const byHour    = Array.from({ length: 24 }, () => ({ sum: 0, count: 0 }));
      const byDowHour = Array.from({ length: 7 }, () =>
        Array.from({ length: 24 }, () => ({ sum: 0, count: 0 }))
      );

      results.forEach(({ result }, i) => {
        if (!result?.length) return;
        const { dow, hod } = keys[i];
        result.forEach(v => {
          const w = Number(v);
          if (isNaN(w)) return;
          byHour[hod].sum += w;    byHour[hod].count++;
          byDowHour[dow][hod].sum += w; byDowHour[dow][hod].count++;
        });
      });

      const hourlyAvg    = byHour.map(({ sum, count }) => count > 0 ? Math.round(sum / count) : null);
      const dowHourlyAvg = byDowHour.map(hours =>
        hours.map(({ sum, count }) => count > 0 ? Math.round(sum / count) : null)
      );
      const totalReadings = byHour.reduce((s, { count }) => s + count, 0);

      // Best hours = lowest avg crowd (top 3)
      const HOUR_LABELS = ["9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm","6pm","7pm","8pm","9pm","10pm"];
      const PARK_OPEN = 9;
      const bestHours = HOUR_LABELS
        .map((label, i) => ({ label, avg: hourlyAvg[PARK_OPEN + i] ?? null, hod: PARK_OPEN + i }))
        .filter(h => h.avg != null)
        .sort((a, b) => a.avg - b.avg)
        .slice(0, 3);

      return res.status(200).json({ parkId, hourlyAvg, dowHourlyAvg, bestHours, totalReadings });
    } catch (err) {
      console.error("Crowd GET error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST: store a crowd snapshot ──────────────────────────────────────────
  if (req.method === "POST") {
    try {
      const { parkId, avgWait, ts } = req.body;
      if (!parkId || avgWait == null) return res.status(400).json({ error: "parkId and avgWait required" });

      const d      = new Date(ts || Date.now());
      const etStr = new Date(ts || Date.now()).toLocaleString("en-US", { timeZone: "America/New_York", hour: "numeric", hour12: false }); const etHour = parseInt(etStr, 10);
      const dow = new Date(d.toLocaleString("en-US", { timeZone: "America/New_York" })).getDay();
      const key    = `crowd:${parkId}:${dow}:${etHour}`;

      await redisPipeline([
        ["LPUSH", key, String(Math.round(avgWait))],
        ["LTRIM", key, "0", String(MAX_PER_SLOT - 1)],
      ]);
      return res.status(200).json({ stored: true, parkId, etHour, dow });
    } catch (err) {
      console.error("Crowd POST error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
