// api/collect.js
// Called by Upstash QStash every 30 minutes via HTTP POST
// Fetches all 4 parks and stores wait times + crowd levels in Upstash Redis
// Keys include season so like-for-like comparisons are accurate.

import { getSeason } from './season.js';
import { redisPipeline, updateDowntimes } from './_downtime.js';

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
