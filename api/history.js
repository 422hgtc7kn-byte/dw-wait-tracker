// api/history.js
// GET  /api/history?rideId=<id>&season=<value|holiday|summer|peak>
// Returns hourly averages for that ride, filtered by season.
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
    const { rideId, season } = req.query;
    if (!rideId) return res.status(400).json({ error: 'Missing rideId' });

    const seasonsToQuery = (season && SEASONS.includes(season)) ? [season] : SEASONS;

    try {
      const keys = [];
      for (const s of seasonsToQuery)
        for (let dow = 0; dow < 7; dow++)
          for (let hod = 0; hod < 24; hod++)
            keys.push({ key: `wt:${rideId}:${s}:${dow}:${hod}`, season: s, dow, hod });

      const commands = keys.map(({ key }) => ['LRANGE', key, '0', String(MAX_PER_SLOT - 1)]);
      const results  = await redisPipeline(commands);

      const byHour    = Array.from({ length: 24 }, () => ({ sum: 0, count: 0 }));
      const byDowHour = Array.from({ length: 7 }, () =>
        Array.from({ length: 24 }, () => ({ sum: 0, count: 0 }))
      );
      const bySeason  = Object.fromEntries(SEASONS.map(s => [s, 0]));

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

      const hourlyAvg    = byHour.map(({ sum, count }) => count > 0 ? Math.round(sum / count) : null);
      const dowHourlyAvg = byDowHour.map(hours =>
        hours.map(({ sum, count }) => count > 0 ? Math.round(sum / count) : null)
      );
      const totalReadings = byHour.reduce((s, { count }) => s + count, 0);

      const nowET     = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const nowSeason = getSeason(nowET);

      return res.status(200).json({
        rideId, season: season || 'all', nowSeason,
        hourlyAvg, dowHourlyAvg, bySeason, totalReadings,
      });
    } catch (err) {
      console.error('History GET error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { snapshots } = req.body;
      if (!Array.isArray(snapshots) || !snapshots.length)
        return res.status(400).json({ error: 'snapshots array required' });

      const commands = [];
      for (const { id, wait, ts } of snapshots) {
        if (wait == null || typeof wait !== 'number') continue;
        const etNow  = new Date(new Date(ts || Date.now()).toLocaleString('en-US', { timeZone: 'America/New_York' }));
        const etHour = etNow.getHours();
        const dow    = etNow.getDay();
        const season = getSeason(etNow);
        const key    = `wt:${id}:${season}:${dow}:${etHour}`;
        commands.push(['LPUSH', key, String(wait)]);
        commands.push(['LTRIM', key, '0', String(MAX_PER_SLOT - 1)]);
      }
      if (commands.length) await redisPipeline(commands);
      return res.status(200).json({ stored: snapshots.length });
    } catch (err) {
      console.error('History POST error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
