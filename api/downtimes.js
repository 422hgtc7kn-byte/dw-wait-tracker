// api/downtimes.js
// GET  /api/downtimes            → current active downtimes + history
// POST /api/downtimes { parkId, rides } → update tracking from data the
//   client just fetched (e.g. on refresh), giving near-instant accuracy
//   while the app is open, on top of the 30-minute cron sweep that covers
//   outages that happen while nobody's looking.

import { redisPipeline, updateDowntimes, DOWNTIME_ACTIVE_KEY, DOWNTIME_HISTORY_KEY } from './_downtime.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'GET') {
    try {
      const [activeRes, historyRes] = await redisPipeline([
        ['GET', DOWNTIME_ACTIVE_KEY],
        ['GET', DOWNTIME_HISTORY_KEY],
      ]);

      let active  = {};
      let history = {};
      try { active  = activeRes?.result  ? JSON.parse(activeRes.result)  : {}; } catch { active  = {}; }
      try { history = historyRes?.result ? JSON.parse(historyRes.result) : {}; } catch { history = {}; }

      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ ok: true, active, history });
    } catch (err) {
      console.error('Downtimes GET error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { parkId, rides } = req.body || {};
      if (!parkId || !Array.isArray(rides)) {
        return res.status(400).json({ error: 'parkId and rides array required' });
      }

      // Only attraction-shaped entries matter here (id/name/status)
      const cleaned = rides
        .filter(r => r && r.id && r.status)
        .map(r => ({ id: r.id, name: r.name, status: r.status }));

      const { active, history } = await updateDowntimes({ [parkId]: cleaned });
      return res.status(200).json({ ok: true, active, history });
    } catch (err) {
      console.error('Downtimes POST error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
