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

// Entities that come back as entityType "ATTRACTION" but aren't really rides
// with a wait worth tracking — meet-and-greets, photo spots, playgrounds,
// guided tours. Excluding these trims Redis writes and keeps the crowd-level
// average from being skewed by things that don't behave like a queue.
// Tune this list based on what actually shows up in your parks' live data —
// it's a name-keyword match, same pattern as SHOW_KEYWORDS above.
const NON_RIDE_KEYWORDS = [
  'meet ', 'meet mickey', 'meet minnie', 'character', 'photo', 'photopass',
  'autograph', 'fairytale hall', 'silly sideshow', 'town square theater',
  'ariel\'s grotto', 'tinker bell', "tinkerbell",
  'boneyard', 'splash \'n\' soak', 'splash n soak', 'playground', 'play area',
  'exploration trail', 'discovery trail', 'wilderness explorer', 'conservation station',
  'tour', 'keys to the kingdom', 'wild africa trek', 'backstage',
];

function isNonRide(entity) {
  const n = (entity.name || '').toLowerCase();
  if (NON_RIDE_KEYWORDS.some(k => n.includes(k))) return true;
  return NO_WAIT_NAMES.has(n);
}

// Exact-name exclusions — galleries, exhibits, walkthroughs, and other
// entities that report as ATTRACTION but never carry a real STANDBY wait.
// Exact match (not keyword) since these are specific, known entities —
// safer than a substring match for a list this precise. Add more here as
// you spot them; names must match exactly (case-insensitive).
const NO_WAIT_NAMES = new Set([
  'advanced training lab',
  'american heritage gallery',
  'awesome planet',
  'bijutsu-kan gallery',
  "bruce's shark world",
  'gallery of arts and history',
  'house of the whispering willows',
  'imageworks - the "what if" labs',
  'impressions de france',
  'journey of water, inspired by moana',
  'kidcot fun stops',
  'mexico folk art gallery',
  'palais du cinéma',
  'project tomorrow: inventing the wonders of the future',
  'seabase aquarium',
  'stave church gallery',
  'the american adventure',
].map(n => n.toLowerCase()));

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
        e.entityType === 'ATTRACTION' && !isShow(e) && !isNonRide(e)
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
