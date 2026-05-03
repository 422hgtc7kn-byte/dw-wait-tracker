// api/schedule.js
// GET /api/schedule?parkId=<mk|ep|hs|ak>
// Returns today's opening/closing times for the park

const PARK_ENTITY_IDS = {
  mk: "75ea578a-adc8-4116-a54d-dccb60765ef9",
  ep: "47f90d2c-e191-4239-a466-5892ef59a88b",
  hs: "288747d1-8b4f-4a64-867e-ea7c9b27bad8",
  ak: "1c84a229-8862-4648-9c71-378ddd2c7693",
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(req, res) {
  if (req.method === "OPTIONS") { res.writeHead(204, CORS); return res.end(); }
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  const { parkId } = req.query;
  const entityId = PARK_ENTITY_IDS[parkId];
  if (!entityId) return res.status(400).json({ error: "Invalid parkId" });

  // Get today's date in ET
  const now = new Date();
  const etDate = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const dateStr = etDate.toISOString().slice(0, 10); // yyyy-MM-dd

  try {
    const upstream = await fetch(
      `https://api.themeparks.wiki/v1/entity/${entityId}/schedule`,
      { headers: { Accept: "application/json" } }
    );
    if (!upstream.ok) throw new Error(`API error ${upstream.status}`);
    const data = await upstream.json();

    // Find today's schedule entry
    const todaySchedule = (data.schedule || []).find(s => s.date === dateStr);
    const operatingHours = (data.schedule || [])
      .filter(s => s.date === dateStr && s.type === "OPERATING");
    const specialHours = (data.schedule || [])
      .filter(s => s.date === dateStr && s.type !== "OPERATING");

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
    return res.status(200).json({
      parkId, date: dateStr,
      schedule: operatingHours[0] || todaySchedule || null,
      special: specialHours,
      allToday: data.schedule?.filter(s => s.date === dateStr) || [],
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
