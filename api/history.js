// api/history.js
// GET  /api/history?rideId=<id>          → returns stored snapshots for that ride
// POST /api/history                       → body: { parkId, snapshots: [{id,name,wait,ts}] }
//
// Snapshots are bucketed by hour-of-day (0-23) and day-of-week (0=Sun…6=Sat).
// We keep up to 10 readings per (rideId, dow, hod) slot → rolling average.
// Vercel KV key scheme:  wt:<rideId>:<dow>:<hod>  → JSON array of wait values

import { kv } from "@vercel/kv";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const MAX_PER_SLOT = 10; // readings to keep per slot

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS);
    return res.end();
  }

  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  // ── GET: return trend data for one ride ───────────────────────────────────
  if (req.method === "GET") {
    const { rideId } = req.query;
    if (!rideId) return res.status(400).json({ error: "Missing rideId" });

    try {
      // Fetch all 7 days × 24 hours = 168 keys in parallel (batched)
      const keys = [];
      for (let dow = 0; dow < 7; dow++)
        for (let hod = 0; hod < 24; hod++)
          keys.push(`wt:${rideId}:${dow}:${hod}`);

      // KV mget supports up to 256 keys at once
      const values = await kv.mget(...keys);

      // Build a 24-element array of averaged wait times (null if no data)
      // We collapse across all days-of-week for the "typical day" view
      // and also return per-dow data for future use
      const byHour = Array.from({ length: 24 }, () => ({ sum: 0, count: 0 }));

      values.forEach((val, i) => {
        if (!val) return;
        const readings = Array.isArray(val) ? val : [];
        const hod = i % 24;
        readings.forEach(w => {
          byHour[hod].sum += w;
          byHour[hod].count++;
        });
      });

      const hourlyAvg = byHour.map(({ sum, count }) =>
        count > 0 ? Math.round(sum / count) : null
      );

      return res.status(200).json({ rideId, hourlyAvg, totalReadings: values.reduce((s, v) => s + (v?.length || 0), 0) });
    } catch (err) {
      console.error("KV GET error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST: store a batch of snapshots ─────────────────────────────────────
  if (req.method === "POST") {
    try {
      const { snapshots } = req.body; // [{ id, wait, ts }]
      if (!Array.isArray(snapshots) || snapshots.length === 0)
        return res.status(400).json({ error: "snapshots array required" });

      const pipeline = kv.pipeline();

      for (const { id, wait, ts } of snapshots) {
        if (wait == null || typeof wait !== "number") continue;
        const d = new Date(ts || Date.now());
        // Park hours are Eastern; shift UTC → ET (approx, handles DST roughly)
        const etOffset = -5; // EST; during EDT this is off by 1h — acceptable for trend bucketing
        const etHour = ((d.getUTCHours() + etOffset) + 24) % 24;
        const dow = d.getUTCDay();
        const key = `wt:${id}:${dow}:${etHour}`;

        // Push to list, trim to MAX_PER_SLOT
        pipeline.lpush(key, wait);
        pipeline.ltrim(key, 0, MAX_PER_SLOT - 1);
      }

      await pipeline.exec();
      return res.status(200).json({ stored: snapshots.length });
    } catch (err) {
      console.error("KV POST error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
