// api/downtimes.js
// GET /api/downtimes
// Returns currently-down rides + past outage history, as tracked server-side
// by api/collect.js on every scheduled run. Because tracking happens on the
// backend (independent of whether anyone has the app open), the "since"
// timestamp reflects when the ride actually went down, not when a client
// happened to check.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const DOWNTIME_ACTIVE_KEY  = 'downtime:active';
const DOWNTIME_HISTORY_KEY = 'downtime:history';

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

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const [activeRes, historyRes] = await redisPipeline([
      ['GET', DOWNTIME_ACTIVE_KEY],
      ['GET', DOWNTIME_HISTORY_KEY],
    ]);

    let active  = {};
    let history = {};
    try { active  = activeRes?.result  ? JSON.parse(activeRes.result)  : {}; } catch { active  = {}; }
    try { history = historyRes?.result ? JSON.parse(historyRes.result) : {}; } catch { history = {}; }

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    return res.status(200).json({ ok: true, active, history });
  } catch (err) {
    console.error('Downtimes GET error:', err);
    return res.status(500).json({ error: err.message });
  }
}
