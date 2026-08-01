// api/_downtime.js
// Shared downtime-tracking logic. Not a route itself (Vercel ignores files
// prefixed with "_" for routing) — imported by api/collect.js (the 30-minute
// cron sweep) and api/downtimes.js (client-triggered updates on refresh).

export async function redisPipeline(commands) {
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

export const DOWNTIME_ACTIVE_KEY  = 'downtime:active';
export const DOWNTIME_HISTORY_KEY = 'downtime:history';
const MAX_HISTORY_PER_RIDE = 15;

// Detects DOWN/CLOSED transitions and persists them in Redis. Called either by
// the 30-minute cron sweep (all parks) or by a client refresh (one park's
// worth of rides it just fetched anyway) — either way the outage's real start
// time gets captured the first time *anyone* observes it, not whenever the
// app next happens to be opened.
export async function updateDowntimes(allRidesByPark) {
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

  return { active, history };
}
