// api/waittimes.js — Vercel serverless proxy for ThemeParks.wiki
// GET /api/waittimes?entityId=<uuid>

export default async function handler(req, res) {
  const { entityId } = req.query;
  if (!entityId) return res.status(400).json({ error: "Missing entityId" });

  try {
    const [liveRes] = await Promise.all([
      fetch(`https://api.themeparks.wiki/v1/entity/${entityId}/live`, {
        headers: { Accept: "application/json" },
      }),
    ]);

    if (!liveRes.ok) return res.status(liveRes.status).json({ error: "Upstream error" });

    const liveData = await liveRes.json();

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json(liveData);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
