import { useState, useEffect, useCallback } from "react";

const PARKS = {
  mk: {
    name: "Magic Kingdom",
    entityId: "75ea578a-adc8-4116-a54d-dccb60765ef9",
    icon: "🏰",
    color: "#1a3a6b",
    accent: "#c8a951",
  },
  ep: {
    name: "EPCOT",
    entityId: "47f90d2c-e191-4239-a466-5892ef59a88b",
    icon: "🌍",
    color: "#1a5276",
    accent: "#58d68d",
  },
  hs: {
    name: "Hollywood Studios",
    entityId: "288747d1-8b4f-4a64-867e-ea7c9b27bad8",
    icon: "🎬",
    color: "#4a1a2c",
    accent: "#e74c3c",
  },
  ak: {
    name: "Animal Kingdom",
    entityId: "1c84a229-8862-4648-9c71-378ddd2c7693",
    icon: "🦁",
    color: "#1e4d2b",
    accent: "#f39c12",
  },
};

function inferThrill(name) {
  const n = name.toLowerCase();
  if (
    n.includes("coaster") || n.includes("mountain") || n.includes("everest") ||
    n.includes("tower") || n.includes("rock ") || n.includes("resistance") ||
    n.includes("flight of passage") || n.includes("guardians") || n.includes("dinosaur") ||
    n.includes("smugglers") || n.includes("slinky") || n.includes("splash") ||
    n.includes("rapids") || n.includes("runaway railway") || n.includes("tron")
  ) return "high";
  if (
    n.includes("test track") || n.includes("soarin") || n.includes("safari") ||
    n.includes("ratatouille") || n.includes("frozen") || n.includes("haunted") ||
    n.includes("pirates") || n.includes("toy story mania") || n.includes("na'vi") ||
    n.includes("navi") || n.includes("millennium") || n.includes("journey")
  ) return "medium";
  return "low";
}

function WaitBadge({ minutes, status }) {
  if (status === "CLOSED" || status === "DOWN" || status === "REFURBISHMENT") {
    const label = status === "REFURBISHMENT" ? "Refurb" : status === "DOWN" ? "Down" : "Closed";
    return (
      <span style={{
        background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)",
        borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600,
        fontFamily: "'Courier New', monospace", minWidth: 52,
        display: "inline-block", textAlign: "center",
      }}>{label}</span>
    );
  }
  const color =
    minutes == null ? "#444" :
    minutes < 20 ? "#27ae60" :
    minutes < 40 ? "#f39c12" :
    minutes < 60 ? "#e67e22" : "#e74c3c";
  return (
    <span style={{
      background: color, color: "#fff", borderRadius: 20, padding: "3px 10px",
      fontSize: 13, fontWeight: 700, fontFamily: "'Courier New', monospace",
      minWidth: 52, display: "inline-block", textAlign: "center",
    }}>
      {minutes != null ? `${minutes}m` : "—"}
    </span>
  );
}

function ThrillBadge({ level }) {
  const map = {
    high: { label: "Thrill", color: "#c0392b" },
    medium: { label: "Moderate", color: "#d68910" },
    low: { label: "Mild", color: "#1a8a4a" },
  };
  const { label, color } = map[level] || map.low;
  return (
    <span style={{
      fontSize: 10, color, border: `1px solid ${color}`,
      borderRadius: 4, padding: "1px 5px", fontFamily: "sans-serif", fontWeight: 600,
    }}>{label}</span>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", borderRadius: 14,
      padding: "14px 16px", marginBottom: 10, border: "1px solid rgba(255,255,255,0.08)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ width: 160, height: 14, borderRadius: 4, background: "rgba(255,255,255,0.08)", marginBottom: 8, animation: "pulse 1.5s infinite" }} />
          <div style={{ width: 90, height: 10, borderRadius: 4, background: "rgba(255,255,255,0.05)", animation: "pulse 1.5s infinite" }} />
        </div>
        <div style={{ width: 52, height: 26, borderRadius: 20, background: "rgba(255,255,255,0.08)", animation: "pulse 1.5s infinite" }} />
      </div>
    </div>
  );
}

function RideCard({ ride, accent }) {
  const [expanded, setExpanded] = useState(false);
  const thrill = inferThrill(ride.name);
  const isOperating = ride.status === "OPERATING";
  const wait = ride.queue?.STANDBY?.waitTime ?? null;

  return (
    <div
      onClick={() => isOperating && setExpanded(e => !e)}
      style={{
        background: "rgba(255,255,255,0.04)", borderRadius: 14,
        padding: "14px 16px", marginBottom: 10,
        border: "1px solid rgba(255,255,255,0.08)",
        cursor: isOperating ? "pointer" : "default",
        opacity: ride.status === "REFURBISHMENT" ? 0.45 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ flex: 1, paddingRight: 10 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "'Georgia', serif", marginBottom: 4 }}>
            {ride.name}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <ThrillBadge level={thrill} />
            {ride.queue?.SINGLE_RIDER != null && (
              <span style={{ fontSize: 10, color: "#8e44ad", border: "1px solid #8e44ad", borderRadius: 4, padding: "1px 5px", fontFamily: "sans-serif" }}>
                Single Rider
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <WaitBadge minutes={wait} status={ride.status} />
          {isOperating && wait != null && (
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, marginTop: 3, fontFamily: "sans-serif" }}>standby</div>
          )}
        </div>
      </div>

      {expanded && isOperating && (
        <div style={{ marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12 }}>
          {ride.queue?.LIGHTNING_LANE?.waitTime != null && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "sans-serif" }}>⚡ Lightning Lane</span>
              <WaitBadge minutes={ride.queue.LIGHTNING_LANE.waitTime} status="OPERATING" />
            </div>
          )}
          {ride.queue?.PAID_RETURN_TIME && (
            <div style={{ marginBottom: 10 }}>
              <span style={{ color: accent, fontSize: 11, fontFamily: "sans-serif" }}>
                🎟 Individual Lightning Lane available
              </span>
            </div>
          )}
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "sans-serif" }}>
            💡 {thrill === "high"
              ? "Use Lightning Lane or queue right at park open for shortest waits."
              : "This ride loads quickly — check the line as you walk past."}
          </div>
          {ride.lastUpdated && (
            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, fontFamily: "sans-serif", marginTop: 6 }}>
              Last updated: {new Date(ride.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CrowdMeter({ rides }) {
  const withWaits = rides.filter(r => r.status === "OPERATING" && r.queue?.STANDBY?.waitTime != null);
  if (withWaits.length === 0) return null;
  const avg = withWaits.reduce((s, r) => s + r.queue.STANDBY.waitTime, 0) / withWaits.length;
  const level = avg < 20 ? "Low" : avg < 35 ? "Moderate" : avg < 55 ? "High" : "Peak";
  const color = avg < 20 ? "#27ae60" : avg < 35 ? "#f39c12" : avg < 55 ? "#e67e22" : "#e74c3c";
  const pct = Math.min(100, Math.round((avg / 80) * 100));
  return (
    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 16px", marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "sans-serif" }}>Park Crowd Level</span>
        <span style={{ color, fontWeight: 700, fontSize: 13, fontFamily: "'Courier New', monospace" }}>{level}</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.8s ease" }} />
      </div>
      <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontFamily: "sans-serif", marginTop: 4 }}>
        Avg standby: {Math.round(avg)} min · {withWaits.length} rides reporting
      </div>
    </div>
  );
}

export default function App() {
  const [activePark, setActivePark] = useState("mk");
  const [ridesData, setRidesData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("wait");

  const park = PARKS[activePark];

  const fetchParkData = useCallback(async (parkKey) => {
    const p = PARKS[parkKey];
    setLoading(true);
    setError(null);
    try {
      // Calls our own Vercel serverless proxy — no CORS issues
      const res = await fetch(`/api/waittimes?entityId=${p.entityId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const rides = (data.liveData || []).filter(e => e.entityType === "ATTRACTION");
      setRidesData(prev => ({ ...prev, [parkKey]: rides }));
      setLastRefresh(new Date());
    } catch (e) {
      setError("Couldn't load live wait times. Tap ↻ to retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!ridesData[activePark]) fetchParkData(activePark);
  }, [activePark, fetchParkData, ridesData]);

  const rawRides = ridesData[activePark] || [];
  const openRides = rawRides.filter(r => r.status === "OPERATING");
  const waitTimes = openRides.map(r => r.queue?.STANDBY?.waitTime).filter(w => w != null);
  const avgWait = waitTimes.length ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length) : null;
  const shortestRide = [...openRides]
    .filter(r => r.queue?.STANDBY?.waitTime != null)
    .sort((a, b) => a.queue.STANDBY.waitTime - b.queue.STANDBY.waitTime)[0];

  const filteredRides = rawRides
    .filter(r => filter === "all" || inferThrill(r.name) === filter)
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      const aOpen = a.status === "OPERATING" ? 0 : 1;
      const bOpen = b.status === "OPERATING" ? 0 : 1;
      if (aOpen !== bOpen) return aOpen - bOpen;
      return (a.queue?.STANDBY?.waitTime ?? 999) - (b.queue?.STANDBY?.waitTime ?? 999);
    });

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0e1a", fontFamily: "Georgia, serif",
      padding: "0 0 40px", maxWidth: 430, margin: "0 auto",
    }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
        * { box-sizing: border-box; }
      `}</style>

      {/* Status bar — hides when added to home screen */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px 0", color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "sans-serif" }}>
        <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        <span>Walt Disney World</span>
      </div>

      {/* Header */}
      <div style={{
        padding: "16px 20px 20px",
        background: `linear-gradient(160deg, ${park.color}cc 0%, #0a0e1acc 100%)`,
        borderBottom: `2px solid ${park.accent}44`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, color: park.accent, fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: 2, marginBottom: 2 }}>
              Live Wait Times
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>
              {park.icon} {park.name}
            </div>
          </div>
          <button
            onClick={() => fetchParkData(activePark)}
            disabled={loading}
            style={{
              background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8,
              padding: "6px 10px", color: loading ? "rgba(255,255,255,0.3)" : "#fff",
              fontSize: 18, cursor: loading ? "default" : "pointer",
            }}
          >{loading ? "⟳" : "↻"}</button>
        </div>
        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "sans-serif", marginTop: 6 }}>
          {loading ? "Fetching live wait times…"
            : lastRefresh ? `Live · Updated ${lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
            : "Loading…"}
        </div>

        {/* Park tabs */}
        <div style={{ display: "flex", gap: 6, marginTop: 14, overflowX: "auto", paddingBottom: 2 }}>
          {Object.entries(PARKS).map(([id, p]) => (
            <button key={id} onClick={() => setActivePark(id)} style={{
              background: activePark === id ? park.accent : "rgba(255,255,255,0.07)",
              color: activePark === id ? "#000" : "rgba(255,255,255,0.55)",
              border: "none", borderRadius: 20, padding: "5px 12px",
              fontSize: 11, fontWeight: activePark === id ? 800 : 400,
              cursor: "pointer", whiteSpace: "nowrap", fontFamily: "sans-serif",
              transition: "all 0.2s",
            }}>
              {p.icon} {id.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 16px 0" }}>
        {error && (
          <div style={{
            background: "rgba(231,76,60,0.15)", borderRadius: 12, padding: "12px 16px",
            marginBottom: 14, border: "1px solid rgba(231,76,60,0.3)",
            color: "#e74c3c", fontSize: 13, fontFamily: "sans-serif",
          }}>⚠️ {error}</div>
        )}

        {!loading && rawRides.length > 0 && (
          <>
            <CrowdMeter rides={rawRides} />
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              {[
                { label: "Avg Wait", value: avgWait != null ? `${avgWait}m` : "—", icon: "⏱" },
                { label: "Open Rides", value: openRides.length, icon: "🎢" },
                { label: "Shortest", value: shortestRide ? `${shortestRide.queue.STANDBY.waitTime}m` : "—", icon: "✨" },
              ].map((s, i) => (
                <div key={i} style={{
                  flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 12,
                  padding: "10px 12px", textAlign: "center", border: "1px solid rgba(255,255,255,0.07)",
                }}>
                  <div style={{ fontSize: 16 }}>{s.icon}</div>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, fontFamily: "'Courier New', monospace" }}>{s.value}</div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "sans-serif" }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
              <div style={{ display: "flex", gap: 6, flex: 1, overflowX: "auto" }}>
                {["all", "high", "medium", "low"].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    background: filter === f ? park.accent : "rgba(255,255,255,0.07)",
                    color: filter === f ? "#000" : "rgba(255,255,255,0.55)",
                    border: "none", borderRadius: 20, padding: "4px 12px",
                    fontSize: 11, fontWeight: filter === f ? 800 : 400,
                    cursor: "pointer", whiteSpace: "nowrap", fontFamily: "sans-serif",
                  }}>
                    {f === "all" ? "All" : f === "high" ? "🔥 Thrill" : f === "medium" ? "⚡ Moderate" : "🌿 Mild"}
                  </button>
                ))}
              </div>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
                background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
                padding: "4px 8px", fontSize: 11, fontFamily: "sans-serif", cursor: "pointer",
              }}>
                <option value="wait">Sort: Wait ↑</option>
                <option value="name">Sort: A–Z</option>
              </select>
            </div>
          </>
        )}

        {loading && Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)}

        {!loading && !error && rawRides.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.3)", fontFamily: "sans-serif", fontSize: 14 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{park.icon}</div>
            <div>Tap ↻ to load live wait times</div>
          </div>
        )}

        {!loading && filteredRides.length > 0 && (
          <>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "sans-serif", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
              {filteredRides.length} attractions · tap for details →
            </div>
            {filteredRides.map(ride => (
              <RideCard key={ride.id} ride={ride} accent={park.accent} />
            ))}
          </>
        )}

        {!loading && rawRides.length > 0 && (
          <div style={{
            background: `linear-gradient(135deg, ${park.color}55, transparent)`,
            borderRadius: 14, padding: "14px 16px", marginTop: 6,
            border: `1px solid ${park.accent}33`,
          }}>
            <div style={{ color: park.accent, fontSize: 12, fontWeight: 700, fontFamily: "sans-serif", marginBottom: 4 }}>💡 Pro Strategy</div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontFamily: "sans-serif", lineHeight: 1.6 }}>
              Arrive 30 min before park open. Hit top rides first, then use Lightning Lane during peak hours. Return to headliners after 7pm for shorter queues.
            </div>
            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, fontFamily: "sans-serif", marginTop: 8 }}>
              Powered by ThemeParks.wiki · Data refreshed every 5 min by source
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
