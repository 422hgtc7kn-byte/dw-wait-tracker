import { useState, useEffect, useCallback, useRef } from "react";

const PARKS = {
  mk: { name: "Magic Kingdom", entityId: "75ea578a-adc8-4116-a54d-dccb60765ef9", icon: "🏰", color: "#1a3a6b", accent: "#c8a951" },
  ep: { name: "EPCOT", entityId: "47f90d2c-e191-4239-a466-5892ef59a88b", icon: "🌍", color: "#1a5276", accent: "#58d68d" },
  hs: { name: "Hollywood Studios", entityId: "288747d1-8b4f-4a64-867e-ea7c9b27bad8", icon: "🎬", color: "#4a1a2c", accent: "#e74c3c" },
  ak: { name: "Animal Kingdom", entityId: "1c84a229-8862-4648-9c71-378ddd2c7693", icon: "🦁", color: "#1e4d2b", accent: "#f39c12" },
};

// ── localStorage helpers ──────────────────────────────────────────────────────
function loadPref(key, fallback) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function savePref(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ── Classification helpers ────────────────────────────────────────────────────
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

function isShow(name) {
  const n = name.toLowerCase();
  return n.includes("show") || n.includes("theater") || n.includes("theatre") ||
    n.includes("film") || n.includes("movie") || n.includes("presentation") ||
    n.includes("stage") || n.includes("performance") || n.includes("symphony") ||
    n.includes("philharmagic") || n.includes("enchantment") || n.includes("firework") ||
    n.includes("parade") || n.includes("nighttime") || n.includes("fantasy in the sky") ||
    n.includes("happily ever after") || n.includes("epcot forever") || n.includes("luminous") ||
    n.includes("indiana jones") || n.includes("beauty and the beast") || n.includes("frozen sing") ||
    n.includes("lion king") || n.includes("finding nemo") || n.includes("nemo") ||
    n.includes("animation") || n.includes("turtle talk");
}

// ── Shared style tokens ───────────────────────────────────────────────────────
const card = {
  background: "rgba(255,255,255,0.04)", borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
};

// ── Sub-components ────────────────────────────────────────────────────────────
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
    <div style={{ ...card, padding: "14px 16px", marginBottom: 10 }}>
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

// ── Notification alert modal ─────────────────────────────────────────────────
function AlertModal({ ride, existing, onSave, onClose, accent }) {
  const [threshold, setThreshold] = useState(existing?.threshold ?? 30);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#161c2e", borderRadius: "20px 20px 0 0", padding: "24px 24px 40px", width: "100%", maxWidth: 430 }}>
        <div style={{ color: accent, fontSize: 11, fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Set Wait Alert</div>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 17, fontFamily: "Georgia, serif", marginBottom: 4 }}>{ride.name}</div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "sans-serif", marginBottom: 20 }}>
          Notify me when the wait drops below:
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <input type="range" min={5} max={120} step={5} value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            style={{ flex: 1, accentColor: accent }} />
          <span style={{ color: accent, fontWeight: 800, fontSize: 22, fontFamily: "monospace", minWidth: 52, textAlign: "right" }}>{threshold}m</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {existing && (
            <button onClick={() => onSave(null)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#e74c3c", fontFamily: "sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Remove Alert
            </button>
          )}
          <button onClick={() => onSave(threshold)} style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: accent, color: "#000", fontFamily: "sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
            {existing ? "Update Alert" : "Set Alert"} 🔔
          </button>
        </div>
      </div>
    </div>
  );
}

// ── RideCard ──────────────────────────────────────────────────────────────────
function RideCard({ ride, accent, isFavorite, onToggleFavorite, alertThreshold, onSetAlert, isHidden, onToggleHidden }) {
  const [expanded, setExpanded] = useState(false);
  const thrill = inferThrill(ride.name);
  const show = isShow(ride.name);
  const isOperating = ride.status === "OPERATING";
  const wait = ride.queue?.STANDBY?.waitTime ?? null;
  const hasAlert = alertThreshold != null;

  if (isHidden) return null;

  return (
    <div style={{
      ...card,
      padding: "14px 16px", marginBottom: 10,
      border: isFavorite ? `1px solid ${accent}55` : card.border,
      background: isFavorite ? `rgba(255,255,255,0.06)` : card.background,
      opacity: ride.status === "REFURBISHMENT" ? 0.45 : 1,
      transition: "all 0.2s",
    }}>
      {/* Main row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ flex: 1, paddingRight: 10, cursor: isOperating ? "pointer" : "default" }}
          onClick={() => isOperating && setExpanded(e => !e)}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            {isFavorite && <span style={{ fontSize: 12 }}>⭐</span>}
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "Georgia, serif" }}>{ride.name}</span>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            {show ? (
              <span style={{ fontSize: 10, color: "#9b59b6", border: "1px solid #9b59b6", borderRadius: 4, padding: "1px 5px", fontFamily: "sans-serif", fontWeight: 600 }}>Show</span>
            ) : (
              <ThrillBadge level={thrill} />
            )}
            {ride.queue?.SINGLE_RIDER != null && (
              <span style={{ fontSize: 10, color: "#8e44ad", border: "1px solid #8e44ad", borderRadius: 4, padding: "1px 5px", fontFamily: "sans-serif" }}>Single Rider</span>
            )}
            {hasAlert && (
              <span style={{ fontSize: 10, color: "#3498db", border: "1px solid #3498db", borderRadius: 4, padding: "1px 5px", fontFamily: "sans-serif" }}>🔔 &lt;{alertThreshold}m</span>
            )}
          </div>
        </div>
        {/* Action buttons + wait badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {/* Favorite */}
          <button onClick={e => { e.stopPropagation(); onToggleFavorite(); }}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: 2, opacity: isFavorite ? 1 : 0.3, transition: "opacity 0.2s" }}>
            {isFavorite ? "⭐" : "☆"}
          </button>
          {/* Alert */}
          <button onClick={e => { e.stopPropagation(); onSetAlert(); }}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 2, opacity: hasAlert ? 1 : 0.3, transition: "opacity 0.2s" }}>
            🔔
          </button>
          <div style={{ textAlign: "right" }}>
            <WaitBadge minutes={wait} status={ride.status} />
            {isOperating && wait != null && (
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, marginTop: 3, fontFamily: "sans-serif" }}>standby</div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded detail */}
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
              <span style={{ color: accent, fontSize: 11, fontFamily: "sans-serif" }}>🎟 Individual Lightning Lane available</span>
            </div>
          )}
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "sans-serif" }}>
            💡 {thrill === "high" ? "Use Lightning Lane or queue right at park open for shortest waits." : "This ride loads quickly — check the line as you walk past."}
          </div>
          {/* Hide this ride option */}
          <button onClick={() => onToggleHidden()} style={{
            marginTop: 12, width: "100%", padding: "8px", borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
            color: "rgba(255,255,255,0.35)", fontFamily: "sans-serif", fontSize: 11,
            cursor: "pointer", textAlign: "center",
          }}>
            Hide this {show ? "show" : "ride"} from list
          </button>
          {ride.lastUpdated && (
            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, fontFamily: "sans-serif", marginTop: 8 }}>
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
        <span style={{ color, fontWeight: 700, fontSize: 13, fontFamily: "monospace" }}>{level}</span>
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

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [activePark, setActivePark] = useState("mk");
  const [ridesData, setRidesData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Persistent user prefs
  const [favorites, setFavorites] = useState(() => loadPref("dwt_favorites", {}));
  const [alerts, setAlerts] = useState(() => loadPref("dwt_alerts", {}));       // { rideId: threshold }
  const [hidden, setHidden] = useState(() => loadPref("dwt_hidden", {}));       // { rideId: true }

  // UI state
  const [filter, setFilter] = useState("all");   // all | favorites | high | medium | low | shows
  const [sortBy, setSortBy] = useState("wait");
  const [hideShows, setHideShows] = useState(() => loadPref("dwt_hideShows", false));
  const [alertModal, setAlertModal] = useState(null);  // ride object or null
  const [firedAlerts, setFiredAlerts] = useState({});  // { rideId: true } — don't re-fire same session
  const notifPerm = useRef("default");

  const park = PARKS[activePark];

  // ── Persist prefs ────────────────────────────────────────────────────────
  useEffect(() => { savePref("dwt_favorites", favorites); }, [favorites]);
  useEffect(() => { savePref("dwt_alerts", alerts); }, [alerts]);
  useEffect(() => { savePref("dwt_hidden", hidden); }, [hidden]);
  useEffect(() => { savePref("dwt_hideShows", hideShows); }, [hideShows]);

  // ── Request notification permission on mount ─────────────────────────────
  useEffect(() => {
    if ("Notification" in window) {
      notifPerm.current = Notification.permission;
      if (Notification.permission === "default") {
        Notification.requestPermission().then(p => { notifPerm.current = p; });
      }
    }
  }, []);

  // ── Data fetching ────────────────────────────────────────────────────────
  const fetchParkData = useCallback(async (parkKey) => {
    const p = PARKS[parkKey];
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/waittimes?entityId=${p.entityId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const rides = (data.liveData || []).filter(e => e.entityType === "ATTRACTION");
      setRidesData(prev => ({ ...prev, [parkKey]: rides }));
      setLastRefresh(new Date());
    } catch {
      setError("Couldn't load live wait times. Tap ↻ to retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!ridesData[activePark]) fetchParkData(activePark);
  }, [activePark, fetchParkData, ridesData]);

  // ── Alert checking — runs whenever ride data refreshes ───────────────────
  useEffect(() => {
    const allRides = Object.values(ridesData).flat();
    allRides.forEach(ride => {
      const threshold = alerts[ride.id];
      if (!threshold) return;
      const wait = ride.queue?.STANDBY?.waitTime;
      if (wait == null || wait >= threshold) return;
      if (firedAlerts[ride.id]) return;  // already notified this session

      setFiredAlerts(prev => ({ ...prev, [ride.id]: true }));

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`🎢 ${ride.name}`, {
          body: `Wait is now ${wait} min — under your ${threshold} min alert!`,
          icon: "/favicon.ico",
        });
      }
    });
  }, [ridesData, alerts, firedAlerts]);

  // ── Derived data ─────────────────────────────────────────────────────────
  const rawRides = ridesData[activePark] || [];
  const openRides = rawRides.filter(r => r.status === "OPERATING");
  const waitTimes = openRides.map(r => r.queue?.STANDBY?.waitTime).filter(w => w != null);
  const avgWait = waitTimes.length ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length) : null;
  const shortestRide = [...openRides].filter(r => r.queue?.STANDBY?.waitTime != null)
    .sort((a, b) => a.queue.STANDBY.waitTime - b.queue.STANDBY.waitTime)[0];

  const filteredRides = rawRides
    .filter(r => !hidden[r.id])
    .filter(r => !hideShows || !isShow(r.name))
    .filter(r => {
      if (filter === "favorites") return favorites[r.id];
      if (filter === "shows") return isShow(r.name);
      if (filter === "high") return inferThrill(r.name) === "high";
      if (filter === "medium") return inferThrill(r.name) === "medium";
      if (filter === "low") return inferThrill(r.name) === "low";
      return true;
    })
    .sort((a, b) => {
      // Favorites always float to top
      const af = favorites[a.id] ? 0 : 1;
      const bf = favorites[b.id] ? 0 : 1;
      if (af !== bf) return af - bf;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      const aOpen = a.status === "OPERATING" ? 0 : 1;
      const bOpen = b.status === "OPERATING" ? 0 : 1;
      if (aOpen !== bOpen) return aOpen - bOpen;
      return (a.queue?.STANDBY?.waitTime ?? 999) - (b.queue?.STANDBY?.waitTime ?? 999);
    });

  const hiddenCount = Object.values(hidden).filter(Boolean).length;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const toggleFavorite = (id) => setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleHidden = (id) => setHidden(prev => ({ ...prev, [id]: true }));
  const saveAlert = (rideId, threshold) => {
    setAlerts(prev => {
      const next = { ...prev };
      if (threshold === null) delete next[rideId];
      else next[rideId] = threshold;
      return next;
    });
    // Reset fired state so new threshold can trigger
    setFiredAlerts(prev => { const n = { ...prev }; delete n[rideId]; return n; });
    setAlertModal(null);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", fontFamily: "Georgia, serif", padding: "0 0 40px", maxWidth: 430, margin: "0 auto" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
        * { box-sizing: border-box; }
        input[type=range] { width: 100%; }
      `}</style>

      {/* Alert modal */}
      {alertModal && (
        <AlertModal
          ride={alertModal}
          existing={alerts[alertModal.id] != null ? { threshold: alerts[alertModal.id] } : null}
          onSave={(t) => saveAlert(alertModal.id, t)}
          onClose={() => setAlertModal(null)}
          accent={park.accent}
        />
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
          {loading ? "Fetching live wait times…" : lastRefresh ? `Live · Updated ${lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Loading…"}
        </div>

        {/* Park tabs */}
        <div style={{ display: "flex", gap: 6, marginTop: 14, overflowX: "auto", paddingBottom: 2 }}>
          {Object.entries(PARKS).map(([id, p]) => (
            <button key={id} onClick={() => setActivePark(id)} style={{
              background: activePark === id ? park.accent : "rgba(255,255,255,0.07)",
              color: activePark === id ? "#000" : "rgba(255,255,255,0.55)",
              border: "none", borderRadius: 20, padding: "5px 12px",
              fontSize: 11, fontWeight: activePark === id ? 800 : 400,
              cursor: "pointer", whiteSpace: "nowrap", fontFamily: "sans-serif", transition: "all 0.2s",
            }}>{p.icon} {id.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 16px 0" }}>
        {error && (
          <div style={{ background: "rgba(231,76,60,0.15)", borderRadius: 12, padding: "12px 16px", marginBottom: 14, border: "1px solid rgba(231,76,60,0.3)", color: "#e74c3c", fontSize: 13, fontFamily: "sans-serif" }}>
            ⚠️ {error}
          </div>
        )}

        {!loading && rawRides.length > 0 && (
          <>
            <CrowdMeter rides={rawRides} />

            {/* Stats */}
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              {[
                { label: "Avg Wait", value: avgWait != null ? `${avgWait}m` : "—", icon: "⏱" },
                { label: "Open Rides", value: openRides.length, icon: "🎢" },
                { label: "Shortest", value: shortestRide ? `${shortestRide.queue.STANDBY.waitTime}m` : "—", icon: "✨" },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, ...card, padding: "10px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 16 }}>{s.icon}</div>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, fontFamily: "monospace" }}>{s.value}</div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "sans-serif" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Filter + sort row */}
            <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
              <div style={{ display: "flex", gap: 6, flex: 1, overflowX: "auto", paddingBottom: 2 }}>
                {[
                  { id: "all", label: "All" },
                  { id: "favorites", label: "⭐ Favs" },
                  { id: "high", label: "🔥 Thrill" },
                  { id: "medium", label: "⚡ Mod" },
                  { id: "low", label: "🌿 Mild" },
                  { id: "shows", label: "🎭 Shows" },
                ].map(f => (
                  <button key={f.id} onClick={() => setFilter(f.id)} style={{
                    background: filter === f.id ? park.accent : "rgba(255,255,255,0.07)",
                    color: filter === f.id ? "#000" : "rgba(255,255,255,0.55)",
                    border: "none", borderRadius: 20, padding: "4px 11px",
                    fontSize: 11, fontWeight: filter === f.id ? 800 : 400,
                    cursor: "pointer", whiteSpace: "nowrap", fontFamily: "sans-serif",
                  }}>{f.label}</button>
                ))}
              </div>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
                background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
                padding: "4px 8px", fontSize: 11, fontFamily: "sans-serif", cursor: "pointer",
              }}>
                <option value="wait">Wait ↑</option>
                <option value="name">A–Z</option>
              </select>
            </div>

            {/* Show/hide shows toggle + unhide button */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
              <button onClick={() => setHideShows(h => !h)} style={{
                background: hideShows ? park.accent : "rgba(255,255,255,0.07)",
                color: hideShows ? "#000" : "rgba(255,255,255,0.55)",
                border: "none", borderRadius: 20, padding: "4px 12px",
                fontSize: 11, fontWeight: hideShows ? 800 : 400,
                cursor: "pointer", fontFamily: "sans-serif",
              }}>
                {hideShows ? "🎭 Shows hidden" : "🎭 Hide shows"}
              </button>
              {hiddenCount > 0 && (
                <button onClick={() => setHidden({})} style={{
                  background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)",
                  border: "none", borderRadius: 20, padding: "4px 12px",
                  fontSize: 11, cursor: "pointer", fontFamily: "sans-serif",
                }}>
                  Unhide all ({hiddenCount})
                </button>
              )}
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
              {filteredRides.length} attractions · ☆ fav · 🔔 alert · tap to expand
            </div>
            {filteredRides.map(ride => (
              <RideCard
                key={ride.id}
                ride={ride}
                accent={park.accent}
                isFavorite={!!favorites[ride.id]}
                onToggleFavorite={() => toggleFavorite(ride.id)}
                alertThreshold={alerts[ride.id] ?? null}
                onSetAlert={() => setAlertModal(ride)}
                isHidden={!!hidden[ride.id]}
                onToggleHidden={() => toggleHidden(ride.id)}
              />
            ))}
          </>
        )}

        {!loading && filter === "favorites" && filteredRides.length === 0 && (
          <div style={{ textAlign: "center", padding: "30px 20px", color: "rgba(255,255,255,0.3)", fontFamily: "sans-serif", fontSize: 13 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>☆</div>
            Tap the ☆ on any ride to add it to favorites
          </div>
        )}

        {!loading && rawRides.length > 0 && (
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
