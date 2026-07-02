// api/crowd-calendar.js
// Supports both historical (past) and future (predicted) dates.
// For future dates, uses season-aware crowd predictions from real data
// blended with calibrated baselines per park + season.

import { getSeason, SEASONS } from './season.js';

const PARK_IDS = ["mk","ep","hs","ak","tl","bb"];
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

// Baseline avg waits by park + season + dow
// Derived from Disney historical patterns; used when real data is sparse.
// Format: [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
const BASELINES = {
  mk: {
    value:   [48, 38, 28, 26, 30, 36, 52],
    summer:  [62, 52, 44, 42, 48, 56, 68],
    holiday: [58, 48, 38, 36, 42, 50, 64],
    peak:    [82, 72, 64, 62, 68, 76, 88],
  },
  ep: {
    value:   [38, 30, 22, 20, 24, 30, 42],
    summer:  [52, 44, 36, 34, 40, 46, 58],
    holiday: [48, 40, 30, 28, 34, 42, 54],
    peak:    [70, 62, 54, 52, 58, 66, 76],
  },
  hs: {
    value:   [52, 42, 32, 30, 36, 44, 58],
    summer:  [66, 56, 48, 46, 52, 60, 72],
    holiday: [62, 52, 42, 40, 46, 54, 68],
    peak:    [86, 76, 68, 66, 72, 80, 92],
  },
  ak: {
    value:   [36, 28, 20, 18, 22, 28, 40],
    summer:  [48, 40, 32, 30, 36, 42, 54],
    holiday: [44, 36, 26, 24, 30, 38, 50],
    peak:    [62, 52, 44, 42, 48, 56, 68],
  },
  tl: {
    value:   [20, 16, 12, 12, 14, 18, 26],
    summer:  [38, 30, 24, 22, 28, 34, 46],
    holiday: [28, 22, 16, 14, 18, 24, 34],
    peak:    [52, 44, 36, 34, 40, 48, 60],
  },
  bb: {
    value:   [22, 18, 14, 12, 16, 20, 28],
    summer:  [40, 32, 26, 24, 30, 36, 48],
    holiday: [30, 24, 18, 16, 20, 26, 36],
    peak:    [54, 46, 38, 36, 42, 50, 62],
  },
};

// Seasonal multiplier vs baseline — used to scale real data to other seasons
const SEASON_MULTIPLIERS = { value: 0.72, summer: 0.92, holiday: 0.88, peak: 1.28 };

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

// Build per-DOW average from Redis for a given park + list of seasons to query
async function buildDowAvg(pid, seasonsToQuery) {
  const keys = [];
  for (const s of seasonsToQuery)
    for (let dow = 0; dow < 7; dow++)
      for (let hod = 9; hod <= 22; hod++) // park hours only
        keys.push({ key: `crowd:${pid}:${s}:${dow}:${hod}`, dow, hod, season: s });

  // Also include old-format keys as fallback
  const oldKeys = [];
  for (let dow = 0; dow < 7; dow++)
    for (let hod = 9; hod <= 22; hod++)
      oldKeys.push({ key: `crowd:${pid}:${dow}:${hod}`, dow, hod });

  const allKeys = [...keys, ...oldKeys];
  const responses = await redisPipeline(allKeys.map(({ key }) => ["LRANGE", key, "0", "51"]));

  const dowAvg = Array.from({ length: 7 }, () => ({ sum: 0, count: 0 }));
  responses.forEach(({ result: vals }, i) => {
    if (!vals?.length) return;
    const { dow } = allKeys[i];
    vals.forEach(v => {
      const w = Number(v);
      if (!isNaN(w)) { dowAvg[dow].sum += w; dowAvg[dow].count++; }
    });
  });
  return dowAvg;
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") { res.writeHead(204, CORS); return res.end(); }
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  const { parkId = "all", days = "30", startDate, endDate, mode = "past" } = req.query;
  const parks = parkId === "all" ? PARK_IDS : [parkId];

  try {
    const nowET = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));

    // ── Mode: trip prediction (future date range) ─────────────────────────────
    if (mode === "predict" && startDate && endDate) {
      const start = new Date(startDate + "T12:00:00");
      const end   = new Date(endDate   + "T12:00:00");
      if (isNaN(start) || isNaN(end) || end < start)
        return res.status(400).json({ error: "Invalid date range" });

      const result = {};
      for (const pid of parks) {
        const tripDays = [];
        const d = new Date(start);
        while (d <= end) {
          const season     = getSeason(d);
          const dow        = d.getDay();
          const dateStr    = d.toISOString().slice(0, 10);
          tripDays.push({ date: dateStr, dow, season });
          d.setDate(d.getDate() + 1);
        }

        // Get real data for all seasons present in the trip
        const tripSeasons = [...new Set(tripDays.map(td => td.season))];
        // Also pull all seasons so we can cross-reference sparse data
        const dowAvgBySeason = {};
        for (const s of SEASONS) {
          dowAvgBySeason[s] = await buildDowAvg(pid, [s]);
        }
        const dowAvgAll = await buildDowAvg(pid, SEASONS);

        const calendar = tripDays.map(({ date, dow, season }) => {
          const baseline   = BASELINES[pid][season][dow];
          const seasonData = dowAvgBySeason[season][dow];
          const allData    = dowAvgAll[dow];

          let avg, confidence, isReal = false;

          if (seasonData.count >= 5) {
            // Strong real data for this exact season+dow
            avg        = Math.round(seasonData.sum / seasonData.count);
            confidence = "high";
            isReal     = true;
          } else if (seasonData.count >= 2) {
            // Some real data — blend with baseline
            const realAvg = seasonData.sum / seasonData.count;
            avg        = Math.round(realAvg * 0.7 + baseline * 0.3);
            confidence = "medium";
            isReal     = true;
          } else if (allData.count >= 5) {
            // No season-specific data but have cross-season real data
            // Scale it using seasonal multipliers
            const crossAvg   = allData.sum / allData.count;
            const nowSeason  = getSeason(nowET);
            const scale      = SEASON_MULTIPLIERS[season] / SEASON_MULTIPLIERS[nowSeason];
            avg        = Math.round(crossAvg * scale * 0.6 + baseline * 0.4);
            confidence = "low";
          } else {
            // Pure baseline
            avg        = baseline;
            confidence = "estimated";
          }

          return { date, dow, season, avg, confidence, isReal };
        });

        result[pid] = calendar;
      }

      res.setHeader("Cache-Control", "s-maxage=3600");
      return res.status(200).json({ ok: true, mode: "predict", parks: result });
    }

    // ── Mode: past calendar (default) ─────────────────────────────────────────
    const numDays = Math.min(parseInt(days) || 30, 90);
    const result  = {};

    for (const pid of parks) {
      const dowAvg = await buildDowAvg(pid, SEASONS);
      const calendar = [];

      for (let i = numDays - 1; i >= 0; i--) {
        const d      = new Date(nowET);
        d.setDate(d.getDate() - i);
        const dow     = d.getDay();
        const dateStr = d.toISOString().slice(0, 10);
        const season  = getSeason(d);
        const { sum, count } = dowAvg[dow];
        const baseline = BASELINES[pid][season][dow];
        const isReal   = count >= 3;
        const avg      = isReal ? Math.round(sum / count) : baseline;
        calendar.push({ date: dateStr, dow, season, avg, isReal, confidence: isReal ? "high" : "estimated" });
      }
      result[pid] = calendar;
    }

    res.setHeader("Cache-Control", "s-maxage=300");
    return res.status(200).json({ ok: true, mode: "past", parks: result });

  } catch (err) {
    console.error("crowd-calendar error:", err);
    return res.status(500).json({ error: err.message });
  }
}
