import { useState, useEffect, useCallback, useRef } from "react";

const PARKS = {
  mk: { name: "Magic Kingdom", entityId: "75ea578a-adc8-4116-a54d-dccb60765ef9", icon: "🏰", color: "#1a3a6b", accent: "#c8a951" },
  ep: { name: "EPCOT",          entityId: "47f90d2c-e191-4239-a466-5892ef59a88b", icon: "🌍", color: "#1a5276", accent: "#58d68d" },
  hs: { name: "Hollywood Studios", entityId: "288747d1-8b4f-4a64-867e-ea7c9b27bad8", icon: "🎬", color: "#4a1a2c", accent: "#e74c3c" },
  ak: { name: "Animal Kingdom",  entityId: "1c84a229-8862-4648-9c71-378ddd2c7693", icon: "🦁", color: "#1e4d2b", accent: "#f39c12" },
};

// ── localStorage ──────────────────────────────────────────────────────────────
function loadPref(key, fallback) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function savePref(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }

// ── Helpers ───────────────────────────────────────────────────────────────────
function inferThrill(name) {
  const n = name.toLowerCase();
  if (n.includes("coaster") || n.includes("mountain") || n.includes("everest") ||
      n.includes("tower") || n.includes("rock ") || n.includes("resistance") ||
      n.includes("flight of passage") || n.includes("guardians") || n.includes("dinosaur") ||
      n.includes("smugglers") || n.includes("slinky") || n.includes("splash") ||
      n.includes("rapids") || n.includes("runaway railway") || n.includes("tron")) return "high";
  if (n.includes("test track") || n.includes("soarin") || n.includes("safari") ||
      n.includes("ratatouille") || n.includes("frozen") || n.includes("haunted") ||
      n.includes("pirates") || n.includes("toy story mania") || n.includes("na'vi") ||
      n.includes("navi") || n.includes("millennium") || n.includes("journey")) return "medium";
  return "low";
}

// Use the API's entityType when available; fall back to name heuristics
function isShowEntity(entity) {
  if (entity.entityType === "SHOW") return true;
  const n = (entity.name || "").toLowerCase();
  return n.includes("show") || n.includes("theater") || n.includes("theatre") ||
    n.includes("film") || n.includes("movie") || n.includes("presentation") ||
    n.includes("stage") || n.includes("performance") || n.includes("symphony") ||
    n.includes("philharmagic") || n.includes("enchantment") || n.includes("firework") ||
    n.includes("parade") || n.includes("nighttime") || n.includes("fantasy in the sky") ||
    n.includes("happily ever after") || n.includes("epcot forever") || n.includes("luminous") ||
    n.includes("indiana jones") || n.includes("beauty and the beast") || n.includes("frozen sing") ||
    n.includes("lion king") || n.includes("finding nemo") || n.includes("animation") ||
    n.includes("turtle talk");
}

// Format a showtime ISO string to a friendly time like "2:30 PM"
function fmtTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch { return iso; }
}

// Is this showtime in the future (or within the last 5 min)?
function isUpcoming(iso) {
  try { return new Date(iso) > Date.now() - 5 * 60 * 1000; } catch { return false; }
}

const cardStyle = { background: "rgba(255,255,255,0.04)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)" };

// ── WaitBadge ─────────────────────────────────────────────────────────────────
function WaitBadge({ minutes, status }) {
  if (status === "CLOSED" || status === "DOWN" || status === "REFURBISHMENT") {
    const label = status === "REFURBISHMENT" ? "Refurb" : status === "DOWN" ? "Down" : "Closed";
    return <span style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600, fontFamily: "monospace", minWidth: 52, display: "inline-block", textAlign: "center" }}>{label}</span>;
  }
  const color = minutes == null ? "#444" : minutes < 20 ? "#27ae60" : minutes < 40 ? "#f39c12" : minutes < 60 ? "#e67e22" : "#e74c3c";
  return <span style={{ background: color, color: "#fff", borderRadius: 20, padding: "3px 10px", fontSize: 13, fontWeight: 700, fontFamily: "monospace", minWidth: 52, display: "inline-block", textAlign: "center" }}>{minutes != null ? `${minutes}m` : "—"}</span>;
}

function ThrillBadge({ level }) {
  const map = { high: { label: "Thrill", color: "#c0392b" }, medium: { label: "Moderate", color: "#d68910" }, low: { label: "Mild", color: "#1a8a4a" } };
  const { label, color } = map[level] || map.low;
  return <span style={{ fontSize: 10, color, border: `1px solid ${color}`, borderRadius: 4, padding: "1px 5px", fontFamily: "sans-serif", fontWeight: 600 }}>{label}</span>;
}

function SkeletonCard() {
  return (
    <div style={{ ...cardStyle, padding: "14px 16px", marginBottom: 10 }}>
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

// ── Alert modal ───────────────────────────────────────────────────────────────
function AlertModal({ ride, existing, onSave, onClose, accent }) {
  const [threshold, setThreshold] = useState(existing?.threshold ?? 30);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#161c2e", borderRadius: "20px 20px 0 0", padding: "24px 24px 40px", width: "100%", maxWidth: 430 }}>
        <div style={{ color: accent, fontSize: 11, fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Set Wait Alert</div>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 17, fontFamily: "Georgia, serif", marginBottom: 4 }}>{ride.name}</div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "sans-serif", marginBottom: 20 }}>Notify me when the wait drops below:</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <input type="range" min={5} max={120} step={5} value={threshold} onChange={e => setThreshold(Number(e.target.value))} style={{ flex: 1, accentColor: accent }} />
          <span style={{ color: accent, fontWeight: 800, fontSize: 22, fontFamily: "monospace", minWidth: 52, textAlign: "right" }}>{threshold}m</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {existing && <button onClick={() => onSave(null)} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#e74c3c", fontFamily: "sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Remove Alert</button>}
          <button onClick={() => onSave(threshold)} style={{ flex: 2, padding: 12, borderRadius: 12, border: "none", background: accent, color: "#000", fontFamily: "sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
            {existing ? "Update Alert" : "Set Alert"} 🔔
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ShowCard ──────────────────────────────────────────────────────────────────
function ShowCard({ show, accent, isFavorite, onToggleFavorite, isHidden, onToggleHidden }) {
  const [expanded, setExpanded] = useState(false);

  // showtimes from API: array of { startTime, endTime, type }
  const showtimes = (show.showtimes || []).filter(st => isUpcoming(st.startTime));
  const allTimes = (show.showtimes || []);
  const nextShow = showtimes[0];
  const isOperating = show.status === "OPERATING" || show.status === "INFO";

  if (isHidden) return null;

  return (
    <div style={{
      ...cardStyle,
      padding: "14px 16px", marginBottom: 10,
      border: isFavorite ? `1px solid ${accent}55` : cardStyle.border,
      background: isFavorite ? "rgba(255,255,255,0.06)" : cardStyle.background,
      opacity: show.status === "REFURBISHMENT" ? 0.45 : 1,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        {/* Left: name + next time */}
        <div style={{ flex: 1, paddingRight: 10, cursor: "pointer" }} onClick={() => allTimes.length > 0 && setExpanded(e => !e)}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
            {isFavorite && <span style={{ fontSize: 12 }}>⭐</span>}
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "Georgia, serif" }}>{show.name}</span>
          </div>
          {/* Next showtime pill */}
          {nextShow ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ background: `${accent}22`, color: accent, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700, fontFamily: "monospace", border: `1px solid ${accent}44` }}>
                Next: {fmtTime(nextShow.startTime)}
              </span>
              {showtimes.length > 1 && (
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "sans-serif" }}>
                  +{showtimes.length - 1} more
                </span>
              )}
            </div>
          ) : allTimes.length > 0 ? (
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "sans-serif" }}>No more shows today</span>
          ) : (
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "sans-serif" }}>
              {isOperating ? "Check park app for times" : show.status === "REFURBISHMENT" ? "Under refurbishment" : "Closed today"}
            </span>
          )}
        </div>
        {/* Right: fav button + status */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <button onClick={e => { e.stopPropagation(); onToggleFavorite(); }}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: 2, opacity: isFavorite ? 1 : 0.3 }}>
            {isFavorite ? "⭐" : "☆"}
          </button>
          {show.status === "REFURBISHMENT" && (
            <span style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontFamily: "monospace" }}>Refurb</span>
          )}
          {show.status === "CLOSED" && (
            <span style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontFamily: "monospace" }}>Closed</span>
          )}
        </div>
      </div>

      {/* Expanded: full schedule */}
      {expanded && allTimes.length > 0 && (
        <div style={{ marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12 }}>
          <div style={{ color: accent, fontSize: 11, fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
            Today's Schedule
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {allTimes.map((st, i) => {
              const past = !isUpcoming(st.startTime);
              return (
                <span key={i} style={{
                  background: past ? "rgba(255,255,255,0.05)" : `${accent}22`,
                  color: past ? "rgba(255,255,255,0.3)" : accent,
                  border: `1px solid ${past ? "rgba(255,255,255,0.08)" : accent + "44"}`,
                  borderRadius: 20, padding: "4px 12px",
                  fontSize: 13, fontWeight: 700, fontFamily: "monospace",
                  textDecoration: past ? "line-through" : "none",
                }}>
                  {fmtTime(st.startTime)}
                </span>
              );
            })}
          </div>
          {show.lastUpdated && (
            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, fontFamily: "sans-serif", marginBottom: 10 }}>
              Updated: {new Date(show.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
          <button onClick={() => onToggleHidden()} style={{
            width: "100%", padding: 8, borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
            color: "rgba(255,255,255,0.35)", fontFamily: "sans-serif", fontSize: 11,
            cursor: "pointer", textAlign: "center",
          }}>
            Hide from list
          </button>
        </div>
      )}
    </div>
  );
}

// ── RideCard ──────────────────────────────────────────────────────────────────
function RideCard({ ride, accent, isFavorite, onToggleFavorite, alertThreshold, onSetAlert, isHidden, onToggleHidden }) {
  const [expanded, setExpanded] = useState(false);
  const thrill = inferThrill(ride.name);
  const isOperating = ride.status === "OPERATING";
  const wait = ride.queue?.STANDBY?.waitTime ?? null;
  const hasAlert = alertThreshold != null;

  if (isHidden) return null;

  return (
    <div style={{
      ...cardStyle,
      padding: "14px 16px", marginBottom: 10,
      border: isFavorite ? `1px solid ${accent}55` : cardStyle.border,
      background: isFavorite ? "rgba(255,255,255,0.06)" : cardStyle.background,
      opacity: ride.status === "REFURBISHMENT" ? 0.45 : 1,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ flex: 1, paddingRight: 10, cursor: isOperating ? "pointer" : "default" }} onClick={() => isOperating && setExpanded(e => !e)}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            {isFavorite && <span style={{ fontSize: 12 }}>⭐</span>}
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "Georgia, serif" }}>{ride.name}</span>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <ThrillBadge level={thrill} />
            {ride.queue?.SINGLE_RIDER != null && <span style={{ fontSize: 10, color: "#8e44ad", border: "1px solid #8e44ad", borderRadius: 4, padding: "1px 5px", fontFamily: "sans-serif" }}>Single Rider</span>}
            {hasAlert && <span style={{ fontSize: 10, color: "#3498db", border: "1px solid #3498db", borderRadius: 4, padding: "1px 5px", fontFamily: "sans-serif" }}>🔔 &lt;{alertThreshold}m</span>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <button onClick={e => { e.stopPropagation(); onToggleFavorite(); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: 2, opacity: isFavorite ? 1 : 0.3 }}>{isFavorite ? "⭐" : "☆"}</button>
          <button onClick={e => { e.stopPropagation(); onSetAlert(); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 2, opacity: hasAlert ? 1 : 0.3 }}>🔔</button>
          <div style={{ textAlign: "right" }}>
            <WaitBadge minutes={wait} status={ride.status} />
            {isOperating && wait != null && <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, marginTop: 3, fontFamily: "sans-serif" }}>standby</div>}
          </div>
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
          {ride.queue?.PAID_RETURN_TIME && <div style={{ marginBottom: 10 }}><span style={{ color: accent, fontSize: 11, fontFamily: "sans-serif" }}>🎟 Individual Lightning Lane available</span></div>}
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "sans-serif" }}>
            💡 {thrill === "high" ? "Use Lightning Lane or queue right at park open for shortest waits." : "This ride loads quickly — check the line as you walk past."}
          </div>
          <button onClick={() => onToggleHidden()} style={{ marginTop: 12, width: "100%", padding: 8, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.35)", fontFamily: "sans-serif", fontSize: 11, cursor: "pointer" }}>
            Hide this ride from list
          </button>
          {ride.lastUpdated && <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, fontFamily: "sans-serif", marginTop: 8 }}>Updated: {new Date(ride.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>}
        </div>
      )}
    </div>
  );
}

function CrowdMeter({ rides }) {
  const withWaits = rides.filter(r => r.status === "OPERATING" && r.queue?.STANDBY?.waitTime != null);
  if (!withWaits.length) return null;
  const avg = withWaits.reduce((s, r) => s + r.queue.STANDBY.waitTime, 0) / withWaits.length;
  const level = avg < 20 ? "Low" : avg < 35 ? "Moderate" : avg < 55 ? "High" : "Peak";
  const color = avg < 20 ? "#27ae60" : avg < 35 ? "#f39c12" : avg < 55 ? "#e67e22" : "#e74c3c";
  return (
    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 16px", marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "sans-serif" }}>Park Crowd Level</span>
        <span style={{ color, fontWeight: 700, fontSize: 13, fontFamily: "monospace" }}>{level}</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ width: `${Math.min(100, Math.round((avg / 80) * 100))}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.8s" }} />
      </div>
      <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontFamily: "sans-serif", marginTop: 4 }}>
        Avg standby: {Math.round(avg)} min · {withWaits.length} rides reporting
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [activePark, setActivePark] = useState("mk");
  const [activeTab, setActiveTab] = useState("rides"); // "rides" | "shows"
  const [ridesData, setRidesData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const [favorites, setFavorites] = useState(() => loadPref("dwt_favorites", {}));
  const [alerts, setAlerts]       = useState(() => loadPref("dwt_alerts", {}));
  const [hidden, setHidden]       = useState(() => loadPref("dwt_hidden", {}));

  const [filter, setFilter]     = useState("all");
  const [sortBy, setSortBy]     = useState("wait");
  const [alertModal, setAlertModal] = useState(null);
  const [firedAlerts, setFiredAlerts] = useState({});
  const notifPerm = useRef("default");

  useEffect(() => { savePref("dwt_favorites", favorites); }, [favorites]);
  useEffect(() => { savePref("dwt_alerts", alerts); },     [alerts]);
  useEffect(() => { savePref("dwt_hidden", hidden); },     [hidden]);

  useEffect(() => {
    if ("Notification" in window) {
      notifPerm.current = Notification.permission;
      if (Notification.permission === "default") Notification.requestPermission().then(p => { notifPerm.current = p; });
    }
  }, []);

  const fetchParkData = useCallback(async (parkKey) => {
    const p = PARKS[parkKey];
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/waittimes?entityId=${p.entityId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const all = (data.liveData || []).filter(e => e.entityType === "ATTRACTION" || e.entityType === "SHOW");
      setRidesData(prev => ({ ...prev, [parkKey]: all }));
      setLastRefresh(new Date());
    } catch {
      setError("Couldn't load live wait times. Tap ↻ to retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (!ridesData[activePark]) fetchParkData(activePark); }, [activePark, fetchParkData, ridesData]);

  // Alert check
  useEffect(() => {
    Object.values(ridesData).flat().forEach(ride => {
      const threshold = alerts[ride.id];
      if (!threshold || firedAlerts[ride.id]) return;
      const wait = ride.queue?.STANDBY?.waitTime;
      if (wait == null || wait >= threshold) return;
      setFiredAlerts(prev => ({ ...prev, [ride.id]: true }));
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`🎢 ${ride.name}`, { body: `Wait is now ${wait} min — under your ${threshold} min alert!`, icon: "/favicon.ico" });
      }
    });
  }, [ridesData, alerts, firedAlerts]);

  const park = PARKS[activePark];
  const allEntities = ridesData[activePark] || [];

  // Split into rides vs shows using API entityType + name heuristics
  const rideEntities = allEntities.filter(e => !isShowEntity(e));
  const showEntities = allEntities.filter(e => isShowEntity(e));

  const openRides = rideEntities.filter(r => r.status === "OPERATING");
  const waitTimes = openRides.map(r => r.queue?.STANDBY?.waitTime).filter(w => w != null);
  const avgWait = waitTimes.length ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length) : null;
  const shortestRide = [...openRides].filter(r => r.queue?.STANDBY?.waitTime != null).sort((a, b) => a.queue.STANDBY.waitTime - b.queue.STANDBY.waitTime)[0];

  const filteredRides = rideEntities
    .filter(r => !hidden[r.id])
    .filter(r => {
      if (filter === "favorites") return favorites[r.id];
      if (filter === "high")   return inferThrill(r.name) === "high";
      if (filter === "medium") return inferThrill(r.name) === "medium";
      if (filter === "low")    return inferThrill(r.name) === "low";
      return true;
    })
    .sort((a, b) => {
      const af = favorites[a.id] ? 0 : 1, bf = favorites[b.id] ? 0 : 1;
      if (af !== bf) return af - bf;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      const aOpen = a.status === "OPERATING" ? 0 : 1, bOpen = b.status === "OPERATING" ? 0 : 1;
      if (aOpen !== bOpen) return aOpen - bOpen;
      return (a.queue?.STANDBY?.waitTime ?? 999) - (b.queue?.STANDBY?.waitTime ?? 999);
    });

  // Shows sorted: ones with upcoming times first, then by next showtime
  const filteredShows = showEntities
    .filter(s => !hidden[s.id])
    .filter(s => filter !== "favorites" || favorites[s.id])
    .sort((a, b) => {
      const af = favorites[a.id] ? 0 : 1, bf = favorites[b.id] ? 0 : 1;
      if (af !== bf) return af - bf;
      const aNext = (a.showtimes || []).find(st => isUpcoming(st.startTime));
      const bNext = (b.showtimes || []).find(st => isUpcoming(st.startTime));
      if (aNext && !bNext) return -1;
      if (!aNext && bNext) return 1;
      if (aNext && bNext) return new Date(aNext.startTime) - new Date(bNext.startTime);
      return a.name.localeCompare(b.name);
    });

  const hiddenCount = Object.values(hidden).filter(Boolean).length;

  const toggleFavorite = id => setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleHidden   = id => setHidden(prev => ({ ...prev, [id]: true }));
  const saveAlert = (rideId, threshold) => {
    setAlerts(prev => { const n = { ...prev }; threshold === null ? delete n[rideId] : (n[rideId] = threshold); return n; });
    setFiredAlerts(prev => { const n = { ...prev }; delete n[rideId]; return n; });
    setAlertModal(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", fontFamily: "Georgia, serif", padding: "0 0 40px", maxWidth: 430, margin: "0 auto" }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.9} } * { box-sizing: border-box; }`}</style>

      {alertModal && (
        <AlertModal ride={alertModal} existing={alerts[alertModal.id] != null ? { threshold: alerts[alertModal.id] } : null}
          onSave={t => saveAlert(alertModal.id, t)} onClose={() => setAlertModal(null)} accent={park.accent} />
      )}

      {/* Status bar */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px 0", color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "sans-serif" }}>
        <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        <span>Walt Disney World</span>
      </div>

      {/* Header */}
      <div style={{ padding: "16px 20px 20px", background: `linear-gradient(160deg, ${park.color}cc 0%, #0a0e1acc 100%)`, borderBottom: `2px solid ${park.accent}44` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, color: park.accent, fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: 2, marginBottom: 2 }}>Live Wait Times</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>{park.icon} {park.name}</div>
          </div>
          <button onClick={() => fetchParkData(activePark)} disabled={loading}
            style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, padding: "6px 10px", color: loading ? "rgba(255,255,255,0.3)" : "#fff", fontSize: 18, cursor: loading ? "default" : "pointer" }}>
            {loading ? "⟳" : "↻"}
          </button>
        </div>
        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "sans-serif", marginTop: 6 }}>
          {loading ? "Fetching live data…" : lastRefresh ? `Live · Updated ${lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Loading…"}
        </div>

        {/* Park tabs */}
        <div style={{ display: "flex", gap: 6, marginTop: 14, overflowX: "auto", paddingBottom: 2 }}>
          {Object.entries(PARKS).map(([id, p]) => (
            <button key={id} onClick={() => setActivePark(id)} style={{
              background: activePark === id ? park.accent : "rgba(255,255,255,0.07)",
              color: activePark === id ? "#000" : "rgba(255,255,255,0.55)",
              border: "none", borderRadius: 20, padding: "5px 12px", fontSize: 11,
              fontWeight: activePark === id ? 800 : 400, cursor: "pointer", whiteSpace: "nowrap",
              fontFamily: "sans-serif", transition: "all 0.2s",
            }}>{p.icon} {id.toUpperCase()}</button>
          ))}
        </div>

        {/* Rides / Shows tab switcher */}
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          {[{ id: "rides", label: "🎢 Rides" }, { id: "shows", label: "🎭 Shows" }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              flex: 1, padding: "8px 0", borderRadius: 10, border: "none",
              background: activeTab === t.id ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
              color: activeTab === t.id ? "#fff" : "rgba(255,255,255,0.4)",
              fontFamily: "sans-serif", fontWeight: activeTab === t.id ? 700 : 400,
              fontSize: 13, cursor: "pointer", transition: "all 0.2s",
              borderBottom: activeTab === t.id ? `2px solid ${park.accent}` : "2px solid transparent",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 16px 0" }}>
        {error && <div style={{ background: "rgba(231,76,60,0.15)", borderRadius: 12, padding: "12px 16px", marginBottom: 14, border: "1px solid rgba(231,76,60,0.3)", color: "#e74c3c", fontSize: 13, fontFamily: "sans-serif" }}>⚠️ {error}</div>}

        {/* ── RIDES TAB ── */}
        {activeTab === "rides" && (
          <>
            {!loading && rideEntities.length > 0 && (
              <>
                <CrowdMeter rides={rideEntities} />
                <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                  {[
                    { label: "Avg Wait", value: avgWait != null ? `${avgWait}m` : "—", icon: "⏱" },
                    { label: "Open Rides", value: openRides.length, icon: "🎢" },
                    { label: "Shortest", value: shortestRide ? `${shortestRide.queue.STANDBY.waitTime}m` : "—", icon: "✨" },
                  ].map((s, i) => (
                    <div key={i} style={{ flex: 1, ...cardStyle, padding: "10px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: 16 }}>{s.icon}</div>
                      <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, fontFamily: "monospace" }}>{s.value}</div>
                      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "sans-serif" }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 6, flex: 1, overflowX: "auto", paddingBottom: 2 }}>
                    {[{ id: "all", label: "All" }, { id: "favorites", label: "⭐ Favs" }, { id: "high", label: "🔥 Thrill" }, { id: "medium", label: "⚡ Mod" }, { id: "low", label: "🌿 Mild" }].map(f => (
                      <button key={f.id} onClick={() => setFilter(f.id)} style={{
                        background: filter === f.id ? park.accent : "rgba(255,255,255,0.07)",
                        color: filter === f.id ? "#000" : "rgba(255,255,255,0.55)",
                        border: "none", borderRadius: 20, padding: "4px 11px", fontSize: 11,
                        fontWeight: filter === f.id ? 800 : 400, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "sans-serif",
                      }}>{f.label}</button>
                    ))}
                  </div>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "4px 8px", fontSize: 11, fontFamily: "sans-serif", cursor: "pointer" }}>
                    <option value="wait">Wait ↑</option>
                    <option value="name">A–Z</option>
                  </select>
                </div>

                {hiddenCount > 0 && (
                  <button onClick={() => setHidden({})} style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)", border: "none", borderRadius: 20, padding: "4px 12px", fontSize: 11, cursor: "pointer", fontFamily: "sans-serif", marginBottom: 14 }}>
                    Unhide all ({hiddenCount})
                  </button>
                )}
              </>
            )}

            {loading && Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)}

            {!loading && !error && rideEntities.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.3)", fontFamily: "sans-serif", fontSize: 14 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{park.icon}</div>
                <div>Tap ↻ to load live wait times</div>
              </div>
            )}

            {!loading && filteredRides.length > 0 && (
              <>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "sans-serif", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                  {filteredRides.length} rides · ☆ fav · 🔔 alert · tap to expand
                </div>
                {filteredRides.map(ride => (
                  <RideCard key={ride.id} ride={ride} accent={park.accent}
                    isFavorite={!!favorites[ride.id]} onToggleFavorite={() => toggleFavorite(ride.id)}
                    alertThreshold={alerts[ride.id] ?? null} onSetAlert={() => setAlertModal(ride)}
                    isHidden={!!hidden[ride.id]} onToggleHidden={() => toggleHidden(ride.id)} />
                ))}
              </>
            )}

            {!loading && filter === "favorites" && filteredRides.length === 0 && (
              <div style={{ textAlign: "center", padding: "30px 20px", color: "rgba(255,255,255,0.3)", fontFamily: "sans-serif", fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>☆</div>
                Tap ☆ on any ride to add it to favorites
              </div>
            )}
          </>
        )}

        {/* ── SHOWS TAB ── */}
        {activeTab === "shows" && (
          <>
            {!loading && showEntities.length > 0 && (
              <>
                {/* Shows today count */}
                <div style={{ ...cardStyle, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 10 }}>
                  {[
                    { label: "Total Shows", value: showEntities.length, icon: "🎭" },
                    { label: "With Times", value: showEntities.filter(s => (s.showtimes || []).length > 0).length, icon: "🕐" },
                    { label: "Upcoming", value: showEntities.filter(s => (s.showtimes || []).some(st => isUpcoming(st.startTime))).length, icon: "▶️" },
                  ].map((s, i) => (
                    <div key={i} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: 16 }}>{s.icon}</div>
                      <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, fontFamily: "monospace" }}>{s.value}</div>
                      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "sans-serif" }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                  {[{ id: "all", label: "All" }, { id: "favorites", label: "⭐ Favs" }].map(f => (
                    <button key={f.id} onClick={() => setFilter(f.id)} style={{
                      background: filter === f.id ? park.accent : "rgba(255,255,255,0.07)",
                      color: filter === f.id ? "#000" : "rgba(255,255,255,0.55)",
                      border: "none", borderRadius: 20, padding: "4px 12px",
                      fontSize: 11, fontWeight: filter === f.id ? 800 : 400,
                      cursor: "pointer", fontFamily: "sans-serif",
                    }}>{f.label}</button>
                  ))}
                </div>
              </>
            )}

            {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}

            {!loading && showEntities.length === 0 && !error && (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.3)", fontFamily: "sans-serif", fontSize: 14 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎭</div>
                <div>Tap ↻ to load show schedules</div>
              </div>
            )}

            {!loading && filteredShows.length > 0 && (
              <>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "sans-serif", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                  {filteredShows.length} shows · tap for full schedule
                </div>
                {filteredShows.map(show => (
                  <ShowCard key={show.id} show={show} accent={park.accent}
                    isFavorite={!!favorites[show.id]} onToggleFavorite={() => toggleFavorite(show.id)}
                    isHidden={!!hidden[show.id]} onToggleHidden={() => toggleHidden(show.id)} />
                ))}
              </>
            )}
          </>
        )}

        {/* Footer */}
        {!loading && allEntities.length > 0 && (
          <div style={{ background: `linear-gradient(135deg, ${park.color}55, transparent)`, borderRadius: 14, padding: "14px 16px", marginTop: 6, border: `1px solid ${park.accent}33` }}>
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
