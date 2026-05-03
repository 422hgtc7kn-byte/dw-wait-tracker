// scripts/collect-waits.mjs
// Run by GitHub Actions every 30 minutes to collect wait times + crowd levels into Upstash

const PARKS = {
  mk: { entityId: '75ea578a-adc8-4116-a54d-dccb60765ef9' },
  ep: { entityId: '47f90d2c-e191-4239-a466-5892ef59a88b' },
  hs: { entityId: '288747d1-8b4f-4a64-867e-ea7c9b27bad8' },
  ak: { entityId: '1c84a229-8862-4648-9c71-378ddd2c7693' },
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
  if (!url || !token) throw new Error('Missing Upstash env vars — check GitHub secrets');
  const res = await fetch(url + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error('Upstash error: ' + res.status);
  return res.json();
}

async function collectPark(parkKey, entityId) {
  const res = await fetch('https://api.themeparks.wiki/v1/entity/' + entityId + '/live');
  if (!res.ok) throw new Error('ThemeParks API error ' + res.status);
  const data = await res.json();
  const rides = (data.liveData || []).filter(e =>
    e.entityType === 'ATTRACTION' &&
    !isShow(e) &&
    e.status === 'OPERATING' &&
    e.queue?.STANDBY?.waitTime != null
  );
  console.log(parkKey.toUpperCase() + ':', rides.length, 'rides operating');
  return rides;
}

async function main() {
  const now    = new Date();
  const etStr = now.toLocaleString("en-US", { timeZone: "America/New_York", hour: "numeric", hour12: false }); const etHour = parseInt(etStr, 10);
  const dow = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" })).getDay();
  const MAX_RIDE   = 10;
  const MAX_CROWD  = 20;

  console.log('Collecting at', now.toISOString(), '| ET hour:', etHour, '| DoW:', dow);

  const commands = [];
  let rideTotal  = 0;
  let crowdTotal = 0;

  for (const [parkKey, { entityId }] of Object.entries(PARKS)) {
    try {
      const rides = await collectPark(parkKey, entityId);

      // ── Per-ride wait time snapshots ──
      for (const ride of rides) {
        const key = `wt:${ride.id}:${dow}:${etHour}`;
        commands.push(['LPUSH', key, String(ride.queue.STANDBY.waitTime)]);
        commands.push(['LTRIM', key, '0', String(MAX_RIDE - 1)]);
        rideTotal++;
      }

      // ── Park-wide crowd level (avg wait across all operating rides) ──
      if (rides.length > 0) {
        const avgWait = Math.round(
          rides.reduce((s, r) => s + r.queue.STANDBY.waitTime, 0) / rides.length
        );
        const crowdKey = `crowd:${parkKey}:${dow}:${etHour}`;
        commands.push(['LPUSH', crowdKey, String(avgWait)]);
        commands.push(['LTRIM', crowdKey, '0', String(MAX_CROWD - 1)]);
        crowdTotal++;
        console.log(parkKey.toUpperCase() + ' crowd avg:', avgWait, 'min');
      }

    } catch (err) {
      console.error('Error fetching', parkKey + ':', err.message);
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  if (commands.length > 0) {
    await redisPipeline(commands);
    console.log(`✅ Stored ${rideTotal} ride snapshots + ${crowdTotal} crowd snapshots`);
  } else {
    console.log('No snapshots stored (parks may be closed)');
  }
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
