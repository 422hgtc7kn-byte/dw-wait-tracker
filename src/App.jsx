import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import TrendChart from "./TrendChart.jsx";
import CrowdTrend from "./CrowdTrend.jsx";
import AuthScreen from "./AuthScreen.jsx";
import TripPredictor from "./TripPredictor.jsx";
import CrowdCalendar from "./CrowdCalendar.jsx";
import DayPlanner from "./DayPlanner.jsx";
import { getRideDetails, fmtHeight } from "./rideDetails.js";
import { bestHours, PARK_OPEN_HOUR, HOUR_LABELS, mergeWithTypical } from "./trends.js";
import { getETHour, getETDay } from "./etHour.js";

// ── Profile sync helpers ──────────────────────────────────────────────────────
async function loadProfile(token) {
  try {
    const res = await fetch("/api/profile", { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.profile || null;
  } catch { return null; }
}

async function saveProfile(token, profile) {
  try {
    await fetch("/api/profile", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
  } catch {}
}

// ── Theme tokens ──────────────────────────────────────────────────────────────
const LIGHT = {
  bg: "#f5f6fa", surface: "#ffffff", border: "#e8eaef",
  text: "#1a1d23", textSub: "#6b7280", textMuted: "#9ca3af",
  skeletonA: "#f3f4f6", skeletonB: "#f9fafb",
  chartBg: "#f5f6fa", shadow: "0 1px 3px rgba(0,0,0,0.07)",
};
const DARK = {
  bg: "#0f1117", surface: "#1a1d2e", border: "#2a2d3e",
  text: "#f1f3f9", textSub: "#8b93a8", textMuted: "#555e72",
  skeletonA: "rgba(255,255,255,0.07)", skeletonB: "rgba(255,255,255,0.04)",
  chartBg: "#13151f", shadow: "none",
};
// Bowser Jr palette — based on actual character:
// Yellow body (#f5c800), green shell/head (#2d8a00), white bandana (#ffffff),
// dark shell background (#1a3d00), orange accents (#e86c00), black eyes (#111)
const GREGGY = {
  bg:        "#0d1f00",  // deep dark green (shell shadow)
  surface:   "#1a3d00",  // dark green (shell)
  border:    "#2d6600",  // mid green
  text:      "#ffffff",  // white (bandana)
  textSub:   "#f5c800",  // Bowser Jr yellow
  textMuted: "#7ab800",  // lighter green
  skeletonA: "rgba(245,200,0,0.1)",
  skeletonB: "rgba(245,200,0,0.05)",
  chartBg:   "#112900",
  shadow:    "none",
  greggy:    true,
};

// Greggy park overrides
const GREGGY_PARK = {
  color:       "#1a5200",  // dark green header
  accent:      "#f5c800",  // Bowser Jr yellow
  accentLight: "#1a3d00",  // dark green surface
  accentDark:  "#0d1f00",  // deeper green
};

// Responsive breakpoints
const BREAKPOINTS = { mobile: 480, tablet: 900 };
const FONT = "'Inter', sans-serif";

const PARKS = {
  mk: { name: "Magic Kingdom",     entityId: "75ea578a-adc8-4116-a54d-dccb60765ef9", icon: "🏰", color: "#1a3a6b", accent: "#2563eb", accentLight: "#dbeafe", accentDark: "#1e3a6e",
        mapLat: 28.4177, mapLng: -81.5812 },
  ep: { name: "EPCOT",             entityId: "47f90d2c-e191-4239-a466-5892ef59a88b", icon: "🌍", color: "#065f46", accent: "#059669", accentLight: "#d1fae5", accentDark: "#064e3b",
        mapLat: 28.3747, mapLng: -81.5494 },
  hs: { name: "Hollywood Studios", entityId: "288747d1-8b4f-4a64-867e-ea7c9b27bad8", icon: "🎬", color: "#7f1d1d", accent: "#dc2626", accentLight: "#fee2e2", accentDark: "#450a0a",
        mapLat: 28.3574, mapLng: -81.5582 },
  ak: { name: "Animal Kingdom",    entityId: "1c84a229-8862-4648-9c71-378ddd2c7693", icon: "🦁", color: "#78350f", accent: "#d97706", accentLight: "#fef3c7", accentDark: "#451a03",
        mapLat: 28.3553, mapLng: -81.5901 },
};

// ── Manual thrill overrides (name lowercase → level) ─────────────────────────
// Fix misclassified rides — add more here as needed
const THRILL_OVERRIDES = {
  "under the sea ~ journey of the little mermaid": "low",
  "journey of the little mermaid": "low",
  "little mermaid": "low",
  "dumbo the flying elephant": "low",
  "magic carpets of aladdin": "low",
  "astro orbiter": "low",
  "triceratop spin": "low",
  "tomorrowland speedway": "low",
  "the barnstormer": "low",
  "prince charming regal carrousel": "low",
  "mad tea party": "low",
  "walt disney world railroad": "low",
  "peoplemover": "low",
  "buzz lightyear": "low",
  "monsters inc": "low",
  "living with the land": "low",
  "spaceship earth": "low",
  "frozen ever after": "medium",
  "remy": "low",
  "na'vi river journey": "low",
  "kilimanjaro safaris": "low",
  "millennium falcon": "high",
  "casey jr": "low",
  "pirate's adventure": "low",
  "pirates adventure": "low",
  "cinderella castle": "low",
  "main street vehicles": "low",
  "main street electrical": "low",
  "a pirate": "low",
  "treasures of the seven seas": "low",
  "alien swirling": "low",
  "saucers": "low",
  "star wars launch bay": "low",
  // Water park slides
  "summit plummet": "high",
  "slush gusher": "high",
  "teamboat springs": "medium",
  "toboggan racers": "medium",
  "run-off rapids": "medium",
  "chair lift": "low",
  "cross country creek": "low",
  "tike's peak": "low",
  "ski patrol": "low",
  "crush 'n' gusher": "high",
  "humunga kowabunga": "high",
  "storm slides": "medium",
  "mayday falls": "medium",
  "gang plank falls": "medium",
  "miss adventure falls": "medium",
  "ketchakiddee creek": "low",
  "castaway creek": "low",
  "bay slides": "low",
  "typhoon lagoon surf pool": "low",
  "turtle talk": "low",
  "turtle": "low",
};

function loadPref(key, fallback) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function savePref(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }

function inferThrill(name) {
  const n = name.toLowerCase();
  // Check manual overrides first
  for (const [key, level] of Object.entries(THRILL_OVERRIDES)) {
    if (n.includes(key)) return level;
  }
  if (n.includes("coaster") || n.includes("mountain") || n.includes("everest") ||
      n.includes("tower") || n.includes("rock ") || n.includes("resistance") ||
      n.includes("flight of passage") || n.includes("guardians") || n.includes("dinosaur") ||
      n.includes("smugglers") || n.includes("slinky") || n.includes("splash") ||
      n.includes("rapids") || n.includes("runaway railway") || n.includes("tron")) return "high";
  if (n.includes("test track") || n.includes("soarin") || n.includes("safari") ||
      n.includes("ratatouille") || n.includes("haunted") ||
      n.includes("pirates") || n.includes("toy story mania") ||
      n.includes("journey") || n.includes("frozen")) return "medium";
  return "low";
}

function isShowEntity(entity) {
  if (entity.entityType === "SHOW") return true;
  const n = (entity.name || "").toLowerCase();
  return n.includes("show") || n.includes("theater") || n.includes("theatre") ||
    n.includes("film") || n.includes("movie") || n.includes("presentation") ||
    n.includes("stage") || n.includes("performance") || n.includes("symphony") ||
    n.includes("philharmagic") || n.includes("enchantment") || n.includes("firework") ||
    n.includes("parade") || n.includes("nighttime") || n.includes("happily ever after") ||
    n.includes("epcot forever") || n.includes("luminous") || n.includes("indiana jones") ||
    n.includes("beauty and the beast") || n.includes("frozen sing") || n.includes("lion king") ||
    n.includes("finding nemo") || n.includes("animation") || n.includes("turtle talk");
}

function fmtTime(iso) {
  try { return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); } catch { return iso; }
}
function isUpcoming(iso) {
  try { return new Date(iso) > Date.now() - 5 * 60 * 1000; } catch { return false; }
}
function cardStyle(T) {
  return { background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, boxShadow: T.shadow };
}

async function saveHistory(rides) {
  const snapshots = rides
    .filter(r => r.status === "OPERATING" && r.queue?.STANDBY?.waitTime != null)
    .map(r => ({ id: r.id, wait: r.queue.STANDBY.waitTime, ts: Date.now() }));
  if (!snapshots.length) return;
  try { await fetch("/api/history", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ snapshots }) }); } catch {}
}

// Client-side season helper — must match api/season.js exactly
function getClientSeason(date) {
  const d = date || new Date();
  const m  = d.getMonth() + 1;
  const dy = d.getDate();
  const md = m * 100 + dy;
  if (md >= 1215 || md <= 105) return 'peak';
  if (md >= 315  && md <= 415) return 'peak';
  if (md >= 628  && md <= 707) return 'peak';
  if (md >= 1122 && md <= 1130) return 'peak';
  if (m >= 6 && m <= 8) return 'summer';
  if (m === 9 || m === 10) return 'holiday';
  if (m === 11 && md < 1122) return 'holiday';
  if (md >= 1201 && md <= 1214) return 'holiday';
  return 'value';
}

const SEASON_META = {
  value:   { label: 'Value',   icon: '🟢', tip: 'Jan–Feb, early Sep/Dec' },
  holiday: { label: 'Holiday', icon: '🟡', tip: 'Halloween, Nov, early Dec' },
  summer:  { label: 'Summer',  icon: '🟠', tip: 'June–August' },
  peak:    { label: 'Peak',    icon: '🔴', tip: 'Christmas, Spring Break, July 4, Thanksgiving' },
};

async function fetchTrend(rideId, season = 'all') {
  try {
    const param = season !== 'all' ? `&season=${season}` : '';
    const res = await fetch(`/api/history?rideId=${rideId}${param}`);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

// ── WaitBadge ─────────────────────────────────────────────────────────────────
function WaitBadge({ minutes, status, dark }) {
  if (status === "CLOSED" || status === "DOWN" || status === "REFURBISHMENT") {
    const label = status === "REFURBISHMENT" ? "Refurb" : status === "DOWN" ? "Down" : "Closed";
    return <span style={{ background: dark?"rgba(255,255,255,0.08)":"#f3f4f6", color: dark?"#555e72":"#9ca3af", borderRadius:20, padding:"4px 12px", fontSize:12, fontWeight:600, fontFamily:FONT, display:"inline-block", textAlign:"center" }}>{label}</span>;
  }
  const [bg,fg] = dark
    ? (minutes==null?["#1e2130","#555e72"]:minutes<20?["#052e16","#4ade80"]:minutes<40?["#422006","#fbbf24"]:minutes<60?["#431407","#fb923c"]:["#3b0a0a","#f87171"])
    : (minutes==null?["#f3f4f6","#6b7280"]:minutes<20?["#dcfce7","#15803d"]:minutes<40?["#fef9c3","#854d0e"]:minutes<60?["#ffedd5","#9a3412"]:["#fee2e2","#991b1b"]);
  return <span style={{ background:bg, color:fg, borderRadius:20, padding:"4px 12px", fontSize:13, fontWeight:700, fontFamily:FONT, minWidth:52, display:"inline-block", textAlign:"center" }}>{minutes!=null?`${minutes}m`:"—"}</span>;
}

function ThrillBadge({ level, dark }) {
  const map = {
    high:   { label:"Thrill",   l:["#fee2e2","#991b1b"], d:["#3b0a0a","#f87171"] },
    medium: { label:"Moderate", l:["#fef9c3","#854d0e"], d:["#422006","#fbbf24"] },
    low:    { label:"Mild",     l:["#dcfce7","#15803d"], d:["#052e16","#4ade80"] },
  };
  const { label, l, d } = map[level] || map.low;
  const [bg, color] = dark ? d : l;
  return <span style={{ fontSize:10, color, background:bg, borderRadius:6, padding:"2px 7px", fontFamily:FONT, fontWeight:600 }}>{label}</span>;
}

function SkeletonCard({ T }) {
  return (
    <div style={{ ...cardStyle(T), padding:"16px", marginBottom:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ width:160, height:14, borderRadius:6, background:T.skeletonA, marginBottom:8, animation:"pulse 1.5s infinite" }} />
          <div style={{ width:90,  height:10, borderRadius:6, background:T.skeletonB, animation:"pulse 1.5s infinite" }} />
        </div>
        <div style={{ width:56, height:28, borderRadius:20, background:T.skeletonA, animation:"pulse 1.5s infinite" }} />
      </div>
    </div>
  );
}

// ── In-app alert banner (replaces Web Notifications which don't work on Firefox iOS) ──
function AlertBanner({ alerts: alertList, onDismiss, T, dark }) {
  if (!alertList.length) return null;
  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:200, maxWidth:430, margin:"0 auto" }}>
      {alertList.map((a, i) => (
        <div key={i} style={{
          background: dark ? "#052e16" : "#dcfce7",
          borderBottom: `2px solid #22c55e`,
          padding: "14px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ color: dark?"#4ade80":"#15803d", fontFamily:FONT, fontWeight:700, fontSize:14 }}>
              🔔 Wait Alert — {a.name}
            </div>
            <div style={{ color: dark?"#86efac":"#166534", fontFamily:FONT, fontSize:12, marginTop:2 }}>
              Wait is now {a.wait} min — under your {a.threshold} min alert!
            </div>
          </div>
          <button onClick={() => onDismiss(i)} style={{ background:"none", border:"none", fontSize:18, cursor:"pointer", color: dark?"#4ade80":"#15803d", padding:"0 4px" }}>✕</button>
        </div>
      ))}
    </div>
  );
}

function AlertModal({ ride, existing, onSave, onClose, accent, T }) {
  const [threshold, setThreshold] = useState(existing?.threshold ?? 30);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:100, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:T.surface, borderRadius:"24px 24px 0 0", padding:"28px 24px 44px", width:"100%", maxWidth:430, boxShadow:"0 -4px 24px rgba(0,0,0,0.2)" }}>
        <div style={{ width:36, height:4, borderRadius:2, background:T.border, margin:"0 auto 20px" }} />
        <div style={{ color:accent, fontSize:11, fontFamily:FONT, textTransform:"uppercase", letterSpacing:1.5, fontWeight:700, marginBottom:6 }}>Set Wait Alert</div>
        <div style={{ color:T.text, fontWeight:700, fontSize:18, fontFamily:FONT, marginBottom:4 }}>{ride.name}</div>
        <div style={{ color:T.textSub, fontSize:13, fontFamily:FONT, marginBottom:24 }}>Show an alert when the wait drops below:</div>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:28 }}>
          <input type="range" min={5} max={120} step={5} value={threshold} onChange={e => setThreshold(Number(e.target.value))} style={{ flex:1, accentColor:accent }} />
          <span style={{ color:accent, fontWeight:800, fontSize:24, fontFamily:FONT, minWidth:52, textAlign:"right" }}>{threshold}m</span>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          {existing && <button onClick={() => onSave(null)} style={{ flex:1, padding:13, borderRadius:14, border:`1px solid ${T.border}`, background:T.bg, color:"#dc2626", fontFamily:FONT, fontWeight:600, fontSize:14, cursor:"pointer" }}>Remove</button>}
          <button onClick={() => onSave(threshold)} style={{ flex:2, padding:13, borderRadius:14, border:"none", background:accent, color:"#fff", fontFamily:FONT, fontWeight:700, fontSize:14, cursor:"pointer" }}>
            {existing ? "Update Alert" : "Set Alert"} 🔔
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Map Modal using OpenStreetMap + Leaflet ───────────────────────────────────
function MapModal({ park, onClose, T, dark }) {
  const mapRef = useRef(null);
  const leafletRef = useRef(null);

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }

    // Load Leaflet JS then init map
    const initMap = () => {
      if (!mapRef.current || leafletRef.current) return;
      const L = window.L;
      const map = L.map(mapRef.current).setView([park.mapLat, park.mapLng], 16);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
      L.marker([park.mapLat, park.mapLng])
        .addTo(map)
        .bindPopup(`<b>${park.icon} ${park.name}</b>`)
        .openPopup();
      leafletRef.current = map;
    };

    if (window.L) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.onload = initMap;
      document.head.appendChild(script);
    }

    return () => { if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null; } };
  }, [park]);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:150, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:T.surface, borderRadius:"24px 24px 0 0", width:"100%", maxWidth:430, overflow:"hidden" }}>
        <div style={{ padding:"16px 20px 12px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ color:T.text, fontWeight:700, fontSize:17, fontFamily:FONT }}>{park.icon} {park.name}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:T.textMuted }}>✕</button>
        </div>
        <div ref={mapRef} style={{ width:"100%", height:340 }} />
        <div style={{ padding:"12px 16px 32px", display:"flex", gap:10 }}>
          <a
            href={`https://maps.apple.com/?daddr=${park.mapLat},${park.mapLng}&dirflg=d`}
            target="_blank" rel="noreferrer"
            style={{ flex:1, padding:"11px", borderRadius:12, background:park.accent, color:"#fff", fontFamily:FONT, fontWeight:700, fontSize:13, textAlign:"center", textDecoration:"none" }}>
            🗺 Apple Maps
          </a>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${park.mapLat},${park.mapLng}`}
            target="_blank" rel="noreferrer"
            style={{ flex:1, padding:"11px", borderRadius:12, background:T.bg, border:`1px solid ${T.border}`, color:T.text, fontFamily:FONT, fontWeight:700, fontSize:13, textAlign:"center", textDecoration:"none" }}>
            🌐 Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}

// ── NoteModal ─────────────────────────────────────────────────────────────────
function NoteModal({ ride, existingNote, onSave, onClose, accent, T }) {
  const [text, setText] = useState(existingNote || "");
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:100, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:T.surface, borderRadius:"24px 24px 0 0", padding:"28px 24px 44px", width:"100%", maxWidth:430, boxShadow:"0 -4px 24px rgba(0,0,0,0.2)" }}>
        <div style={{ width:36, height:4, borderRadius:2, background:T.border, margin:"0 auto 20px" }} />
        <div style={{ color:accent, fontSize:11, fontFamily:FONT, textTransform:"uppercase", letterSpacing:1.5, fontWeight:700, marginBottom:6 }}>Ride Note</div>
        <div style={{ color:T.text, fontWeight:700, fontSize:17, fontFamily:FONT, marginBottom:16 }}>{ride.name}</div>
        <textarea
          autoFocus
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a note… e.g. 'Kids loved this', 'Skip if wet', 'Best seat is row 3'"
          rows={4}
          style={{
            width:"100%", padding:"12px 14px", borderRadius:12,
            border:`1.5px solid ${T.border}`, background:T.bg,
            color:T.text, fontFamily:FONT, fontSize:14,
            resize:"none", outline:"none", boxSizing:"border-box",
            lineHeight:1.5,
          }}
        />
        <div style={{ display:"flex", gap:10, marginTop:16 }}>
          {existingNote && (
            <button onClick={() => onSave("")} style={{ flex:1, padding:13, borderRadius:14, border:`1px solid ${T.border}`, background:T.bg, color:"#dc2626", fontFamily:FONT, fontWeight:600, fontSize:14, cursor:"pointer" }}>
              Delete
            </button>
          )}
          <button onClick={() => onSave(text.trim())} style={{ flex:2, padding:13, borderRadius:14, border:"none", background:accent, color:"#fff", fontFamily:FONT, fontWeight:700, fontSize:14, cursor:"pointer" }}>
            Save Note 📝
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Line Timer helpers ─────────────────────────────────────────────────────────
function loadLineHistory() {
  try { return JSON.parse(localStorage.getItem("dwt_line_history") || "{}"); } catch { return {}; }
}
function saveLineHistory(h) {
  try { localStorage.setItem("dwt_line_history", JSON.stringify(h)); } catch {}
}

// Entities that report as ATTRACTION but never carry a real wait — galleries,
// exhibits, walkthroughs. They're excluded from downtime tracking (both the
// local fallback and the server push below) since there's no meaningful
// "down" concept for them worth calling out. Keep in sync with the
// NO_WAIT_NAMES list in api/collect.js.
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

function hasNoWait(ride) {
  return NO_WAIT_NAMES.has((ride.name || '').toLowerCase());
}

// Downtime tracking has two layers:
//  1. Server-side (api/collect.js, on the scheduled collection job) — authoritative.
//     Its "since" reflects when the ride actually went down, not when the app was
//     opened, but it only updates on the ~30-minute collection cadence, so a brand
//     new outage can take a while to show up here.
//  2. A lightweight client-side fallback (localStorage) that starts a timer the
//     moment *this* browser sees the ride go DOWN/CLOSED, so the UI shows
//     something immediately. Once the server catches up with the real (usually
//     earlier or equal) timestamp, the server value wins.
function loadLocalDowntimes() {
  try { return JSON.parse(localStorage.getItem("dwt_downtimes_local") || "{}"); } catch { return {}; }
}
function saveLocalDowntimes(d) {
  try { localStorage.setItem("dwt_downtimes_local", JSON.stringify(d)); } catch {}
}

// Call on each data refresh — detects transitions and updates the local fallback records
function updateLocalDowntimes(rides) {
  const now     = Date.now();
  const current = loadLocalDowntimes();
  const updated = { ...current };
  let changed   = false;

  for (const ride of rides) {
    const isDown = ride.status === "DOWN" || ride.status === "CLOSED";
    const prev   = updated[ride.id];

    if (isDown && !prev?.since) {
      updated[ride.id] = { name: ride.name, since: now, status: ride.status, history: prev?.history || [] };
      changed = true;
    } else if (isDown && prev?.since && ride.status !== prev.status) {
      updated[ride.id] = { ...prev, status: ride.status };
      changed = true;
    } else if (!isDown && prev?.since) {
      const mins  = Math.round((now - prev.since) / 60000);
      const entry = { since: prev.since, until: now, status: prev.status, mins };
      updated[ride.id] = { name: ride.name, since: null, status: null, history: [entry, ...(prev.history || [])].slice(0, 10) };
      changed = true;
    }
  }

  if (changed) saveLocalDowntimes(updated);
  return updated;
}

// Merge server (authoritative) + local (instant fallback) downtime sources.
function mergeDowntimeSources(server, local) {
  const ids = new Set([...Object.keys(server || {}), ...Object.keys(local || {})]);
  const merged = {};
  for (const id of ids) {
    const s = server?.[id];
    const l = local?.[id];
    const since   = s?.since  ?? l?.since  ?? null;
    const status  = s?.status ?? l?.status ?? null;
    const history = (s?.history?.length ? s.history : l?.history) || [];
    merged[id] = { name: s?.name ?? l?.name ?? null, since, status, history };
  }
  return merged;
}

function mergeServerDowntimes(active, history) {
  const merged = {};
  for (const [id, a] of Object.entries(active || {})) {
    merged[id] = { name: a.name, since: a.since, status: a.status, history: history?.[id] || [] };
  }
  for (const [id, h] of Object.entries(history || {})) {
    if (!merged[id]) merged[id] = { name: null, since: null, status: null, history: h };
  }
  return merged;
}

async function fetchServerDowntimes() {
  try {
    const res = await fetch("/api/downtimes");
    if (!res.ok) return {};
    const data = await res.json();
    return mergeServerDowntimes(data.active, data.history);
  } catch {
    return {};
  }
}

// Called whenever the app fetches live park data (initial load, park switch,
// manual refresh) — piggybacks that data onto the server-side downtime
// tracker instead of waiting for the next 30-minute cron sweep, so accuracy
// is near-instant while the app is actually open.
async function pushDowntimeUpdate(parkKey, rides) {
  try {
    const res = await fetch("/api/downtimes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parkId: parkKey, rides: rides.map(r => ({ id: r.id, name: r.name, status: r.status })) }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return mergeServerDowntimes(data.active, data.history);
  } catch {
    return null;
  }
}

// ── RideCard ──────────────────────────────────────────────────────────────────
function RideCard({ ride, accent, accentLight, accentDark, isFavorite, onToggleFavorite, alertThreshold, onSetAlert, isHidden, onToggleHidden, note, onOpenNoteModal, onAddToPlan, downtime, T, dark }) {
  const [expanded, setExpanded] = useState(false);
  const [trendData, setTrendData] = useState(null);
  const [trendLoading, setTrendLoading] = useState(false);

  // Line timer state
  const [timerStart, setTimerStart]   = useState(null);   // Date when timer started
  const [elapsed, setElapsed]         = useState(0);       // seconds
  const [lineHistory, setLineHistory] = useState(() => loadLineHistory());
  const timerRef = useRef(null);
  const myHistory = lineHistory[ride.id] || [];

  // Tick every second while running
  useEffect(() => {
    if (timerStart) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - timerStart) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerStart]);

  function startTimer() { setTimerStart(Date.now()); setElapsed(0); }

  function stopTimer() {
    if (!timerStart) return;
    const mins = Math.round(elapsed / 60);
    const entry = { ts: Date.now(), mins, posted: ride.queue?.STANDBY?.waitTime ?? null, name: ride.name };
    const updated = { ...lineHistory, [ride.id]: [entry, ...myHistory].slice(0, 10) };
    setLineHistory(updated);
    saveLineHistory(updated);
    setTimerStart(null);
    setElapsed(0);
  }

  function clearHistory() {
    const updated = { ...lineHistory };
    delete updated[ride.id];
    setLineHistory(updated);
    saveLineHistory(updated);
  }

  function fmtElapsed(s) {
    const m = Math.floor(s / 60), sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  }
  const thrill = inferThrill(ride.name);
  const details = getRideDetails(ride.name);
  const isOperating = ride.status === "OPERATING";
  const wait = ride.queue?.STANDBY?.waitTime ?? null;
  const hasAlert = alertThreshold != null;
  const favBg = dark ? accentDark : accentLight;

  // Live downtime counter
  const [downtimeTick, setDowntimeTick] = useState(0);
  const isCurrentlyDown = !isOperating && downtime?.since;
  useEffect(() => {
    if (!isCurrentlyDown) return;
    const id = setInterval(() => setDowntimeTick(t => t + 1), 60000); // update every minute
    return () => clearInterval(id);
  }, [isCurrentlyDown]);

  function fmtDowntime(since) {
    const mins = Math.round((Date.now() - since) / 60000);
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60), m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  function fmtDowntimeRange(since, until) {
    const mins = Math.round((until - since) / 60000);
    const start = new Date(since).toLocaleTimeString([], { hour:"numeric", minute:"2-digit" });
    const end   = new Date(until).toLocaleTimeString([], { hour:"numeric", minute:"2-digit" });
    if (mins < 60) return `${start} – ${end} (${mins}m)`;
    const h = Math.floor(mins / 60), m = mins % 60;
    return `${start} – ${end} (${h}h${m > 0 ? ` ${m}m` : ""})`;
  }

  // Is right now one of the 3 best times to ride?
  const isBestTime = (() => {
    if (wait == null && !expanded) return false;
    const nowIdx = getETHour() - PARK_OPEN_HOUR;
    if (nowIdx < 0 || nowIdx >= HOUR_LABELS.length) return false;
    const { merged } = mergeWithTypical(trendData?.hourlyAvg ?? null, thrill);
    return bestHours(merged).some(b => b.i === nowIdx);
  })();

  const [selectedSeason, setSelectedSeason] = useState(() => getClientSeason());

  useEffect(() => {
    if (!expanded) return;    setTrendLoading(true);
    fetchTrend(ride.id, selectedSeason).then(data => { setTrendData(data); setTrendLoading(false); });
  }, [expanded, ride.id, selectedSeason]);

  if (isHidden) return null;

  return (
    <div style={{ ...cardStyle(T), padding:"16px", marginBottom:10, border:isFavorite?`1.5px solid ${accent}`:`1px solid ${T.border}`, background:isFavorite?favBg:T.surface, opacity:ride.status==="REFURBISHMENT"?0.5:1, transition:"background 0.3s" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ flex:1, paddingRight:10, cursor:"pointer" }} onClick={() => setExpanded(e => !e)}>
          <div style={{ color:T.text, fontWeight:600, fontSize:15, fontFamily:FONT, marginBottom:5 }}>{ride.name}</div>
          <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
            <ThrillBadge level={thrill} dark={dark} />
            {details?.height && (
              <span style={{ fontSize:10, color:dark?"#93c5fd":"#1e40af", background:dark?"#1e3a5f":"#dbeafe", borderRadius:6, padding:"2px 7px", fontFamily:FONT, fontWeight:600 }}>
                📏 {details.height}"
              </span>
            )}
            {!details?.height && details && (
              <span style={{ fontSize:10, color:dark?"#86efac":"#166534", background:dark?"#052e16":"#dcfce7", borderRadius:6, padding:"2px 7px", fontFamily:FONT, fontWeight:600 }}>
                📏 Any height
              </span>
            )}
            {details?.a11y?.map((tag, i) => (
              <span key={i} style={{ fontSize:10, color:dark?"#d8b4fe":"#6b21a8", background:dark?"#2e1065":"#f3e8ff", borderRadius:6, padding:"2px 7px", fontFamily:FONT, fontWeight:500 }}>
                ♿ {tag}
              </span>
            ))}
            {ride.queue?.SINGLE_RIDER != null && <span style={{ fontSize:10, color:dark?"#c4b5fd":"#7c3aed", background:dark?"#2e1065":"#ede9fe", borderRadius:6, padding:"2px 7px", fontFamily:FONT, fontWeight:600 }}>Single Rider</span>}
            {hasAlert && <span style={{ fontSize:10, color:dark?"#93c5fd":"#1d4ed8", background:dark?"#1e3a5f":"#dbeafe", borderRadius:6, padding:"2px 7px", fontFamily:FONT, fontWeight:600 }}>🔔 &lt;{alertThreshold}m</span>}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
          <button onClick={e=>{e.stopPropagation();onToggleFavorite();}} style={{ background:"none",border:"none",cursor:"pointer",fontSize:18,padding:4 }}>{isFavorite?"⭐":"☆"}</button>
          <button onClick={e=>{e.stopPropagation();onSetAlert();}} style={{ background:"none",border:"none",cursor:"pointer",fontSize:16,padding:4,opacity:hasAlert?1:0.35 }}>🔔</button>
          <button onClick={e=>{e.stopPropagation();onOpenNoteModal();}} style={{ background:"none",border:"none",cursor:"pointer",fontSize:16,padding:4,opacity:note?1:0.35 }} title={note?"Edit note":"Add note"}>📝</button>
          <button onClick={e=>{e.stopPropagation();onAddToPlan();}} title="Add to plan" style={{ background:"none",border:"none",cursor:"pointer",fontSize:15,padding:4,opacity:0.6 }}>📋</button>
          <div style={{ textAlign:"right" }}>
            <WaitBadge minutes={wait} status={ride.status} dark={dark} />
            {isOperating && wait!=null && <div style={{ color:T.textMuted,fontSize:10,marginTop:3,fontFamily:FONT }}>standby</div>}
          </div>
        </div>
      </div>

      {/* Line timer button — always on card face for operating rides */}
      {isOperating && (
        timerStart ? (
          <div style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:12,marginTop:10,background:dark?"#3b0a0a":"#fee2e2",border:`1.5px solid ${dark?"#ef4444":"#fca5a5"}` }}>
            <div style={{ flex:1 }}>
              <div style={{ color:dark?"#f87171":"#dc2626",fontSize:20,fontWeight:800,fontFamily:FONT,letterSpacing:1 }}>{fmtElapsed(elapsed)}</div>
              <div style={{ color:dark?"#fca5a5":"#9f1239",fontSize:11,fontFamily:FONT }}>⏱ In line now…</div>
            </div>
            <button
              onClick={e=>{e.stopPropagation();stopTimer();}}
              style={{ background:"#dc2626",border:"none",borderRadius:10,padding:"8px 18px",color:"#fff",fontFamily:FONT,fontWeight:700,fontSize:13,cursor:"pointer",flexShrink:0 }}>
              ✓ Done
            </button>
          </div>
        ) : (
          <button
            onClick={e=>{e.stopPropagation();startTimer();}}
            style={{ width:"100%",padding:"9px 12px",borderRadius:12,border:"none",background:accent,color:"#fff",fontFamily:FONT,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,boxSizing:"border-box",marginTop:10 }}>
            ⏱ Time my wait
          </button>
        )
      )}

      {/* Live downtime banner — shown on card face when ride is currently down */}
      {isCurrentlyDown && (
        <div style={{ marginTop:10, padding:"10px 14px", borderRadius:12, background:dark?"#431407":"#ffedd5", border:`1.5px solid ${dark?"#fb923c":"#f97316"}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ color:dark?"#fb923c":"#c2410c", fontWeight:800, fontSize:18, fontFamily:FONT, letterSpacing:0.5 }}>
              🔴 {fmtDowntime(downtime.since)}
            </div>
            <div style={{ color:dark?"#fed7aa":"#9a3412", fontSize:11, fontFamily:FONT }}>
              Down since {new Date(downtime.since).toLocaleTimeString([], { hour:"numeric", minute:"2-digit" })}
            </div>
          </div>
          <div style={{ color:dark?"#fb923c":"#c2410c", fontSize:11, fontFamily:FONT, fontWeight:600, textAlign:"right" }}>
            {downtime.status === "DOWN" ? "⚙️ Technical issue" : "🚫 Closed"}
          </div>
        </div>
      )}

      {/* Best time NOW banner */}
      {isBestTime && (
        <div style={{ marginTop:8, padding:"6px 10px", borderRadius:8, background:dark?"#052e16":"#dcfce7", border:`1px solid ${dark?"#166534":"#86efac"}`, display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:14 }}>⭐</span>
          <span style={{ color:dark?"#4ade80":"#15803d", fontSize:12, fontFamily:FONT, fontWeight:700 }}>Best time to ride right now!</span>
        </div>
      )}

      {/* Note preview — always visible when note exists */}
      {note && !expanded && (
        <div onClick={() => setExpanded(e => !e)} style={{ marginTop:8, padding:"7px 10px", borderRadius:8, background:T.bg, border:`1px solid ${T.border}`, cursor:"pointer" }}>
          <span style={{ color:T.textMuted, fontSize:11, fontFamily:FONT }}>📝 </span>
          <span style={{ color:T.textSub, fontSize:12, fontFamily:FONT }}>{note}</span>
        </div>
      )}

      {expanded && (
        <div style={{ marginTop:14, borderTop:`1px solid ${T.border}`, paddingTop:14 }}>
          {ride.queue?.LIGHTNING_LANE?.waitTime != null && (
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, background:dark?"#422006":"#fef9c3", borderRadius:10, padding:"8px 12px" }}>
              <span style={{ color:dark?"#fbbf24":"#854d0e", fontSize:13, fontFamily:FONT, fontWeight:500 }}>⚡ Lightning Lane</span>
              <WaitBadge minutes={ride.queue.LIGHTNING_LANE.waitTime} status="OPERATING" dark={dark} />
            </div>
          )}

          {/* Season selector */}
          <div style={{ display:"flex", gap:4, marginBottom:10, flexWrap:"wrap" }}>
            {['all', ...Object.keys(SEASON_META)].map(s => {
              const meta = SEASON_META[s];
              const isActive = selectedSeason === s || (s === 'all' && selectedSeason === 'all');
              return (
                <button key={s} onClick={() => setSelectedSeason(s)} style={{
                  padding:"3px 10px", borderRadius:20, fontSize:11, fontFamily:FONT, cursor:"pointer",
                  fontWeight: isActive ? 700 : 400,
                  background: isActive ? accent : T.bg,
                  color: isActive ? "#fff" : T.textMuted,
                  border: `1px solid ${isActive ? accent : T.border}`,
                }}>
                  {s === 'all' ? '📅 All seasons' : `${meta.icon} ${meta.label}`}
                  {s === getClientSeason() && s !== 'all' && <span style={{ marginLeft:3, opacity:0.7 }}>(now)</span>}
                </button>
              );
            })}
          </div>
          {trendData?.bySeason && selectedSeason !== 'all' && (
            <div style={{ color:T.textMuted, fontSize:10, fontFamily:FONT, marginBottom:8 }}>
              {trendData.bySeason[selectedSeason] ?? 0} readings for {SEASON_META[selectedSeason]?.label} · {SEASON_META[selectedSeason]?.tip}
            </div>
          )}

          {trendLoading && <div style={{ height:90,display:"flex",alignItems:"center",justifyContent:"center" }}><span style={{ color:T.textMuted,fontSize:13,fontFamily:FONT }}>Loading trend…</span></div>}
          {!trendLoading && (
            <TrendChart
              hourlyAvg={trendData?.hourlyAvg ?? null}
              dowHourlyAvg={trendData?.dowHourlyAvg ?? null}
              thrillLevel={thrill} accent={accent}
              accentLight={dark ? accentDark : accentLight}
              currentWait={wait} T={T} dark={dark} />
          )}
          <div style={{ color:T.textMuted,fontSize:12,fontFamily:FONT,marginTop:12,lineHeight:1.5 }}>
            💡 {thrill==="high"?"Queue right at rope drop or use Lightning Lane during peak hours.":"This ride moves quickly — check the line as you walk past."}
          </div>
          {details && (
            <div style={{ marginTop:12, padding:"10px 12px", borderRadius:10, background:T.bg, border:`1px solid ${T.border}` }}>
              {details.height ? (
                <div style={{ color:T.textSub, fontSize:12, fontFamily:FONT, marginBottom:6 }}>
                  📏 <strong>Height requirement:</strong> {fmtHeight(details.height)} minimum
                </div>
              ) : (
                <div style={{ color:T.textSub, fontSize:12, fontFamily:FONT, marginBottom:details.a11y?.length ? 6 : 0 }}>
                  📏 <strong>No height requirement</strong>
                </div>
              )}
              {details.a11y?.map((tag, i) => (
                <div key={i} style={{ color:T.textSub, fontSize:12, fontFamily:FONT, marginTop:4 }}>
                  ♿ {tag}
                </div>
              ))}
            </div>
          )}
          {/* Downtime history */}
          {downtime?.history?.length > 0 && (
            <div style={{ marginTop:12, padding:"12px 14px", borderRadius:12, background:T.bg, border:`1px solid ${T.border}` }}>
              <div style={{ color:T.textSub, fontSize:11, fontFamily:FONT, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>🔴 Past Outages</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {downtime.history.map((h, i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 10px", borderRadius:8, background:T.surface }}>
                    <div>
                      <div style={{ color:T.text, fontSize:12, fontFamily:FONT, fontWeight:600 }}>
                        {h.status === "DOWN" ? "⚙️ Technical issue" : "🚫 Closed"}
                      </div>
                      <div style={{ color:T.textMuted, fontSize:10, fontFamily:FONT }}>
                        {fmtDowntimeRange(h.since, h.until)}
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ color: h.mins >= 60 ? (dark?"#f87171":"#dc2626") : h.mins >= 20 ? (dark?"#fb923c":"#c2410c") : T.textSub, fontWeight:700, fontSize:13, fontFamily:FONT }}>
                        {h.mins >= 60 ? `${Math.floor(h.mins/60)}h ${h.mins%60>0?`${h.mins%60}m`:""}` : `${h.mins}m`}
                      </div>
                      <div style={{ color:T.textMuted, fontSize:10, fontFamily:FONT }}>
                        {new Date(h.since).toLocaleDateString([], { month:"short", day:"numeric" })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ color:T.textMuted, fontSize:10, fontFamily:FONT, marginTop:8, textAlign:"center" }}>
                Avg outage: {Math.round(downtime.history.reduce((s,h)=>s+h.mins,0)/downtime.history.length)}m · {downtime.history.length} recorded
              </div>
            </div>
          )}

          <button onClick={() => onToggleHidden()} style={{ marginTop:10,width:"100%",padding:9,borderRadius:10,border:`1px solid ${T.border}`,background:T.bg,color:T.textMuted,fontFamily:FONT,fontSize:12,cursor:"pointer" }}>
            Hide this ride
          </button>

          {/* Note section in expanded view */}
          <div style={{ marginTop:10 }}>
            {note ? (
              <div style={{ padding:"10px 12px", borderRadius:10, background:T.bg, border:`1px solid ${accent}33` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                  <div>
                    <div style={{ color:accent, fontSize:11, fontFamily:FONT, fontWeight:600, marginBottom:4 }}>📝 My Note</div>
                    <div style={{ color:T.textSub, fontSize:13, fontFamily:FONT, lineHeight:1.5 }}>{note}</div>
                  </div>
                  <button onClick={() => onOpenNoteModal()} style={{ background:"none", border:"none", color:T.textMuted, fontSize:12, fontFamily:FONT, cursor:"pointer", flexShrink:0, padding:"2px 6px" }}>Edit</button>
                </div>
              </div>
            ) : (
              <button onClick={() => onOpenNoteModal()} style={{ width:"100%", padding:9, borderRadius:10, border:`1px dashed ${T.border}`, background:"transparent", color:T.textMuted, fontFamily:FONT, fontSize:12, cursor:"pointer" }}>
                📝 Add a note to this ride
              </button>
            )}
          </div>
          {ride.lastUpdated && <div style={{ color:T.textMuted,fontSize:10,fontFamily:FONT,marginTop:6 }}>Updated {new Date(ride.lastUpdated).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div>}

          {/* Line timer history */}
          {myHistory.length > 0 && (
            <div style={{ marginTop:12, padding:"12px", borderRadius:12, background:T.bg, border:`1px solid ${T.border}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <span style={{ color:T.textSub, fontSize:12, fontFamily:FONT, fontWeight:700 }}>⏱ My Wait History</span>
                <button onClick={clearHistory} style={{ background:"none", border:"none", color:T.textMuted, fontSize:11, fontFamily:FONT, cursor:"pointer" }}>Clear</button>
              </div>
              <div style={{ color:T.textMuted, fontSize:10, fontFamily:FONT, textTransform:"uppercase", letterSpacing:1, fontWeight:600, marginBottom:6 }}>Past waits</div>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                {myHistory.map((h, i) => {
                    const diff = h.posted != null ? h.mins - h.posted : null;
                    return (
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 10px", borderRadius:8, background:T.surface }}>
                        <div>
                          <span style={{ color:T.text, fontWeight:700, fontSize:13, fontFamily:FONT }}>{h.mins}m actual</span>
                          {h.posted != null && (
                            <span style={{ color:T.textMuted, fontSize:11, fontFamily:FONT, marginLeft:8 }}>
                              (posted {h.posted}m
                              {diff !== null && (
                                <span style={{ color: diff > 5 ? (dark?"#f87171":"#dc2626") : diff < -5 ? (dark?"#4ade80":"#15803d") : T.textMuted, fontWeight:600 }}>
                                  {" "}{diff > 0 ? `+${diff}` : diff}m
                                </span>
                              )})
                            </span>
                          )}
                        </div>
                        <span style={{ color:T.textMuted, fontSize:10, fontFamily:FONT }}>
                          {new Date(h.ts).toLocaleDateString([],{month:"short",day:"numeric"})}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ color:T.textMuted, fontSize:10, fontFamily:FONT, marginTop:8, textAlign:"center" }}>
                  Avg actual wait: {Math.round(myHistory.reduce((s,h)=>s+h.mins,0)/myHistory.length)}m over {myHistory.length} visit{myHistory.length!==1?"s":""}
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── WaitAccuracy modal ────────────────────────────────────────────────────────
function WaitAccuracy({ T, dark, accent, accentLight, accentDark, onClose }) {
  const history = loadLineHistory(); // { rideId: [{ts, mins, posted}] }
  const [sort, setSort] = useState("bias"); // bias | name | entries

  // Flatten all entries across all rides
  const allEntries = Object.entries(history).flatMap(([rideId, entries]) =>
    entries.filter(e => e.posted != null).map(e => ({ ...e, rideId, diff: e.mins - e.posted }))
  );

  const totalEntries = allEntries.length;
  const withPosted   = allEntries.length; // already filtered above

  // Overall stats
  const overallAvgDiff   = withPosted ? allEntries.reduce((s,e)=>s+e.diff,0)/withPosted : null;
  const overallAvgActual = withPosted ? allEntries.reduce((s,e)=>s+e.mins,0)/withPosted : null;
  const overallAvgPosted = withPosted ? allEntries.reduce((s,e)=>s+e.posted,0)/withPosted : null;
  const accurate   = allEntries.filter(e=>Math.abs(e.diff)<=5).length;
  const overWait   = allEntries.filter(e=>e.diff > 5).length;
  const underWait  = allEntries.filter(e=>e.diff < -5).length;

  // Per-ride stats
  const rideStats = Object.entries(history).map(([rideId, entries]) => {
    const valid = entries.filter(e => e.posted != null);
    if (!valid.length) return null;
    const avgActual = valid.reduce((s,e)=>s+e.mins,0)/valid.length;
    const avgPosted = valid.reduce((s,e)=>s+e.posted,0)/valid.length;
    const avgDiff   = avgActual - avgPosted;
    // Derive a clean name: stored as rideId which may be a UUID — use last entry's posted context
    // We'll just show the rideId for now; in a future update could store name alongside
    return { rideId, name: valid[0].name || rideId, entries: valid.length, avgActual, avgPosted, avgDiff, last: valid[0].ts };
  }).filter(Boolean);

  const sortedRideStats = [...rideStats].sort((a,b) => {
    if (sort==="bias")    return Math.abs(b.avgDiff) - Math.abs(a.avgDiff);
    if (sort==="entries") return b.entries - a.entries;
    if (sort==="name")    return a.rideId.localeCompare(b.rideId);
    return 0;
  });

  // Accuracy verdict
  const verdict = overallAvgDiff == null ? null
    : overallAvgDiff >  10 ? { label:"Posted times run short",  icon:"⚠️", tip:"Disney consistently underestimates. Add ~"+Math.round(overallAvgDiff)+"m to any posted wait.", color:dark?"#f87171":"#dc2626", bg:dark?"#3b0a0a":"#fee2e2" }
    : overallAvgDiff >   5 ? { label:"Posted times slightly short", icon:"🟠", tip:"Actual waits tend to be a bit longer than posted.", color:dark?"#fb923c":"#c2410c", bg:dark?"#431407":"#ffedd5" }
    : overallAvgDiff <  -10? { label:"Posted times run long",   icon:"✅", tip:"Disney overestimates. Real waits are shorter — great news!", color:dark?"#4ade80":"#15803d", bg:dark?"#052e16":"#dcfce7" }
    : overallAvgDiff <  -5 ? { label:"Posted times slightly long",  icon:"🟢", tip:"Actual waits tend to be a bit shorter than posted.", color:dark?"#34d399":"#166534", bg:dark?"#064e3b":"#bbf7d0" }
    :                        { label:"Posted times are accurate", icon:"🎯", tip:"Disney's estimates match your real waits closely.", color:dark?"#a78bfa":"#6d28d9", bg:dark?"#2e1065":"#ede9fe" };

  const diffColor = (diff) =>
    diff >  10 ? (dark?"#f87171":"#dc2626") :
    diff >   5 ? (dark?"#fb923c":"#c2410c") :
    diff < -10 ? (dark?"#4ade80":"#15803d") :
    diff <  -5 ? (dark?"#34d399":"#166534") :
                 (dark?"#a78bfa":"#6d28d9");

  const diffLabel = (diff) =>
    diff > 0 ? `+${Math.round(diff)}m longer` :
    diff < 0 ? `${Math.round(diff)}m shorter` :
    "Exact";

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:T.bg,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:500,maxHeight:"92vh",overflow:"auto",boxShadow:"0 -4px 32px rgba(0,0,0,0.3)" }}>

        {/* Header */}
        <div style={{ padding:"20px 20px 0",position:"sticky",top:0,background:T.bg,zIndex:1,borderBottom:`1px solid ${T.border}`,paddingBottom:14 }}>
          <div style={{ width:36,height:4,borderRadius:2,background:T.border,margin:"0 auto 16px" }} />
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div style={{ color:T.text,fontWeight:700,fontSize:18,fontFamily:FONT }}>📊 Wait Accuracy</div>
            <button onClick={onClose} style={{ background:"none",border:"none",color:T.textMuted,fontSize:22,cursor:"pointer" }}>✕</button>
          </div>
          <div style={{ color:T.textMuted,fontSize:12,fontFamily:FONT,marginTop:4 }}>
            Based on {totalEntries} timed wait{totalEntries!==1?"s":""} across {rideStats.length} ride{rideStats.length!==1?"s":""}
          </div>
        </div>

        <div style={{ padding:"16px 20px 48px" }}>

          {/* No data state */}
          {totalEntries === 0 && (
            <div style={{ textAlign:"center",padding:"48px 20px",color:T.textMuted,fontFamily:FONT }}>
              <div style={{ fontSize:48,marginBottom:16 }}>⏱</div>
              <div style={{ fontSize:16,fontWeight:700,color:T.textSub,marginBottom:8 }}>No data yet</div>
              <div style={{ fontSize:13,lineHeight:1.6 }}>
                Tap <strong style={{color:T.text}}>⏱ Time my wait</strong> on any ride card,<br/>then <strong style={{color:T.text}}>✓ Done</strong> when you board.<br/>Your accuracy data will appear here.
              </div>
            </div>
          )}

          {totalEntries > 0 && (
            <>
              {/* Verdict card */}
              {verdict && (
                <div style={{ padding:"16px",borderRadius:16,background:verdict.bg,border:`1px solid ${verdict.color}44`,marginBottom:16 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6 }}>
                    <span style={{ fontSize:20 }}>{verdict.icon}</span>
                    <span style={{ color:verdict.color,fontWeight:800,fontSize:15,fontFamily:FONT }}>{verdict.label}</span>
                  </div>
                  <div style={{ color:verdict.color,fontSize:13,fontFamily:FONT,opacity:0.85,lineHeight:1.5 }}>{verdict.tip}</div>
                </div>
              )}

              {/* Overall stats row */}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16 }}>
                {[
                  { label:"Avg posted", value:`${Math.round(overallAvgPosted)}m`, sub:"Disney said" },
                  { label:"Avg actual", value:`${Math.round(overallAvgActual)}m`, sub:"You waited" },
                  { label:"Avg diff",   value:diffLabel(overallAvgDiff), sub:"vs posted", color:diffColor(overallAvgDiff) },
                ].map((s,i)=>(
                  <div key={i} style={{ background:T.surface,borderRadius:12,padding:"12px 10px",textAlign:"center",border:`1px solid ${T.border}` }}>
                    <div style={{ color:s.color||T.text,fontWeight:800,fontSize:15,fontFamily:FONT }}>{s.value}</div>
                    <div style={{ color:T.textSub,fontSize:11,fontFamily:FONT,fontWeight:600,marginTop:2 }}>{s.label}</div>
                    <div style={{ color:T.textMuted,fontSize:10,fontFamily:FONT }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Accuracy breakdown bar */}
              <div style={{ background:T.surface,borderRadius:12,padding:"14px",marginBottom:16,border:`1px solid ${T.border}` }}>
                <div style={{ color:T.textSub,fontSize:11,fontFamily:FONT,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:10 }}>Accuracy breakdown</div>
                <div style={{ display:"flex",borderRadius:8,overflow:"hidden",height:16,marginBottom:10 }}>
                  {withPosted > 0 && [
                    { count:underWait,  color:dark?"#4ade80":"#22c55e" },
                    { count:accurate,   color:dark?"#a78bfa":"#7c3aed" },
                    { count:overWait,   color:dark?"#f87171":"#ef4444" },
                  ].map((bar,i)=>(
                    bar.count > 0 && <div key={i} style={{ flex:bar.count,background:bar.color,transition:"flex 0.5s" }} />
                  ))}
                </div>
                <div style={{ display:"flex",gap:12,flexWrap:"wrap" }}>
                  {[
                    { label:"Shorter than posted", count:underWait,  color:dark?"#4ade80":"#15803d" },
                    { label:"Within 5 min",        count:accurate,   color:dark?"#a78bfa":"#6d28d9" },
                    { label:"Longer than posted",  count:overWait,   color:dark?"#f87171":"#dc2626" },
                  ].map((item,i)=>(
                    <div key={i} style={{ display:"flex",alignItems:"center",gap:5 }}>
                      <div style={{ width:10,height:10,borderRadius:2,background:item.color,flexShrink:0 }} />
                      <span style={{ color:T.textMuted,fontSize:11,fontFamily:FONT }}>{item.count}× {item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Per-ride breakdown */}
              {rideStats.length > 0 && (
                <div style={{ background:T.surface,borderRadius:12,padding:"14px",border:`1px solid ${T.border}` }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                    <div style={{ color:T.textSub,fontSize:11,fontFamily:FONT,fontWeight:700,textTransform:"uppercase",letterSpacing:1 }}>By ride</div>
                    <div style={{ display:"flex",gap:4 }}>
                      {[["bias","Biggest gap"],["entries","Most timed"],["name","A–Z"]].map(([id,label])=>(
                        <button key={id} onClick={()=>setSort(id)} style={{ padding:"3px 8px",borderRadius:8,border:`1px solid ${sort===id?accent:T.border}`,background:sort===id?accent:"transparent",color:sort===id?"#fff":T.textMuted,fontSize:10,fontFamily:FONT,cursor:"pointer" }}>{label}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                    {sortedRideStats.map((rs,i)=>{
                      const barMax = Math.max(...rideStats.map(r=>Math.abs(r.avgDiff)), 1);
                      const barPct = Math.min(100, Math.round((Math.abs(rs.avgDiff)/barMax)*100));
                      const color  = diffColor(rs.avgDiff);
                      return (
                        <div key={rs.rideId} style={{ padding:"10px 12px",borderRadius:10,background:T.bg,border:`1px solid ${T.border}` }}>
                          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6 }}>
                            <div style={{ flex:1,paddingRight:8 }}>
                              <div style={{ color:T.text,fontWeight:600,fontSize:13,fontFamily:FONT }}>{rs.name}</div>
                              <div style={{ color:T.textMuted,fontSize:11,fontFamily:FONT,marginTop:1 }}>{rs.entries} timing{rs.entries!==1?"s":""} · avg posted {Math.round(rs.avgPosted)}m</div>
                            </div>
                            <div style={{ textAlign:"right",flexShrink:0 }}>
                              <div style={{ color,fontWeight:800,fontSize:14,fontFamily:FONT }}>{diffLabel(rs.avgDiff)}</div>
                              <div style={{ color:T.textMuted,fontSize:10,fontFamily:FONT }}>avg actual {Math.round(rs.avgActual)}m</div>
                            </div>
                          </div>
                          <div style={{ height:4,borderRadius:2,background:dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)",overflow:"hidden" }}>
                            <div style={{ width:`${barPct}%`,height:"100%",background:color,borderRadius:2,transition:"width 0.5s" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


function ShowCard({ show, accent, accentLight, accentDark, isFavorite, onToggleFavorite, isHidden, onToggleHidden, T, dark }) {
  const [expanded, setExpanded] = useState(false);
  const showtimes = (show.showtimes||[]).filter(st=>isUpcoming(st.startTime));
  const allTimes  = (show.showtimes||[]);
  const nextShow  = showtimes[0];
  const isOp      = show.status==="OPERATING"||show.status==="INFO";
  const favBg     = dark?accentDark:accentLight;
  if (isHidden) return null;

  return (
    <div style={{ ...cardStyle(T),padding:"16px",marginBottom:10,border:isFavorite?`1.5px solid ${accent}`:`1px solid ${T.border}`,background:isFavorite?favBg:T.surface,opacity:show.status==="REFURBISHMENT"?0.5:1 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
        <div style={{ flex:1,paddingRight:10,cursor:allTimes.length>0?"pointer":"default" }} onClick={() => allTimes.length>0&&setExpanded(e=>!e)}>
          <div style={{ color:T.text,fontWeight:600,fontSize:15,fontFamily:FONT,marginBottom:6 }}>{show.name}</div>
          {nextShow ? (
            <div style={{ display:"flex",alignItems:"center",gap:6,flexWrap:"wrap" }}>
              <span style={{ background:dark?accentDark:accentLight,color:accent,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700,fontFamily:FONT }}>Next: {fmtTime(nextShow.startTime)}</span>
              {showtimes.length>1 && <span style={{ color:T.textMuted,fontSize:12,fontFamily:FONT }}>+{showtimes.length-1} more</span>}
            </div>
          ) : allTimes.length>0 ? (
            <span style={{ color:T.textMuted,fontSize:12,fontFamily:FONT }}>No more shows today</span>
          ) : (
            <span style={{ color:T.textMuted,fontSize:12,fontFamily:FONT }}>{show.status==="REFURBISHMENT"?"Under refurbishment":isOp?"Check park app for times":"Closed today"}</span>
          )}
        </div>
        <button onClick={()=>onToggleFavorite()} style={{ background:"none",border:"none",cursor:"pointer",fontSize:18,padding:4 }}>{isFavorite?"⭐":"☆"}</button>
      </div>
      {expanded && allTimes.length>0 && (
        <div style={{ marginTop:14,borderTop:`1px solid ${T.border}`,paddingTop:14 }}>
          <div style={{ color:T.textSub,fontSize:11,fontFamily:FONT,textTransform:"uppercase",letterSpacing:1.2,fontWeight:600,marginBottom:12 }}>Today's Schedule</div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:8,marginBottom:14 }}>
            {allTimes.map((st,i) => {
              const past=!isUpcoming(st.startTime);
              return <span key={i} style={{ background:past?T.bg:(dark?accentDark:accentLight),color:past?T.textMuted:accent,borderRadius:20,padding:"5px 14px",fontSize:13,fontWeight:600,fontFamily:FONT,textDecoration:past?"line-through":"none",border:`1px solid ${past?T.border:accent+"33"}` }}>{fmtTime(st.startTime)}</span>;
            })}
          </div>
          <button onClick={()=>onToggleHidden()} style={{ width:"100%",padding:9,borderRadius:10,border:`1px solid ${T.border}`,background:T.bg,color:T.textMuted,fontFamily:FONT,fontSize:12,cursor:"pointer" }}>Hide from list</button>
        </div>
      )}
    </div>
  );
}

// 5-tier crowd levels — thresholds match CrowdTrend.jsx
const CROWD_LEVELS = [
  { label:"Very Low", max:18,   icon:"🟢", tip:"Walk-on conditions",
    l:["#dcfce7","#14532d","#22c55e"], d:["#052e16","#4ade80","#22c55e"] },
  { label:"Low",      max:30,   icon:"🟩", tip:"Short queues",
    l:["#bbf7d0","#166534","#4ade80"], d:["#064e3b","#34d399","#34d399"] },
  { label:"Moderate", max:45,   icon:"🟡", tip:"Plan strategically",
    l:["#fef9c3","#854d0e","#eab308"], d:["#422006","#fbbf24","#eab308"] },
  { label:"High",     max:60,   icon:"🟠", tip:"Use Lightning Lane",
    l:["#ffedd5","#9a3412","#f97316"], d:["#431407","#fb923c","#f97316"] },
  { label:"Peak",     max:9999, icon:"🔴", tip:"Arrive at rope drop",
    l:["#fee2e2","#991b1b","#ef4444"], d:["#3b0a0a","#f87171","#ef4444"] },
];
function getCrowdLevel(avg) {
  return CROWD_LEVELS.find(l => avg < l.max) || CROWD_LEVELS[CROWD_LEVELS.length - 1];
}

function CrowdMeter({ rides, T, dark }) {
  const w = rides.filter(r=>r.status==="OPERATING"&&r.queue?.STANDBY?.waitTime!=null);
  if (!w.length) return null;
  const avg = w.reduce((s,r)=>s+r.queue.STANDBY.waitTime,0)/w.length;
  const cl  = getCrowdLevel(avg);
  const [bg, fg, bar] = dark ? cl.d : cl.l;
  const barPct = Math.min(100, Math.round((avg / 65) * 100));
  return (
    <div style={{ ...cardStyle(T),padding:"14px 16px",marginBottom:14,background:bg,border:`1px solid ${bar}44` }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
        <span style={{ color:fg,fontSize:13,fontFamily:FONT,fontWeight:600 }}>Park Crowd Level</span>
        <span style={{ color:fg,fontWeight:800,fontSize:13,fontFamily:FONT }}>{cl.icon} {cl.label}</span>
      </div>
      <div style={{ height:6,borderRadius:3,background:"rgba(0,0,0,0.12)",overflow:"hidden",marginBottom:6 }}>
        <div style={{ width:`${barPct}%`,height:"100%",background:bar,borderRadius:3,transition:"width 0.8s" }} />
      </div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <span style={{ color:fg,fontSize:11,fontFamily:FONT,opacity:0.75 }}>Avg standby: {Math.round(avg)} min · {w.length} rides reporting</span>
        <span style={{ color:fg,fontSize:11,fontFamily:FONT,fontWeight:600,opacity:0.85 }}>{cl.tip}</span>
      </div>
    </div>
  );
}

function StatPill({ icon, value, label, T }) {
  return (
    <div style={{ flex:1,...cardStyle(T),padding:"12px",textAlign:"center" }}>
      <div style={{ fontSize:18,marginBottom:3 }}>{icon}</div>
      <div style={{ color:T.text,fontWeight:800,fontSize:16,fontFamily:FONT }}>{value}</div>
      <div style={{ color:T.textMuted,fontSize:10,fontFamily:FONT,marginTop:1 }}>{label}</div>
    </div>
  );
}

function FilterBtn({ active, onClick, children, accent, T }) {
  return (
    <button onClick={onClick} style={{ background:active?accent:T.surface,color:active?"#fff":T.textSub,border:active?`1.5px solid ${accent}`:`1px solid ${T.border}`,borderRadius:20,padding:"5px 14px",fontSize:12,fontWeight:active?700:500,cursor:"pointer",whiteSpace:"nowrap",fontFamily:FONT,boxShadow:active?`0 2px 8px ${accent}44`:"none",transition:"all 0.15s" }}>{children}</button>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [token, setToken]       = useState(() => localStorage.getItem("dwt_token") || null);
  const [username, setUsername] = useState(() => localStorage.getItem("dwt_username") || null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [dark, setDark]             = useState(() => loadPref("dwt_dark", false));
  const [greggyMode, setGreggyMode] = useState(() => loadPref("dwt_greggy", false));
  const [windowWidth, setWindowWidth] = useState(() => typeof window !== "undefined" ? window.innerWidth : 430);
  useEffect(() => {
    const handler = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  const isTablet  = windowWidth >= BREAKPOINTS.mobile;
  const isDesktop = windowWidth >= BREAKPOINTS.tablet;
  const [activePark, setActivePark] = useState("mk");
  const [activeTab, setActiveTab]   = useState("rides");
  const [ridesData, setRidesData]   = useState({});
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [showMap, setShowMap]           = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showPlanner, setShowPlanner]     = useState(false);
  const [showAccuracy, setShowAccuracy]   = useState(false);
  const [showPredictor, setShowPredictor] = useState(false);
  const [serverDowntimes, setServerDowntimes] = useState({});
  const [localDowntimes, setLocalDowntimes]   = useState(() => loadLocalDowntimes());
  const downtimes = useMemo(() => mergeDowntimeSources(serverDowntimes, localDowntimes), [serverDowntimes, localDowntimes]);
  const [planRide, setPlanRide]         = useState(null);
  const [schedules, setSchedules]   = useState({});

  const [favorites, setFavorites]   = useState(() => loadPref("dwt_favorites", {}));
  const [alerts, setAlerts]         = useState(() => loadPref("dwt_alerts", {}));
  const [hidden, setHidden]         = useState(() => loadPref("dwt_hidden", {}));
  const [notes, setNotes]           = useState(() => loadPref("dwt_notes", {}));
  const [filter, setFilter]         = useState("all");
  const [heightFilter, setHeightFilter] = useState("all");
  const [a11yFilter, setA11yFilter]     = useState("all");
  const [listCollapsed, setListCollapsed] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  // sortBy: "wait_asc" | "wait_desc" | "name_asc" | "name_desc"
  const [sortBy, setSortBy]         = useState("wait_asc");
  const [alertModal, setAlertModal] = useState(null);
  const [noteModal, setNoteModal]   = useState(null); // ride object or null
  // In-app alert banners
  const [banners, setBanners]       = useState([]);
  const firedAlerts                 = useRef({});

  const T = greggyMode ? GREGGY : dark ? DARK : LIGHT;

  useEffect(() => { savePref("dwt_dark",      dark);       }, [dark]);
  useEffect(() => { savePref("dwt_greggy",    greggyMode); }, [greggyMode]);
  useEffect(() => { savePref("dwt_favorites", favorites);  }, [favorites]);
  useEffect(() => { savePref("dwt_alerts",    alerts);    }, [alerts]);
  useEffect(() => { savePref("dwt_hidden",    hidden);    }, [hidden]);
  useEffect(() => { savePref("dwt_notes",     notes);     }, [notes]);
  useEffect(() => { document.body.style.background = T.bg; }, [T.bg]);

  // Load profile from server once after login
  useEffect(() => {
    if (!token || profileLoaded) return;
    loadProfile(token).then(profile => {
      if (profile) {
        if (profile.favorites) setFavorites(profile.favorites);
        if (profile.alerts)    setAlerts(profile.alerts);
        if (profile.hidden)    setHidden(profile.hidden);
        if (profile.notes)     setNotes(profile.notes);
        if (profile.dark != null) setDark(profile.dark);
        if (profile.sortBy)   setSortBy(profile.sortBy);
      }
      setProfileLoaded(true);
    });
  }, [token, profileLoaded]);

  // Debounced sync to server on pref changes
  const syncTimer = useRef(null);
  useEffect(() => {
    if (!token || !profileLoaded) return;
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      saveProfile(token, { favorites, alerts, hidden, notes, dark, sortBy });
    }, 1500);
  }, [token, profileLoaded, favorites, alerts, hidden, notes, dark, sortBy]);

  const handleLogin = (newToken, newUsername) => {
    localStorage.setItem("dwt_token",    newToken);
    localStorage.setItem("dwt_username", newUsername);
    setToken(newToken);
    setUsername(newUsername);
    setProfileLoaded(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("dwt_token");
    localStorage.removeItem("dwt_username");
    setToken(null);
    setUsername(null);
    setProfileLoaded(false);
  };

  const fetchParkData = useCallback(async (parkKey) => {
    const p = PARKS[parkKey];
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/waittimes?entityId=${p.entityId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const all = (data.liveData||[]).filter(e=>e.entityType==="ATTRACTION"||e.entityType==="SHOW");
      setRidesData(prev => ({ ...prev, [parkKey]: all }));
      setLastRefresh(new Date());
      const rideOnly = all.filter(e=>!isShowEntity(e));
      saveHistory(rideOnly);
      const trackableRides = rideOnly.filter(r => !hasNoWait(r));
      setLocalDowntimes(updateLocalDowntimes(trackableRides));
      pushDowntimeUpdate(parkKey, trackableRides).then(d => { if (d) setServerDowntimes(prev => ({ ...prev, ...d })); });

      // Also save park-wide crowd snapshot
      const operating = rideOnly.filter(r => r.status==="OPERATING" && r.queue?.STANDBY?.waitTime!=null);
      if (operating.length > 0) {
        const avgWait = operating.reduce((s,r) => s + r.queue.STANDBY.waitTime, 0) / operating.length;
        fetch("/api/crowd", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ parkId: parkKey, avgWait, ts: Date.now() }) }).catch(()=>{});
      }

      // ── In-app alert check ──
      const newBanners = [];
      all.filter(e=>!isShowEntity(e)).forEach(ride => {
        const threshold = alerts[ride.id];
        if (!threshold || firedAlerts.current[ride.id]) return;
        const wait = ride.queue?.STANDBY?.waitTime;
        if (wait==null||wait>=threshold) return;
        firedAlerts.current[ride.id] = true;
        newBanners.push({ name:ride.name, wait, threshold });
      });
      if (newBanners.length) setBanners(prev => [...prev, ...newBanners]);

    } catch { setError("Couldn't load live wait times. Tap ↻ to retry."); }
    finally  { setLoading(false); }
  }, [alerts]);

  useEffect(() => { if (!ridesData[activePark]) fetchParkData(activePark); }, [activePark, fetchParkData, ridesData]);

  // Downtime state is tracked server-side (api/collect.js), so pull it in on
  // mount and periodically — this reflects real outage start times rather
  // than whenever this app instance happened to be open.
  useEffect(() => {
    let cancelled = false;
    const load = () => fetchServerDowntimes().then(d => { if (!cancelled) setServerDowntimes(d); });
    load();
    const id = setInterval(load, 5 * 60000); // refresh every 5 minutes
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  // Fetch park schedule when park changes
  useEffect(() => {
    if (schedules[activePark]) return;
    fetch(`/api/schedule?parkId=${activePark}`)
      .then(r => r.json())
      .then(data => setSchedules(prev => ({ ...prev, [activePark]: data })))
      .catch(() => {});
  }, [activePark, schedules]);

  // Reset fired state when alert thresholds change
  useEffect(() => { firedAlerts.current = {}; }, [alerts]);

  const parkBase = PARKS[activePark];
  const park     = greggyMode ? { ...parkBase, ...GREGGY_PARK } : parkBase;
  const allEntities = ridesData[activePark] || [];
  const rideEntities = allEntities.filter(e=>!isShowEntity(e));
  const showEntities = allEntities.filter(e=>isShowEntity(e));
  const openRides    = rideEntities.filter(r=>r.status==="OPERATING");
  const waitTimes    = openRides.map(r=>r.queue?.STANDBY?.waitTime).filter(w=>w!=null);
  const avgWait      = waitTimes.length ? Math.round(waitTimes.reduce((a,b)=>a+b,0)/waitTimes.length) : null;
  const shortestRide = [...openRides].filter(r=>r.queue?.STANDBY?.waitTime!=null).sort((a,b)=>a.queue.STANDBY.waitTime-b.queue.STANDBY.waitTime)[0];

  function sortRides(list) {
    return [...list].sort((a, b) => {
      const af = favorites[a.id]?0:1, bf = favorites[b.id]?0:1;
      if (af!==bf) return af-bf;
      if (sortBy==="name_asc")  return a.name.localeCompare(b.name);
      if (sortBy==="name_desc") return b.name.localeCompare(a.name);
      // Open rides with wait times always before closed/no-wait rides
      const aHasWait = a.status==="OPERATING" && a.queue?.STANDBY?.waitTime != null;
      const bHasWait = b.status==="OPERATING" && b.queue?.STANDBY?.waitTime != null;
      if (aHasWait && !bHasWait) return -1;
      if (!aHasWait && bHasWait) return 1;
      if (!aHasWait && !bHasWait) return a.name.localeCompare(b.name);
      const wa = a.queue.STANDBY.waitTime;
      const wb = b.queue.STANDBY.waitTime;
      return sortBy==="wait_desc" ? wb-wa : wa-wb;
    });
  }

  const filteredRides = sortRides(
    rideEntities.filter(r=>!hidden[r.id]).filter(r => {
      if (filter==="favorites") return favorites[r.id];
      if (filter==="high")   return inferThrill(r.name)==="high";
      if (filter==="medium") return inferThrill(r.name)==="medium";
      if (filter==="low")    return inferThrill(r.name)==="low";
      return true;
    }).filter(r => {
      const details = getRideDetails(r.name);
      // Greggy mode: only rides 38" and under OR no height requirement
      if (greggyMode) return !details?.height || details.height <= 38;
      if (heightFilter === "any")     return !details?.height;
      if (heightFilter === "under40") return !details?.height || details.height <= 40;
      if (heightFilter === "under44") return !details?.height || details.height <= 44;
      if (heightFilter === "under48") return !details?.height || details.height <= 48;
      return true;
    }).filter(r => {
      if (a11yFilter === "all") return true;
      const details = getRideDetails(r.name);
      if (a11yFilter === "wheelchair") return details?.a11y?.some(t => t.includes("May Remain in Wheelchair"));
      if (a11yFilter === "transfer")   return !details?.a11y?.some(t => t.includes("Must Transfer") || t.includes("Must Be Ambulatory"));
      if (a11yFilter === "no_loose")   return !details?.a11y?.some(t => t.includes("No Loose Articles"));
      if (a11yFilter === "ambulatory") return !details?.a11y?.some(t => t.includes("Must Be Ambulatory"));
      return true;
    })
  );

  const filteredShows = showEntities
    .filter(s=>!hidden[s.id])
    .filter(s=>filter!=="favorites"||favorites[s.id])
    .sort((a,b)=>{
      const af=favorites[a.id]?0:1,bf=favorites[b.id]?0:1;
      if(af!==bf)return af-bf;
      const an=(a.showtimes||[]).find(st=>isUpcoming(st.startTime));
      const bn=(b.showtimes||[]).find(st=>isUpcoming(st.startTime));
      if(an&&!bn)return -1; if(!an&&bn)return 1;
      if(an&&bn)return new Date(an.startTime)-new Date(bn.startTime);
      return a.name.localeCompare(b.name);
    });

  const hiddenCount     = Object.values(hidden).filter(Boolean).length;
  const toggleFavorite  = id => setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleHidden    = id => setHidden(prev => ({ ...prev, [id]: true }));
  const setNote         = (id, text) => setNotes(prev => { const n={...prev}; text?n[id]=text:delete n[id]; return n; });
  const saveAlert = (rideId, threshold) => {
    setAlerts(prev => { const n={...prev}; threshold===null?delete n[rideId]:(n[rideId]=threshold); return n; });
    setAlertModal(null);
  };

  // Sort button cycles: wait_asc → wait_desc → name_asc → name_desc
  const SORT_CYCLE = ["wait_asc","wait_desc","name_asc","name_desc"];
  const SORT_LABELS = { wait_asc:"Wait ↑", wait_desc:"Wait ↓", name_asc:"A→Z", name_desc:"Z→A" };
  const cycleSortBy = () => {
    const idx = SORT_CYCLE.indexOf(sortBy);
    setSortBy(SORT_CYCLE[(idx+1) % SORT_CYCLE.length]);
  };

  // Auth gate — show login screen if no token
  if (!token) return <AuthScreen onLogin={handleLogin} dark={dark} />;

  // Profile loading screen — brief, shows while fetching prefs from server
  if (!profileLoaded) return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:FONT }}>
      <div style={{ fontSize:52, marginBottom:12 }}>🏰</div>
      <div style={{ color:T.textSub, fontSize:14 }}>Loading your profile…</div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:FONT, transition:"background 0.3s" }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}
        @keyframes greggy-glow{0%,100%{box-shadow:0 0 8px #f5c80066}50%{box-shadow:0 0 18px #f5c800cc}}
        *{box-sizing:border-box;}
        button{transition:opacity 0.15s;}
        button:active{opacity:0.7;}
      `}</style>

      {/* Responsive container */}
      <div style={{ maxWidth: isDesktop ? 1200 : isTablet ? 768 : 430, margin: "0 auto" }}>

      {/* In-app alert banners */}
      <AlertBanner alerts={banners} onDismiss={i => setBanners(prev=>prev.filter((_,j)=>j!==i))} T={T} dark={dark} />

      {alertModal && (
        <AlertModal ride={alertModal} existing={alerts[alertModal.id]!=null?{threshold:alerts[alertModal.id]}:null}
          onSave={t=>saveAlert(alertModal.id,t)} onClose={()=>setAlertModal(null)} accent={park.accent} T={T} />
      )}

      {noteModal && (
        <NoteModal
          ride={noteModal}
          existingNote={notes[noteModal.id] || ""}
          onSave={(text) => { setNote(noteModal.id, text); setNoteModal(null); }}
          onClose={() => setNoteModal(null)}
          accent={park.accent} T={T}
        />
      )}

      {showMap && <MapModal park={park} onClose={()=>setShowMap(false)} T={T} dark={dark} />}
      {showCalendar && <CrowdCalendar T={T} dark={dark} accent={park.accent} accentLight={park.accentLight} accentDark={park.accentDark} onClose={()=>setShowCalendar(false)} />}
      {showPlanner && <DayPlanner T={T} dark={dark} accent={park.accent} accentLight={park.accentLight} accentDark={park.accentDark} parks={ridesData} onClose={()=>{setShowPlanner(false);setPlanRide(null);}} token={token} prefill={planRide} activeParkId={activePark} />}
      {showAccuracy && <WaitAccuracy T={T} dark={dark} accent={park.accent} accentLight={park.accentLight} accentDark={park.accentDark} onClose={()=>setShowAccuracy(false)} />}
      {showPredictor && <TripPredictor T={T} dark={dark} accent={park.accent} accentLight={park.accentLight} accentDark={park.accentDark} onClose={()=>setShowPredictor(false)} />}

      {/* Header */}
      <div style={{ background:greggyMode?"#1a5200":park.color, padding:`${isDesktop?"28px":"52px"} 20px 0`, position:"relative", overflow:"hidden",
        animation: greggyMode ? "greggy-glow 2s infinite" : "none" }}>
        <div style={{ position:"absolute",top:-40,right:-40,width:160,height:160,borderRadius:"50%",background:"rgba(255,255,255,0.06)",pointerEvents:"none" }} />
        {greggyMode && <div style={{ position:"absolute",top:8,left:0,right:0,textAlign:"center",fontSize:11,color:"#f5c800",fontFamily:FONT,fontWeight:700,letterSpacing:2,textTransform:"uppercase" }}>🐢 GREGGY MODE ACTIVATED 🐢</div>}

        {/* Always-visible top row: park name + refresh + collapse toggle */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
          <div style={{ cursor:"pointer" }} onClick={()=>setHeaderCollapsed(h=>!h)}>
            <div style={{ fontSize:11,color:"rgba(255,255,255,0.6)",textTransform:"uppercase",letterSpacing:2,fontWeight:600,marginBottom:2 }}>Walt Disney World</div>
            <div style={{ fontSize:26,fontWeight:900,color:greggyMode?"#f5c800":"#fff",letterSpacing:-0.5 }}>{park.icon} {park.name}</div>
          </div>
          <div style={{ display:"flex",gap:6,alignItems:"center" }}>
            <button onClick={()=>fetchParkData(activePark)} disabled={loading}
              style={{ background:"rgba(255,255,255,0.15)",border:"none",borderRadius:10,padding:"8px 12px",color:loading?"rgba(255,255,255,0.4)":"#fff",fontSize:18,cursor:loading?"default":"pointer" }}>
              {loading?"⟳":"↻"}
            </button>
            <button onClick={()=>setHeaderCollapsed(h=>!h)}
              style={{ background:"rgba(255,255,255,0.15)",border:"none",borderRadius:10,padding:"8px 12px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:FONT }}>
              {headerCollapsed?"▼":"▲"}
            </button>
          </div>
        </div>

        {/* Park switcher — always visible on mobile */}
        {!isDesktop && (
          <div style={{ display:"flex",gap:6,overflowX:"auto",paddingBottom:12,alignItems:"center" }}>
            {Object.entries(PARKS).map(([id,p]) => (
              <button key={id} onClick={()=>{ setActivePark(id); setListCollapsed(false); }} style={{ background:activePark===id?"rgba(255,255,255,0.25)":"rgba(255,255,255,0.1)",color:"#fff",border:activePark===id?"1.5px solid rgba(255,255,255,0.5)":"1px solid rgba(255,255,255,0.15)",borderRadius:20,padding:"5px 14px",fontSize:12,fontWeight:activePark===id?700:400,cursor:"pointer",whiteSpace:"nowrap",fontFamily:FONT }}>
                {p.icon} {id.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {/* Collapsible section */}
        {!headerCollapsed && (
          <div style={{ paddingBottom:20 }}>
            <div style={{ color:"rgba(255,255,255,0.5)",fontSize:11,marginBottom:10 }}>
              {loading?"Fetching live data…":lastRefresh?`Live · Updated ${lastRefresh.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}`:"Loading…"}
            </div>

            {/* Park hours */}
            {(() => {
              const s = schedules[activePark]?.schedule;
              if (!s) return null;
              const open  = s.openingTime  ? new Date(s.openingTime).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}) : null;
              const close = s.closingTime  ? new Date(s.closingTime).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}) : null;
              const special = schedules[activePark]?.special || [];
              if (!open && !close) return null;
              return (
                <div style={{ marginBottom:10 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}>
                    <span style={{ background:"rgba(255,255,255,0.15)",borderRadius:20,padding:"4px 12px",color:"#fff",fontSize:12,fontWeight:600,fontFamily:FONT }}>🕘 {open} – {close}</span>
                    {special.map((sp,i) => (
                      <span key={i} style={{ background:"rgba(255,215,0,0.2)",borderRadius:20,padding:"4px 12px",color:"#ffd700",fontSize:11,fontWeight:600,fontFamily:FONT,border:"1px solid rgba(255,215,0,0.3)" }}>
                        ✨ {sp.type?.replace(/_/g," ")}: {sp.openingTime?new Date(sp.openingTime).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):""}
                        {sp.closingTime?` – ${new Date(sp.closingTime).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})}` :""}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Secondary actions */}
            <div style={{ display:"flex",gap:6,alignItems:"center",flexWrap:"wrap" }}>
              <button onClick={handleLogout}
                style={{ background:"rgba(255,255,255,0.15)",border:"none",borderRadius:20,padding:"5px 12px",color:"#fff",fontFamily:FONT,fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap" }}>
                👤 {username}
              </button>
              <button onClick={()=>setGreggyMode(g=>!g)} style={{
                background: greggyMode?"#f5c800":"rgba(255,255,255,0.15)",
                border: greggyMode?"2px solid #fff":"none",
                borderRadius:20, padding:"5px 12px",
                color: greggyMode?"#0d1f00":"#fff",
                fontFamily:FONT, fontSize:11, fontWeight:800, cursor:"pointer", whiteSpace:"nowrap",
              }}>🐢 {greggyMode?"Exit Greggy Mode":"Greggy Mode"}</button>
              <div style={{ flex:1 }} />
              <button onClick={()=>setShowMap(true)} style={{ background:"rgba(255,255,255,0.15)",border:"none",borderRadius:10,padding:"6px 10px",color:"#fff",fontSize:15,cursor:"pointer" }}>🗺</button>
              <button onClick={()=>setShowAccuracy(true)} title="Wait Accuracy" style={{ background:"rgba(255,255,255,0.15)",border:"none",borderRadius:10,padding:"6px 10px",color:"#fff",fontSize:15,cursor:"pointer" }}>📊</button>
              <button onClick={()=>setShowPredictor(true)} title="Trip Predictor" style={{ background:"rgba(255,255,255,0.15)",border:"none",borderRadius:10,padding:"6px 10px",color:"#fff",fontSize:15,cursor:"pointer" }}>🔮</button>
              <button onClick={()=>setShowCalendar(true)} title="Crowd Calendar" style={{ background:"rgba(255,255,255,0.15)",border:"none",borderRadius:10,padding:"6px 10px",color:"#fff",fontSize:15,cursor:"pointer" }}>📅</button>
              <button onClick={()=>setShowPlanner(true)} title="Day Planner" style={{ background:"rgba(255,255,255,0.15)",border:"none",borderRadius:10,padding:"6px 10px",color:"#fff",fontSize:15,cursor:"pointer" }}>📋</button>
              <a href="https://disneyworld.disney.go.com/app/" target="_blank" rel="noreferrer"
                style={{ background:"rgba(255,255,255,0.15)",borderRadius:10,padding:"6px 10px",color:"#fff",fontSize:15,textDecoration:"none",display:"inline-flex",alignItems:"center" }}>🏰</a>
              <button onClick={()=>setDark(d=>!d)} style={{ background:"rgba(255,255,255,0.15)",border:"none",borderRadius:10,padding:"6px 10px",color:"#fff",fontSize:15,cursor:"pointer" }}>
                {dark?"☀️":"🌙"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop: flex row with sidebar + content. Mobile: just content */}
      <div style={{ display: isDesktop ? "flex" : "block", alignItems:"start" }}>

        {/* Desktop sidebar */}
        {isDesktop && (
          <div style={{ width:220, flexShrink:0, padding:"24px 12px 0 20px", borderRight:`1px solid ${T.border}`, position:"sticky", top:0, height:"100vh", overflowY:"auto" }}>
            <div style={{ color:T.textSub, fontSize:11, fontFamily:FONT, fontWeight:600, textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Parks</div>
            {Object.entries(PARKS).map(([id,p]) => (
              <button key={id} onClick={()=>{ setActivePark(id); setListCollapsed(false); }} style={{
                display:"flex", alignItems:"center", gap:10, width:"100%",
                padding:"11px 14px", borderRadius:12, border:"none", marginBottom:6,
                background: activePark===id ? (greggyMode?GREGGY_PARK.accentLight:park.accentLight) : T.bg,
                cursor:"pointer", fontFamily:FONT, textAlign:"left",
                borderLeft: activePark===id ? `3px solid ${greggyMode?GREGGY_PARK.accent:park.accent}` : "3px solid transparent",
                transition:"all 0.15s",
              }}>
                <span style={{ fontSize:22 }}>{p.icon}</span>
                <span style={{ color: activePark===id?(greggyMode?GREGGY_PARK.accent:park.accent):T.text, fontWeight:activePark===id?700:400, fontSize:14 }}>{p.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Main content */}
        <div style={{ flex:1, padding:"16px 16px 48px" }}>
          {error && <div style={{ background:greggyMode?"#0d1f00":dark?"#3b0a0a":"#fee2e2",borderRadius:12,padding:"12px 16px",marginBottom:14,border:`1px solid ${greggyMode?"#1a5200":dark?"#7f1d1d":"#fecaca"}`,color:greggyMode?"#f5c800":dark?"#f87171":"#991b1b",fontSize:13,fontFamily:FONT }}>⚠️ {error}</div>}

        {/* ── RIDES TAB ── */}
        {activeTab==="rides" && (
          <>
            {!loading && rideEntities.length>0 && (
              <>
                <CrowdMeter rides={rideEntities} T={T} dark={dark} />
                <div style={{ display:"flex",gap:10,marginBottom:14 }}>
                  <StatPill icon="⏱" value={avgWait!=null?`${avgWait}m`:"—"} label="Avg Wait" T={T} />
                  <StatPill icon="🎢" value={openRides.length} label="Open" T={T} />
                  <StatPill icon="✨" value={shortestRide?`${shortestRide.queue.STANDBY.waitTime}m`:"—"} label="Shortest" T={T} />
                </div>

                {/* Collapse toggle */}
                <button
                  onClick={()=>setListCollapsed(c=>!c)}
                  style={{ display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"10px 14px",marginBottom:listCollapsed?0:12,cursor:"pointer",fontFamily:FONT }}
                >
                  <div style={{ display:"flex",gap:6 }}>
                    {[{id:"rides",label:"🎢 Rides"},{id:"shows",label:"🎭 Shows"},{id:"favorites",label:"⭐ Favs"}].map(t=>(
                      <span
                        key={t.id}
                        onClick={e=>{ e.stopPropagation(); setActiveTab(t.id); setListCollapsed(false); }}
                        style={{
                          padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:activeTab===t.id?700:400,
                          background:activeTab===t.id?park.accent:"transparent",
                          color:activeTab===t.id?"#fff":T.textSub,
                          border:`1px solid ${activeTab===t.id?park.accent:T.border}`,
                          cursor:"pointer",
                        }}
                      >{t.label}</span>
                    ))}
                  </div>
                  <span style={{ color:T.textMuted,fontSize:13 }}>{listCollapsed?"▼ Show":"▲ Hide"}</span>
                </button>

                {!listCollapsed && (
                  <>
                    <CrowdTrend parkId={activePark} accent={park.accent} accentLight={park.accentLight} accentDark={park.accentDark} T={T} dark={dark} />
                    <div style={{ display:"flex",gap:6,marginBottom:10,overflowX:"auto",paddingBottom:2 }}>
                      {[{id:"all",label:"All"},{id:"favorites",label:"⭐ Favs"},{id:"high",label:"🔥 Thrill"},{id:"medium",label:"⚡ Moderate"},{id:"low",label:"🌿 Mild"}].map(f=>(
                        <FilterBtn key={f.id} active={filter===f.id} onClick={()=>setFilter(f.id)} accent={park.accent} T={T}>{f.label}</FilterBtn>
                      ))}
                    </div>

                    {/* Height + Accessibility dropdowns */}
                    <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                      <select value={heightFilter} onChange={e=>setHeightFilter(e.target.value)} style={{ flex:1, background:T.surface, color:T.textSub, border:`1px solid ${T.border}`, borderRadius:10, padding:"7px 10px", fontSize:12, fontFamily:FONT, cursor:"pointer" }}>
                        <option value="all">📏 Any height</option>
                        <option value="any">📏 No requirement</option>
                        <option value="under40">📏 Under 40"</option>
                        <option value="under44">📏 Under 44"</option>
                        <option value="under48">📏 Under 48"</option>
                      </select>
                      <select value={a11yFilter} onChange={e=>setA11yFilter(e.target.value)} style={{ flex:1, background:T.surface, color:T.textSub, border:`1px solid ${T.border}`, borderRadius:10, padding:"7px 10px", fontSize:12, fontFamily:FONT, cursor:"pointer" }}>
                        <option value="all">♿ All rides</option>
                        <option value="wheelchair">♿ Stay in wheelchair</option>
                        <option value="transfer">♿ No transfer req.</option>
                        <option value="no_loose">♿ Loose articles OK</option>
                        <option value="ambulatory">♿ No walking req.</option>
                      </select>
                    </div>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
                      {hiddenCount>0 ? (
                        <button onClick={()=>setHidden({})} style={{ background:T.surface,color:T.textSub,border:`1px solid ${T.border}`,borderRadius:20,padding:"5px 14px",fontSize:12,cursor:"pointer",fontFamily:FONT }}>Unhide all ({hiddenCount})</button>
                      ) : <div />}
                      <button onClick={cycleSortBy} style={{ background:T.surface,color:T.textSub,border:`1px solid ${T.border}`,borderRadius:10,padding:"6px 14px",fontSize:12,fontFamily:FONT,cursor:"pointer",fontWeight:600 }}>
                        {SORT_LABELS[sortBy]}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {loading && Array.from({length:7}).map((_,i)=><SkeletonCard key={i} T={T} />)}

            {!loading && !error && rideEntities.length===0 && (
              <div style={{ textAlign:"center",padding:"48px 20px",color:T.textMuted,fontFamily:FONT,fontSize:14 }}>
                <div style={{ fontSize:40,marginBottom:12 }}>{park.icon}</div>
                <div>Tap ↻ to load live wait times</div>
              </div>
            )}

            {!listCollapsed && !loading && filteredRides.length>0 && (
              <>
                <div style={{ color:T.textMuted,fontSize:11,fontFamily:FONT,marginBottom:10,textTransform:"uppercase",letterSpacing:1,fontWeight:600 }}>
                  {filteredRides.length} attractions · tap for trend chart
                </div>
                {filteredRides.map(ride=>(
                  <RideCard key={ride.id} ride={ride} accent={park.accent} accentLight={park.accentLight} accentDark={park.accentDark}
                    isFavorite={!!favorites[ride.id]} onToggleFavorite={()=>toggleFavorite(ride.id)}
                    alertThreshold={alerts[ride.id]??null} onSetAlert={()=>setAlertModal(ride)}
                    isHidden={!!hidden[ride.id]} onToggleHidden={()=>toggleHidden(ride.id)}
                    note={notes[ride.id]||""} onOpenNoteModal={()=>setNoteModal(ride)}
                    onAddToPlan={()=>{setPlanRide({name:ride.name,parkId:activePark,type:"ride"});setShowPlanner(true);}}
                    downtime={downtimes[ride.id]}
                    T={T} dark={dark} />
                ))}
              </>
            )}

            {!listCollapsed && !loading && filter==="favorites" && filteredRides.length===0 && (
              <div style={{ textAlign:"center",padding:"32px 20px",color:T.textMuted,fontFamily:FONT,fontSize:13 }}>
                <div style={{ fontSize:32,marginBottom:10 }}>☆</div>
                Tap ☆ on any ride to add it to favorites
              </div>
            )}
          </>
        )}

        {/* ── SHOWS TAB ── */}
        {activeTab==="shows" && (
          <>
            {!loading && showEntities.length>0 && (
              <>
                <div style={{ display:"flex",gap:10,marginBottom:14 }}>
                  <StatPill icon="🎭" value={showEntities.length} label="Total" T={T} />
                  <StatPill icon="🕐" value={showEntities.filter(s=>(s.showtimes||[]).length>0).length} label="With Times" T={T} />
                  <StatPill icon="▶️" value={showEntities.filter(s=>(s.showtimes||[]).some(st=>isUpcoming(st.startTime))).length} label="Upcoming" T={T} />
                </div>

                <button
                  onClick={()=>setListCollapsed(c=>!c)}
                  style={{ display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"10px 14px",marginBottom:listCollapsed?0:12,cursor:"pointer",fontFamily:FONT }}
                >
                  <div style={{ display:"flex",gap:6 }}>
                    {[{id:"rides",label:"🎢 Rides"},{id:"shows",label:"🎭 Shows"},{id:"favorites",label:"⭐ Favs"}].map(t=>(
                      <span
                        key={t.id}
                        onClick={e=>{ e.stopPropagation(); setActiveTab(t.id); setListCollapsed(false); }}
                        style={{
                          padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:activeTab===t.id?700:400,
                          background:activeTab===t.id?park.accent:"transparent",
                          color:activeTab===t.id?"#fff":T.textSub,
                          border:`1px solid ${activeTab===t.id?park.accent:T.border}`,
                          cursor:"pointer",
                        }}
                      >{t.label}</span>
                    ))}
                  </div>
                  <span style={{ color:T.textMuted,fontSize:13 }}>{listCollapsed?"▼ Show":"▲ Hide"}</span>
                </button>

                {!listCollapsed && (
                  <div style={{ display:"flex",gap:6,marginBottom:14 }}>
                    {[{id:"all",label:"All"},{id:"favorites",label:"⭐ Favs"}].map(f=>(
                      <FilterBtn key={f.id} active={filter===f.id} onClick={()=>setFilter(f.id)} accent={park.accent} T={T}>{f.label}</FilterBtn>
                    ))}
                  </div>
                )}
              </>
            )}
            {loading && Array.from({length:5}).map((_,i)=><SkeletonCard key={i} T={T} />)}
            {!loading && showEntities.length===0 && !error && (
              <div style={{ textAlign:"center",padding:"48px 20px",color:T.textMuted,fontFamily:FONT,fontSize:14 }}>
                <div style={{ fontSize:40,marginBottom:12 }}>🎭</div>
                <div>Tap ↻ to load show schedules</div>
              </div>
            )}
            {!listCollapsed && !loading && filteredShows.length>0 && (
              <>
                <div style={{ color:T.textMuted,fontSize:11,fontFamily:FONT,marginBottom:10,textTransform:"uppercase",letterSpacing:1,fontWeight:600 }}>
                  {filteredShows.length} shows · tap for full schedule
                </div>
                {filteredShows.map(show=>(
                  <ShowCard key={show.id} show={show} accent={park.accent} accentLight={park.accentLight} accentDark={park.accentDark}
                    isFavorite={!!favorites[show.id]} onToggleFavorite={()=>toggleFavorite(show.id)}
                    isHidden={!!hidden[show.id]} onToggleHidden={()=>toggleHidden(show.id)}
                    T={T} dark={dark} />
                ))}
              </>
            )}
          </>
        )}

        {/* ── FAVORITES TAB ── */}
        {activeTab==="favorites" && (
          <>
            {/* Favorite rides */}
            {(() => {
              const favRides = rideEntities.filter(r => favorites[r.id]);
              const favShows = showEntities.filter(s => favorites[s.id]);
              if (!favRides.length && !favShows.length && !loading) return (
                <div style={{ textAlign:"center", padding:"48px 20px", color:T.textMuted, fontFamily:FONT }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>⭐</div>
                  <div style={{ fontSize:15, fontWeight:600, color:T.textSub, marginBottom:8 }}>No favorites yet</div>
                  <div style={{ fontSize:13 }}>Tap ☆ on any ride or show to add it here</div>
                </div>
              );
              return (
                <>
                  {favRides.length > 0 && (
                    <>
                      <div style={{ color:T.textMuted,fontSize:11,fontFamily:FONT,marginBottom:10,textTransform:"uppercase",letterSpacing:1,fontWeight:600 }}>
                        ⭐ {favRides.length} Favorite Ride{favRides.length!==1?"s":""}
                      </div>
                      {favRides.map(ride=>(
                        <RideCard key={ride.id} ride={ride} accent={park.accent} accentLight={park.accentLight} accentDark={park.accentDark}
                          isFavorite={true} onToggleFavorite={()=>toggleFavorite(ride.id)}
                          alertThreshold={alerts[ride.id]??null} onSetAlert={()=>setAlertModal(ride)}
                          isHidden={false} onToggleHidden={()=>toggleHidden(ride.id)}
                          note={notes[ride.id]||""} onOpenNoteModal={()=>setNoteModal(ride)}
                          onAddToPlan={()=>{setPlanRide({name:ride.name,parkId:activePark,type:"ride"});setShowPlanner(true);}}
                          downtime={downtimes[ride.id]}
                          T={T} dark={dark} />
                      ))}
                    </>
                  )}
                  {favShows.length > 0 && (
                    <>
                      <div style={{ color:T.textMuted,fontSize:11,fontFamily:FONT,marginBottom:10,marginTop:favRides.length?14:0,textTransform:"uppercase",letterSpacing:1,fontWeight:600 }}>
                        ⭐ {favShows.length} Favorite Show{favShows.length!==1?"s":""}
                      </div>
                      {favShows.map(show=>(
                        <ShowCard key={show.id} show={show} accent={park.accent} accentLight={park.accentLight} accentDark={park.accentDark}
                          isFavorite={true} onToggleFavorite={()=>toggleFavorite(show.id)}
                          isHidden={false} onToggleHidden={()=>toggleHidden(show.id)}
                          T={T} dark={dark} />
                      ))}
                    </>
                  )}
                </>
              );
            })()}
            {loading && Array.from({length:3}).map((_,i)=><SkeletonCard key={i} T={T} />)}
          </>
        )}

        {/* Footer */}
        {!loading && allEntities.length>0 && (
          <div style={{ ...cardStyle(T),padding:"16px",marginTop:8,background:greggyMode?GREGGY_PARK.accentLight:dark?park.accentDark:park.accentLight,border:`1px solid ${park.accent}33` }}>
            <div style={{ color:park.accent,fontSize:12,fontWeight:700,fontFamily:FONT,marginBottom:4 }}>
              {greggyMode?"🐢 Greggy's Pro Strategy":"💡 Pro Strategy"}
            </div>
            <div style={{ color:T.textSub,fontSize:12,fontFamily:FONT,lineHeight:1.6 }}>
              {greggyMode
                ? "All rides listed are 38\" and under — perfect for little ones! Hit the fan favorites first thing in the morning before the crowds build up."
                : "Arrive 30 min before park open. Hit top rides first, then use Lightning Lane during peak hours. Return to headliners after 7pm for shorter queues."}
            </div>
            <div style={{ color:T.textMuted,fontSize:10,fontFamily:FONT,marginTop:8 }}>
              Powered by ThemeParks.wiki · Trend data builds with each visit
            </div>
          </div>
        )}
        </div>
      </div>
      </div>
    </div>
  );
}
