// api/migrate.js
// ONE-TIME migration: copies old-format Redis keys into season-bucketed keys.
//
// Old key format:  wt:<rideId>:<dow>:<hour>
// New key format:  wt:<rideId>:<season>:<dow>:<hour>
//
// The app started April 30 2026. Between then and now (June 2026), data spans:
//   value  — Apr 30 – May 31
//   summer — Jun 1 – Jun 27
//   peak   — Jun 28+ (July 4th week)
//
// Since old keys have no per-entry timestamps, we distribute readings
// proportionally across only the seasons that were actually active,
// weighted by how many weeks of data each season contributed.
//
// Safe to call multiple times — LTRIM prevents unbounded growth —
// but ideally call once after deploying the season update.
//
// POST /api/migrate   Authorization: Bearer <COLLECT_SECRET>

import { SEASONS } from './season.js';

const PARKS    = ['mk', 'ep', 'hs', 'ak'];
const MAX_SLOT = 52;

// Seasons actually recorded during app lifetime (Apr 30 – present).
// Weighted by approximate weeks of data collected in each season.
// App ran every 30 min so ~336 snapshots/week.
const APP_START  = new Date('2026-04-30');
const NOW        = new Date('2026-06-23');

function getSeasonForDate(date) {
  const m  = date.getMonth() + 1;
  const dy = date.getDate();
  const md = m * 100 + dy;
  if (md >= 1215 || md <= 105) return 'peak';
  if (md >= 315  && md <= 415) return 'peak';
  if (md >= 628  && md <= 707) return 'peak';
  if (md >= 1122 && md <= 1130) return 'peak';
  if (m >= 6 && m <= 8) return 'summer';
  if (m === 9 || m === 10) return 'holiday';
  if (m === 11 && md < 1122) return 'holiday';
  if (md >= 1201 && md <= 1214) return 'holiday';
  return 'value';
}

// Walk day-by-day from app start to now, count weeks per season
function computeSeasonWeights() {
  const counts = { value: 0, holiday: 0, summer: 0, peak: 0 };
  const d = new Date(APP_START);
  while (d <= NOW) {
    counts[getSeasonForDate(d)]++;
    d.setDate(d.getDate() + 1);
  }
  const total = Object.values(counts).reduce((s, v) => s + v, 0);
  // Only include seasons that actually had data (count > 0)
  const active = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([season, days]) => ({ season, weight: days / total }));
  return active;
}

const ACTIVE_SEASONS = computeSeasonWeights();

async function redisCmd(command) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const res = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([command]),
  });
  if (!res.ok) throw new Error('Upstash error: ' + res.status);
  const data = await res.json();
  return data[0]?.result;
}

async function redisPipeline(commands) {
  if (!commands.length) return [];
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const res = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error('Upstash error: ' + res.status);
  return res.json();
}

function migrateKeys(keys, buildNewKey) {
  // Takes a list of old keys and returns write commands
  // Distributes readings proportionally across active seasons
  // e.g. if value=54 days, summer=23 days, peak=1 day out of 78 total:
  //   a 10-reading slot → 6 go to value, 3 to summer, 1 to peak
  return async function(batch, readResults) {
    const writeCmds = [];
    readResults.forEach(({ result }, idx) => {
      if (!result?.length) return;
      const key   = batch[idx];
      const parts = key.split(':');

      for (const { season, weight } of ACTIVE_SEASONS) {
        // Take a proportional slice of readings for this season
        const count    = Math.max(1, Math.round(result.length * weight));
        const slice    = result.slice(0, count);
        const newKey   = buildNewKey(parts, season);
        for (const val of slice) writeCmds.push(['LPUSH', newKey, String(val)]);
        writeCmds.push(['LTRIM', newKey, '0', String(MAX_SLOT - 1)]);
      }
    });
    return writeCmds;
  };
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const secret = process.env.COLLECT_SECRET;
  if (secret) {
    const auth = req.headers['authorization'] || '';
    if (auth !== `Bearer ${secret}`) return res.status(401).json({ error: 'Unauthorized' });
  }

  const stats = {
    activeSeasons: ACTIVE_SEASONS,
    rideKeysFound: 0, rideKeysMigrated: 0,
    crowdKeysFound: 0, crowdKeysMigrated: 0,
    errors: [],
  };

  const BATCH = 50;

  try {
    // ── 1. Migrate wt: keys ─────────────────────────────────────────────────
    let rideKeys = [];
    let cursor = '0';
    do {
      const result = await redisCmd(['SCAN', cursor, 'MATCH', 'wt:*', 'COUNT', '200']);
      cursor = Array.isArray(result) ? result[0] : '0';
      const keys = Array.isArray(result) ? result[1] : [];
      // Old: wt:<uuid>:<dow>:<hour> → 4 parts; New: wt:<uuid>:<season>:<dow>:<hour> → 5 parts
      rideKeys = rideKeys.concat(
        keys.filter(k => k.split(':').length === 4 && !SEASONS.includes(k.split(':')[2]))
      );
    } while (cursor !== '0');

    stats.rideKeysFound = rideKeys.length;

    for (let i = 0; i < rideKeys.length; i += BATCH) {
      const batch      = rideKeys.slice(i, i + BATCH);
      const readCmds   = batch.map(k => ['LRANGE', k, '0', String(MAX_SLOT - 1)]);
      const readResults = await redisPipeline(readCmds);
      const writeCmds  = await migrateKeys(batch, (parts, season) =>
        `wt:${parts[1]}:${season}:${parts[2]}:${parts[3]}`
      )(batch, readResults);
      if (writeCmds.length) await redisPipeline(writeCmds);
      stats.rideKeysMigrated += batch.length;
    }

    // ── 2. Migrate crowd: keys ───────────────────────────────────────────────
    let crowdKeys = [];
    cursor = '0';
    do {
      const result = await redisCmd(['SCAN', cursor, 'MATCH', 'crowd:*', 'COUNT', '200']);
      cursor = Array.isArray(result) ? result[0] : '0';
      const keys = Array.isArray(result) ? result[1] : [];
      // Old: crowd:<parkId>:<dow>:<hour> → 4 parts; New: 5 parts
      crowdKeys = crowdKeys.concat(
        keys.filter(k => k.split(':').length === 4 && !SEASONS.includes(k.split(':')[2]))
      );
    } while (cursor !== '0');

    stats.crowdKeysFound = crowdKeys.length;

    for (let i = 0; i < crowdKeys.length; i += BATCH) {
      const batch       = crowdKeys.slice(i, i + BATCH);
      const readCmds    = batch.map(k => ['LRANGE', k, '0', String(MAX_SLOT - 1)]);
      const readResults = await redisPipeline(readCmds);
      const writeCmds   = await migrateKeys(batch, (parts, season) =>
        `crowd:${parts[1]}:${season}:${parts[2]}:${parts[3]}`
      )(batch, readResults);
      if (writeCmds.length) await redisPipeline(writeCmds);
      stats.crowdKeysMigrated += batch.length;
    }

    return res.status(200).json({ ok: true, ...stats });

  } catch (err) {
    console.error('Migration error:', err);
    return res.status(500).json({ error: err.message, ...stats });
  }
}
