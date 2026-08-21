import { useState, useEffect, useMemo, useRef } from "react";
import { FESTIVAL_DATES, FESTIVAL_BOOTHS } from "./foodWineData.js";
import { MAP_VIEWBOX, LAGOON, PAVILION_LABELS, BOOTH_MAP_POSITIONS } from "./foodWineMapPositions.js";

const FONT = "'Inter', sans-serif";

// Eaten + favorite status is stored locally first (so it works instantly and
// offline), then synced to your account profile when logged in — same
// mechanism as your ride favorites, just its own fields (fwEaten /
// fwFavorites) so the two don't collide.
function loadEaten() {
  try { return JSON.parse(localStorage.getItem("dwt_fw_eaten") || "{}"); } catch { return {}; }
}
function saveEaten(d) {
  try { localStorage.setItem("dwt_fw_eaten", JSON.stringify(d)); } catch {}
}
function loadFavorites() {
  try { return JSON.parse(localStorage.getItem("dwt_fw_favorites") || "{}"); } catch { return {}; }
}
function saveFavorites(d) {
  try { localStorage.setItem("dwt_fw_favorites", JSON.stringify(d)); } catch {}
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function fmtDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function daysUntil(dateStr) {
  const today = new Date(todayKey() + "T00:00:00");
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target - today) / 86400000);
}

function BoothOpenBadge({ opensAt, T, accent }) {
  if (!opensAt) return null;
  const diff = daysUntil(opensAt);
  if (diff <= 0) return null; // already open — no badge needed
  return (
    <span style={{
      background: accent, color: "#fff", borderRadius: 20, padding: "2px 10px",
      fontSize: 11, fontWeight: 700, fontFamily: FONT, whiteSpace: "nowrap",
    }}>
      Opens {fmtDate(opensAt)} · {diff}d
    </span>
  );
}

export default function FoodWine({ T, dark, accent, accentLight, accentDark, onClose, token }) {
  const [eaten, setEaten]         = useState(() => loadEaten());
  const [favorites, setFavorites] = useState(() => loadFavorites());
  const [filter, setFilter]       = useState("all"); // all | favorites | not-tried
  const [course, setCourse]       = useState("all"); // all | food | drink
  const [expanded, setExpanded]   = useState(() => new Set());
  const [syncing, setSyncing]     = useState(false);
  const [view, setView]           = useState("list"); // list | map
  const [selectedBooth, setSelectedBooth] = useState(null);
  const boothRefs = useRef({});

  // Pull down synced state on open. Server data wins if present — it
  // reflects whatever this account last saved from any device. If there's
  // nothing on the server yet (first time), local data stays and gets
  // pushed up on the next toggle.
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch("/api/profile", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const data = await res.json();
        const serverEaten     = data.profile?.fwEaten;
        const serverFavorites = data.profile?.fwFavorites;
        if (serverEaten) { setEaten(serverEaten); saveEaten(serverEaten); }
        if (serverFavorites) { setFavorites(serverFavorites); saveFavorites(serverFavorites); }
      } catch {}
    })();
  }, [token]);

  async function syncToServer(fields) {
    if (!token) return;
    try {
      setSyncing(true);
      await fetch("/api/profile", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
    } catch {} finally { setSyncing(false); }
  }

  function toggleEaten(itemId) {
    const updated = { ...eaten, [itemId]: !eaten[itemId] };
    setEaten(updated);
    saveEaten(updated);
    syncToServer({ fwEaten: updated });
  }
  function toggleFavorite(itemId) {
    const updated = { ...favorites, [itemId]: !favorites[itemId] };
    setFavorites(updated);
    saveFavorites(updated);
    syncToServer({ fwFavorites: updated });
  }
  function toggleExpanded(boothId) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(boothId) ? next.delete(boothId) : next.add(boothId);
      return next;
    });
  }

  function jumpToBooth(boothId) {
    setView("list");
    setFilter("all");
    setCourse("all");
    setExpanded(prev => new Set(prev).add(boothId));
    setTimeout(() => {
      boothRefs.current[boothId]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  const totalItems     = FESTIVAL_BOOTHS.reduce((s, b) => s + b.items.length, 0);
  const eatenCount     = Object.values(eaten).filter(Boolean).length;
  const favoriteCount  = Object.values(favorites).filter(Boolean).length;

  const visibleBooths = useMemo(() => {
    return FESTIVAL_BOOTHS
      .map(booth => ({
        ...booth,
        items: booth.items.filter(item => {
          if (course === "food" && item.type !== "food") return false;
          if (course === "drink" && item.type !== "drink") return false;
          if (filter === "favorites" && !favorites[item.id]) return false;
          if (filter === "not-tried" && eaten[item.id]) return false;
          return true;
        }),
      }))
      .filter(booth => booth.items.length > 0);
  }, [filter, course, favorites, eaten]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.bg, borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 500, maxHeight: "92vh", overflow: "auto", boxShadow: "0 -4px 32px rgba(0,0,0,0.3)" }}>

        {/* Header */}
        <div style={{ padding: "20px 20px 0", position: "sticky", top: 0, background: T.bg, zIndex: 1, borderBottom: `1px solid ${T.border}`, paddingBottom: 14 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: T.border, margin: "0 auto 16px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ color: T.text, fontWeight: 700, fontSize: 18, fontFamily: FONT }}>
              🍷 Food &amp; Wine Festival {syncing && <span style={{ color: T.textMuted, fontSize: 11, fontWeight: 400 }}>Saving…</span>}
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: T.textMuted, fontSize: 22, cursor: "pointer" }}>✕</button>
          </div>

          <div style={{ color: T.textMuted, fontSize: 12, fontFamily: FONT, marginBottom: 12 }}>
            {fmtDate(FESTIVAL_DATES.start)} – {fmtDate(FESTIVAL_DATES.end)} · {eatenCount}/{totalItems} tried · {favoriteCount} favorited
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {[
              { key: "list", label: "📋 List" },
              { key: "map",  label: "🗺️ Map" },
            ].map(v => (
              <button key={v.key} onClick={() => setView(v.key)} style={{
                flex: 1, background: view === v.key ? accentDark : T.surface,
                color: view === v.key ? "#fff" : T.textSub,
                border: `1px solid ${view === v.key ? accentDark : T.border}`,
                borderRadius: 10, padding: "8px 10px", fontSize: 13,
                fontWeight: view === v.key ? 700 : 400, cursor: "pointer", fontFamily: FONT,
              }}>
                {v.label}
              </button>
            ))}
          </div>

          {/* Filter tabs — list view only */}
          {view === "list" && (
            <>
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                {[
                  { key: "all",        label: "All Booths" },
                  { key: "favorites",  label: "★ Favorites" },
                  { key: "not-tried",  label: "Not Tried Yet" },
                ].map(f => (
                  <button key={f.key} onClick={() => setFilter(f.key)} style={{
                    background: filter === f.key ? accent : T.surface,
                    color: filter === f.key ? "#fff" : T.textSub,
                    border: `1px solid ${filter === f.key ? accent : T.border}`,
                    borderRadius: 20, padding: "5px 14px", fontSize: 12,
                    fontWeight: filter === f.key ? 700 : 400, cursor: "pointer",
                    whiteSpace: "nowrap", fontFamily: FONT,
                  }}>
                    {f.label}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  { key: "all",   label: "Food & Drinks" },
                  { key: "food",  label: "🍴 Food" },
                  { key: "drink", label: "🍹 Drinks" },
                ].map(c => (
                  <button key={c.key} onClick={() => setCourse(c.key)} style={{
                    background: course === c.key ? T.text : "transparent",
                    color: course === c.key ? T.bg : T.textMuted,
                    border: `1px solid ${course === c.key ? T.text : T.border}`,
                    borderRadius: 20, padding: "4px 12px", fontSize: 11,
                    fontWeight: course === c.key ? 700 : 400, cursor: "pointer",
                    whiteSpace: "nowrap", fontFamily: FONT,
                  }}>
                    {c.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Booth list */}
        {view === "list" && (
        <div style={{ padding: "16px 20px 40px" }}>
          {visibleBooths.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: T.textMuted, fontFamily: FONT }}>
              {filter === "favorites" ? "No favorites yet — tap ☆ on an item to add one." : "Nothing here yet."}
            </div>
          )}

          {visibleBooths.map(booth => {
            const isOpen = expanded.has(booth.id) || filter !== "all" || course !== "all";
            const boothEatenCount = booth.items.filter(i => eaten[i.id]).length;

            return (
              <div key={booth.id} ref={el => { boothRefs.current[booth.id] = el; }} style={{ marginBottom: 12, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
                <button
                  onClick={() => toggleExpanded(booth.id)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: T.surface, border: "none", cursor: "pointer", textAlign: "left" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: T.text, fontWeight: 700, fontSize: 14, fontFamily: FONT }}>{booth.name}</div>
                    <div style={{ color: T.textMuted, fontSize: 11, fontFamily: FONT, marginTop: 2 }}>
                      {booth.location ? `${booth.location} · ` : ""}{boothEatenCount}/{booth.items.length} tried
                    </div>
                  </div>
                  <BoothOpenBadge opensAt={booth.opensAt} T={T} accent={accent} />
                  <span style={{ color: T.textMuted, fontSize: 14, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>▾</span>
                </button>

                {isOpen && (
                  <div style={{ padding: "6px 14px 12px" }}>
                    {booth.items.map(item => (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: `1px solid ${T.border}` }}>
                        <button
                          onClick={() => toggleEaten(item.id)}
                          title={eaten[item.id] ? "Mark not tried" : "Mark tried"}
                          style={{
                            width: 22, height: 22, borderRadius: 6, flexShrink: 0, cursor: "pointer",
                            border: `1.5px solid ${eaten[item.id] ? accent : T.border}`,
                            background: eaten[item.id] ? accent : "transparent",
                            color: "#fff", fontSize: 13, fontWeight: 700,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                          {eaten[item.id] ? "✓" : ""}
                        </button>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            color: eaten[item.id] ? T.textMuted : T.text,
                            fontSize: 13, fontFamily: FONT, fontWeight: 600,
                            textDecoration: eaten[item.id] ? "line-through" : "none",
                          }}>
                            {item.type === "drink" ? "🍹 " : "🍴 "}{item.name}
                            {item.type === "drink" && item.alcoholic === false && (
                              <span style={{ color: T.textMuted, fontSize: 10, fontWeight: 400, marginLeft: 6 }}>NA</span>
                            )}
                          </div>
                          {item.desc && (
                            <div style={{ color: T.textMuted, fontSize: 11, fontFamily: FONT, marginTop: 1 }}>{item.desc}</div>
                          )}
                        </div>

                        <div style={{ color: T.textSub, fontSize: 12, fontFamily: FONT, fontWeight: 700, flexShrink: 0 }}>
                          {item.price || "—"}
                        </div>

                        <button
                          onClick={() => toggleFavorite(item.id)}
                          title={favorites[item.id] ? "Remove favorite" : "Add to favorites"}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, flexShrink: 0, color: favorites[item.id] ? "#f59e0b" : T.textMuted }}>
                          {favorites[item.id] ? "★" : "☆"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}

        {/* Map view */}
        {view === "map" && (
          <div style={{ padding: "4px 16px 24px" }}>
            <div style={{ color: T.textMuted, fontSize: 11, fontFamily: FONT, textAlign: "center", marginBottom: 6 }}>
              Schematic layout — not to scale. Tap a pin for details.
            </div>
            <svg viewBox={MAP_VIEWBOX} style={{ width: "100%", height: "auto", display: "block" }}>
              <ellipse cx={LAGOON.cx} cy={LAGOON.cy} rx={LAGOON.rx} ry={LAGOON.ry}
                fill={dark ? "#1e3a5f" : "#bfe3f5"} stroke={dark ? "#3b82f6" : "#7dd3fc"} strokeWidth="1.5" />

              {PAVILION_LABELS.map(l => (
                <text key={l.name} x={l.x} y={l.y} textAnchor="middle"
                  fontSize="9" fontWeight="700" fontFamily={FONT}
                  fill={dark ? "#94a3b8" : "#64748b"} letterSpacing="0.5">
                  {l.name}
                </text>
              ))}

              {FESTIVAL_BOOTHS.map(booth => {
                const p = BOOTH_MAP_POSITIONS[booth.id];
                if (!p) return null;
                const boothEatenCount = booth.items.filter(i => eaten[i.id]).length;
                const anyFavorite = booth.items.some(i => favorites[i.id]);
                const fullyTried = booth.items.length > 0 && boothEatenCount === booth.items.length;
                const notOpenYet = booth.opensAt && daysUntil(booth.opensAt) > 0;
                const isSelected = selectedBooth === booth.id;
                const pinColor = notOpenYet ? (dark ? "#475569" : "#cbd5e1")
                  : fullyTried ? accent
                  : (dark ? "#334155" : "#fff");
                return (
                  <g key={booth.id} onClick={() => setSelectedBooth(isSelected ? null : booth.id)} style={{ cursor: "pointer" }}>
                    <circle cx={p.x} cy={p.y} r={isSelected ? 12 : 9}
                      fill={pinColor}
                      stroke={anyFavorite ? "#f59e0b" : accentDark}
                      strokeWidth={anyFavorite ? 2.5 : 1.5} />
                    {p.num && (
                      <text x={p.x} y={p.y + 3.5} textAnchor="middle" fontSize="8" fontWeight="700" fontFamily={FONT}
                        fill={fullyTried || notOpenYet ? "#fff" : (dark ? "#e2e8f0" : "#1e293b")}>
                        {p.num}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Legend */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 4, fontSize: 10, color: T.textMuted, fontFamily: FONT }}>
              <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 9, background: dark ? "#334155" : "#fff", border: `1.5px solid ${accentDark}`, marginRight: 4, verticalAlign: -1 }} />Not fully tried</span>
              <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 9, background: accent, border: `1.5px solid ${accentDark}`, marginRight: 4, verticalAlign: -1 }} />All tried</span>
              <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 9, background: dark ? "#475569" : "#cbd5e1", border: `1.5px solid ${accentDark}`, marginRight: 4, verticalAlign: -1 }} />Not open yet</span>
              <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 9, background: "#fff", border: "2.5px solid #f59e0b", marginRight: 4, verticalAlign: -1 }} />Has favorite</span>
            </div>

            {/* Selected booth popover */}
            {selectedBooth && (() => {
              const booth = FESTIVAL_BOOTHS.find(b => b.id === selectedBooth);
              if (!booth) return null;
              const boothEatenCount = booth.items.filter(i => eaten[i.id]).length;
              return (
                <div style={{ marginTop: 12, padding: 14, borderRadius: 14, background: T.surface, border: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div>
                      <div style={{ color: T.text, fontWeight: 700, fontSize: 14, fontFamily: FONT }}>{booth.name}</div>
                      <div style={{ color: T.textMuted, fontSize: 11, fontFamily: FONT, marginTop: 2 }}>
                        {booth.location ? `${booth.location} · ` : ""}{boothEatenCount}/{booth.items.length} tried
                      </div>
                    </div>
                    <BoothOpenBadge opensAt={booth.opensAt} T={T} accent={accent} />
                  </div>
                  <button onClick={() => jumpToBooth(booth.id)} style={{
                    marginTop: 10, width: "100%", background: accent, color: "#fff", border: "none",
                    borderRadius: 10, padding: "9px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT,
                  }}>
                    View Menu →
                  </button>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
