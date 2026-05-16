const PARK_IDS = ["mk","ep","hs","ak"];
const CORS = { "Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET, OPTIONS","Access-Control-Allow-Headers":"Content-Type" };
const TYPICAL_DOW = { mk:[42,52,36,34,38,44,56], ep:[34,44,30,28,32,38,48], hs:[46,54,38,36,40,46,58], ak:[32,40,26,24,28,34,44] };

async function redisPipeline(commands) {
  const url = process.env.UPSTASH_REDIS_REST_URL, token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Upstash env vars not set");
  const res = await fetch(url + "/pipeline", { method:"POST", headers:{ Authorization:"Bearer "+token, "Content-Type":"application/json" }, body:JSON.stringify(commands) });
  if (!res.ok) throw new Error("Upstash error: " + res.status);
  return res.json();
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") { res.writeHead(204, CORS); return res.end(); }
  Object.entries(CORS).forEach(([k,v]) => res.setHeader(k,v));
  const { parkId = "all", days = "30" } = req.query;
  const numDays = Math.min(parseInt(days)||30, 90);
  const parks = parkId === "all" ? PARK_IDS : [parkId];
  try {
    const result = {};
    for (const pid of parks) {
      const keys = [];
      for (let dow=0; dow<7; dow++) for (let hod=0; hod<24; hod++) keys.push({ key:`crowd:${pid}:${dow}:${hod}`, dow, hod });
      const responses = await redisPipeline(keys.map(({key}) => ["LRANGE", key, "0", "19"]));
      const dowAvg = Array.from({length:7}, () => ({sum:0, count:0}));
      responses.forEach(({result:vals}, i) => {
        if (!vals?.length) return;
        const {dow, hod} = keys[i];
        if (hod < 9 || hod > 22) return;
        vals.forEach(v => { const w=Number(v); if (!isNaN(w)) { dowAvg[dow].sum+=w; dowAvg[dow].count++; } });
      });
      const calendar = [];
      const now = new Date(new Date().toLocaleString("en-US", {timeZone:"America/New_York"}));
      for (let i=numDays-1; i>=0; i--) {
        const d = new Date(now); d.setDate(d.getDate()-i);
        const dow = d.getDay(), dateStr = d.toISOString().slice(0,10);
        const {sum, count} = dowAvg[dow];
        const isReal = count >= 3;
        calendar.push({ date:dateStr, dow, avg:isReal?Math.round(sum/count):(TYPICAL_DOW[pid]?.[dow]??35), isReal });
      }
      result[pid] = calendar;
    }
    res.setHeader("Cache-Control", "s-maxage=300");
    return res.status(200).json({ ok:true, parks:result });
  } catch(err) { return res.status(500).json({ error:err.message }); }
}
