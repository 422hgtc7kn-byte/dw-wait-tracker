// api/waittimes.js
// Vercel serverless function — proxies ThemeParks.wiki so the browser never hits it directly.
// Called as: GET /api/waittimes?entityId=<uuid>

export default async function handler(req, res) {
  const { entityId } = req.query;

  if (!entityId) {
    return res.status(400).json({ error: "Missing entityId" });
  }

  try {
    const upstream = await fetch(
      `https://api.themeparks.wiki/v1/entity/${entityId}/live`,
      { headers: { "Accept": "application/json" } }
    );

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: "Upstream error" });
    }

    const data = await upstream.json();

    // Cache for 60 seconds on Vercel edge
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
