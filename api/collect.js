// api/collect.js
// Called by Upstash QStash every 30 minutes via HTTP POST
// Fetches all 4 parks and stores wait times + crowd levels in Upstash Redis
// Keys include season so like-for-like comparisons are accurate.

import { getSeason } from './season.js';

const PARKS = {
  mk: '75ea578a-adc8-4116-a54d-dccb60765ef9',
  ep: '47f90d2c-e191-4239-a466-5892ef59a88b',
  hs: '288747d1-8b4f-4a64-867e-ea7c9b27bad8',
  ak: '1c84a229-8862-4648-9c71-378ddd2c7693',
};

const SHOW_KEYWORDS = [
  'show','theater','theatre','film','movie','presentation','stage','performance',
  'symphony','philharmagic','enchantment','firework','parade','nighttime',
  'happily ever after','epcot forever','luminous','indiana jones',
  'beauty and the beast','frozen sing','lion king','finding nemo','animation','turtle talk'
];

function isShow(entity) {
  if (entity.entityType === 'SHOW') return true;
  const n = (entity.name || '').toLowerCase();
  return SHOW_KEYWORDS.some(k => n.includes(k));
}

async function redisPipeline(commands) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Missing Upstash env vars');
  const res = await fetch(url + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error('Upstash error: ' + res.status);
  return res.json();
}

const DOWNTIME_ACTIVE_KEY  = 'downtime:active';
const DOWNTIME_HISTORY_KEY = 'downtime:history';
const MAX_HISTORY_PER_RIDE = 15;

// Detects DOWN/CLOSED transitions across all attractions (not just OPERATING
// ones) and persists them in Redis, so an outage's start time is captured the
// first time this job runs after it happens — regardless of whether anyone
// has the app open.
async function updateDowntimes(allRidesByPark) {
  const now = Date.now();
  const [activeRes, historyRes] = await redisPipeline([
    ['GET', DOWNTIME_ACTIVE_KEY],
    ['GET', DOWNTIME_HISTORY_KEY],
  ]);

  let active  = {};
  let history = {};
  try { active  = activeRes?.result  ? JSON.parse(activeRes.result)  : {}; } catch { active  = {}; }
  try { history = historyRes?.result ? JSON.parse(historyRes.result) : {}; } catch { history = {}; }

  let changed = false;

  for (const [parkKey, rides] of Object.entries(allRidesByPark)) {
    for (const ride of rides) {
      const isDown = ride.status === 'DOWN' || ride.status === 'CLOSED';
      const prev   = active[ride.id];

      if (isDown && !prev) {
        active[ride.id] = { name: ride.name, parkId: parkKey, since: now, status: ride.status };
        changed = true;
      } else if (isDown && prev && ride.status !== prev.status) {
        active[ride.id] = { ...prev, status: ride.status };
        changed = true;
      } else if (!isDown && prev) {
        const mins  = Math.round((now - prev.since) / 60000);
        const entry = { since: prev.since, until: now, status: prev.status, mins };
        history[ride.id] = [entry, ...(history[ride.id] || [])].slice(0, MAX_HISTORY_PER_RIDE);
        delete active[ride.id];
        changed = true;
      }
    }
  }

  if (changed) {
    await redisPipeline([
      ['SET', DOWNTIME_ACTIVE_KEY,  JSON.stringify(active)],
      ['SET', DOWNTIME_HISTORY_KEY, JSON.stringify(history)],
    ]);
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.COLLECT_SECRET;
  if (secret) {
    const authHeader = req.headers['authorization'] || '';
    if (authHeader !== `Bearer ${secret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const now    = new Date();
  const etNow  = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const etHour = etNow.getHours();
  const dow    = etNow.getDay();
  const season = getSeason(etNow);

  // Keep up to 52 readings per slot (~1 year of weekly data)
  const MAX_RIDE  = 52;
  const MAX_CROWD = 52;

  const results        = { parks: {}, rideSnapshots: 0, crowdSnapshots: 0, errors: [], season };
  const commands        = [];
  const allRidesByPark  = {};

  for (const [parkKey, entityId] of Object.entries(PARKS)) {
    try {
      const apiRes = await fetch('https://api.themeparks.wiki/v1/entity/' + entityId + '/live');
      if (!apiRes.ok) throw new Error('API error ' + apiRes.status);
      const data = await apiRes.json();

      // All attractions regardless of status — used for downtime tracking
      const allRides = (data.liveData || []).filter(e =>
        e.entityType === 'ATTRACTION' && !isShow(e)
      );
      allRidesByPark[parkKey] = allRides;

      const rides = allRides.filter(e =>
        e.status === 'OPERATING' && e.queue?.STANDBY?.waitTime != null
      );

      // Per-ride snapshots — keyed by season + dow + hour
      for (const ride of rides) {
        const key = `wt:${ride.id}:${season}:${dow}:${etHour}`;
        commands.push(['LPUSH', key, String(ride.queue.STANDBY.waitTime)]);
        commands.push(['LTRIM', key, '0', String(MAX_RIDE - 1)]);
        results.rideSnapshots++;
      }

      // Park crowd snapshot — keyed by season + dow + hour
      if (rides.length > 0) {
        const avgWait = Math.round(
          rides.reduce((s, r) => s + r.queue.STANDBY.waitTime, 0) / rides.length
        );
        const crowdKey = `crowd:${parkKey}:${season}:${dow}:${etHour}`;
        commands.push(['LPUSH', crowdKey, String(avgWait)]);
        commands.push(['LTRIM', crowdKey, '0', String(MAX_CROWD - 1)]);
        results.crowdSnapshots++;
        results.parks[parkKey] = { rides: rides.length, avgWait };
      }

      await new Promise(r => setTimeout(r, 800));
    } catch (err) {
      results.errors.push({ park: parkKey, error: err.message });
    }
  }

  if (commands.length > 0) await redisPipeline(commands);

  try {
    await updateDowntimes(allRidesByPark);
  } catch (err) {
    console.error('Downtime update error:', err);
    results.errors.push({ park: 'downtime', error: err.message });
  }

  console.log('Collect run:', now.toISOString(), { season, dow, etHour, ...results });
  return res.status(200).json({ ok: true, ts: now.toISOString(), etHour, dow, season, ...results });
}
