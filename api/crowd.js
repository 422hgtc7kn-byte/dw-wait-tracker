// api/crowd.js
// GET  /api/crowd?parkId=<mk|ep|hs|ak>&season=<value|holiday|summer|peak>
// Returns hourly + per-DOW crowd averages for the requested season.
// Falls back to all-season data if season param is omitted.

import { getSeason, SEASONS } from './season.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const MAX_PER_SLOT = 52;

async function redisPipeline(commands) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Upstash env vars not set');
  const res = await fetch(url + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error('Upstash error: ' + res.status);
  return res.json();
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'GET') {
    const { parkId, season } = req.query;
    if (!parkId) return res.status(400).json({ error: 'Missing parkId' });

    // Which seasons to query — specific season or all
    const seasonsToQuery = (season && SEASONS.includes(season)) ? [season] : SEASONS;

    try {
      const keys = [];
      for (const s of seasonsToQuery)
        for (let dow = 0; dow < 7; dow++)
          for (let hod = 0; hod < 24; hod++)
            keys.push({ key: `crowd:${parkId}:${s}:${dow}:${hod}`, season: s, dow, hod });

      const commands = keys.map(({ key }) => ['LRANGE', key, '0', String(MAX_PER_SLOT - 1)]);
      const results  = await redisPipeline(commands);

      const byHour    = Array.from({ length: 24 }, () => ({ sum: 0, count: 0 }));
      const byDowHour = Array.from({ length: 7 }, () =>
        Array.from({ length: 24 }, () => ({ sum: 0, count: 0 }))
      );
      const bySeason = Object.fromEntries(SEASONS.map(s => [s, 0]));

      results.forEach(({ result }, i) => {
        if (!result?.length) return;
        const { season: s, dow, hod } = keys[i];
        result.forEach(v => {
          const w = Number(v);
          if (isNaN(w)) return;
          byHour[hod].sum += w;         byHour[hod].count++;
          byDowHour[dow][hod].sum += w; byDowHour[dow][hod].count++;
          bySeason[s]++;
        });
      });

      // Fallback: also read old-format keys (no season segment) if new data is sparse
      const totalNew = byHour.reduce((s, { count }) => s + count, 0);
      if (totalNew < 50) {
        const oldKeys = [];
        for (let dow = 0; dow < 7; dow++)
          for (let hod = 0; hod < 24; hod++)
            oldKeys.push({ key: `crowd:${parkId}:${dow}:${hod}`, dow, hod });
        const oldCmds    = oldKeys.map(({ key }) => ['LRANGE', key, '0', String(MAX_PER_SLOT - 1)]);
        const oldResults = await redisPipeline(oldCmds);
        oldResults.forEach(({ result }, i) => {
          if (!result?.length) return;
          const { dow, hod } = oldKeys[i];
          result.forEach(v => {
            const w = Number(v);
            if (isNaN(w)) return;
            byHour[hod].sum += w;         byHour[hod].count++;
            byDowHour[dow][hod].sum += w; byDowHour[dow][hod].count++;
          });
        });
      }

      const hourlyAvg    = byHour.map(({ sum, count }) => count > 0 ? Math.round(sum / count) : null);
      const dowHourlyAvg = byDowHour.map(hours =>
        hours.map(({ sum, count }) => count > 0 ? Math.round(sum / count) : null)
      );
      const totalReadings = byHour.reduce((s, { count }) => s + count, 0);

      // Determine current season for the frontend
      const nowET      = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const nowSeason  = getSeason(nowET);

      return res.status(200).json({
        parkId, season: season || 'all', nowSeason,
        hourlyAvg, dowHourlyAvg, bySeason, totalReadings,
      });
    } catch (err) {
      console.error('Crowd GET error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { parkId, avgWait, ts } = req.body;
      if (!parkId || avgWait == null) return res.status(400).json({ error: 'parkId and avgWait required' });

      const etNow  = new Date(new Date(ts || Date.now()).toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const etHour = etNow.getHours();
      const dow    = etNow.getDay();
      const season = getSeason(etNow);
      const key    = `crowd:${parkId}:${season}:${dow}:${etHour}`;

      await redisPipeline([
        ['LPUSH', key, String(Math.round(avgWait))],
        ['LTRIM', key, '0', String(MAX_PER_SLOT - 1)],
      ]);
      return res.status(200).json({ stored: true, parkId, etHour, dow, season });
    } catch (err) {
      console.error('Crowd POST error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
