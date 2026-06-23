import { useState } from "react";

const FONT = "'Inter', sans-serif";
const PARK_NAMES = { mk:"Magic Kingdom", ep:"EPCOT", hs:"Hollywood Studios", ak:"Animal Kingdom" };
const PARK_ICONS = { mk:"🏰", ep:"🌍", hs:"🎬", ak:"🦁" };
const PARK_IDS   = ["mk","ep","hs","ak"];
const DAY_NAMES  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DAY_SHORT  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const SEASON_META = {
  value:   { label:"Value",   icon:"🟢", color:"#22c55e", tip:"Lowest crowds" },
  summer:  { label:"Summer",  icon:"🟠", color:"#f97316", tip:"High but steady" },
  holiday: { label:"Holiday", icon:"🟡", color:"#eab308", tip:"Elevated crowds" },
  peak:    { label:"Peak",    icon:"🔴", color:"#ef4444", tip:"Busiest period" },
};

const CONFIDENCE_META = {
  high:      { label:"Real data",        icon:"●", color:"#22c55e" },
  medium:    { label:"Blended",          icon:"◑", color:"#eab308" },
  low:       { label:"Scaled estimate",  icon:"○", color:"#f97316" },
  estimated: { label:"Baseline pattern", icon:"◌", color:"#94a3b8" },
};

function crowdLevel(avg, dark) {
  if (avg == null) return null;
  if (avg < 18) return { label:"Very Low", icon:"🟢", l:["#dcfce7","#14532d"], d:["#052e16","#4ade80"] };
  if (avg < 30) return { label:"Low",      icon:"🟩", l:["#bbf7d0","#166534"], d:["#064e3b","#34d399"] };
  if (avg < 45) return { label:"Moderate", icon:"🟡", l:["#fef9c3","#854d0e"], d:["#422006","#fbbf24"] };
  if (avg < 60) return { label:"High",     icon:"🟠", l:["#ffedd5","#9a3412"], d:["#431407","#fb923c"] };
  return             { label:"Peak",      icon:"🔴", l:["#fee2e2","#991b1b"], d:["#3b0a0a","#f87171"] };
}
function lvlBg(lvl, dark)  { return dark ? lvl.d[0] : lvl.l[0]; }
function lvlFg(lvl, dark)  { return dark ? lvl.d[1] : lvl.l[1]; }

async function fetchPrediction(startDate, endDate, parkId = "all") {
  const res = await fetch(
    `/api/crowd-calendar?mode=predict&startDate=${startDate}&endDate=${endDate}&parkId=${parkId}`
  );
  if (!res.ok) throw new Error("Failed to fetch prediction");
  return res.json();
}

function TripSummary({ data, T, dark, accent }) {
  const [selectedPark, setSelectedPark] = useState("all");

  // Merge all parks or show single park
  const getDays = () => {
    if (!data?.parks) return [];
    if (selectedPark === "all") {
      const ref = data.parks.mk || data.parks[Object.keys(data.parks)[0]] || [];
      return ref.map((day, i) => {
        const avgs = PARK_IDS.map(pid => data.parks[pid]?.[i]?.avg).filter(v => v != null);
        return {
          ...day,
          avg: avgs.length ? Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length) : null,
          parkAvgs: Object.fromEntries(PARK_IDS.map(pid => [pid, data.parks[pid]?.[i]?.avg])),
          confidence: data.parks.mk?.[i]?.confidence ?? "estimated",
        };
      });
    }
    return data.parks[selectedPark] || [];
  };

  const days = getDays();
  if (!days.length) return null;

  const sorted    = [...days].filter(d => d.avg != null).sort((a, b) => a.avg - b.avg);
  const bestDays  = sorted.slice(0, 3);
  const worstDays = sorted.slice(-3).reverse();

  // Group by day-of-week to find patterns
  const dowGroups = Array.from({ length: 7 }, (_, i) => ({
    dow: i,
    days: days.filter(d => d.dow === i && d.avg != null),
  })).filter(g => g.days.length > 0);
  const dowAvgs = dowGroups.map(g => ({
    dow: g.dow,
    avg: Math.round(g.days.reduce((s, d) => s + d.avg, 0) / g.days.length),
  })).sort((a, b) => a.avg - b.avg);

  // Park comparison
  const parkAvgs = PARK_IDS.map(pid => {
    const parkDays = (data.parks[pid] || []).filter(d => d.avg != null);
    if (!parkDays.length) return null;
    return { pid, avg: Math.round(parkDays.reduce((s, d) => s + d.avg, 0) / parkDays.length) };
  }).filter(Boolean).sort((a, b) => a.avg - b.avg);

  // Season breakdown
  const seasons = [...new Set(days.map(d => d.season))];

  const maxAvg = Math.max(...days.filter(d => d.avg != null).map(d => d.avg), 1);

  return (
    <div>
      {/* Park filter */}
      <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
        {[{id:"all",label:"🏳️ All Parks"}, ...PARK_IDS.map(pid=>({id:pid,label:`${PARK_ICONS[pid]} ${pid.toUpperCase()}`}))].map(({id,label}) => (
          <button key={id} onClick={() => setSelectedPark(id)} style={{
            padding:"5px 12px", borderRadius:20, fontSize:12, fontFamily:FONT, cursor:"pointer",
            fontWeight: selectedPark===id ? 700 : 400,
            background: selectedPark===id ? accent : T.surface,
            color: selectedPark===id ? "#fff" : T.textSub,
            border: `1px solid ${selectedPark===id ? accent : T.border}`,
          }}>{label}</button>
        ))}
      </div>

      {/* Season banner */}
      {seasons.length > 0 && (
        <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
          {seasons.map(s => {
            const sm = SEASON_META[s];
            return (
              <div key={s} style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:20, background:T.surface, border:`1px solid ${T.border}` }}>
                <span style={{ fontSize:11 }}>{sm.icon}</span>
                <span style={{ color:T.textSub, fontSize:11, fontFamily:FONT, fontWeight:600 }}>{sm.label} season</span>
                <span style={{ color:T.textMuted, fontSize:10, fontFamily:FONT }}>· {sm.tip}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Best days */}
      <div style={{ marginBottom:16 }}>
        <div style={{ color:T.textSub, fontSize:11, fontFamily:FONT, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>⭐ Best days to visit</div>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {bestDays.map((day, rank) => {
            const lvl   = crowdLevel(day.avg, dark);
            const pct   = Math.round((day.avg / maxAvg) * 100);
            const dateObj = new Date(day.date + "T12:00:00");
            const conf  = CONFIDENCE_META[day.confidence] || CONFIDENCE_META.estimated;
            return (
              <div key={day.date} style={{ padding:"12px 14px", borderRadius:14, background:lvlBg(lvl, dark), border:`1px solid ${lvlFg(lvl, dark)}44` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ color:accent, fontWeight:800, fontSize:13, fontFamily:FONT }}>#{rank+1}</span>
                      <span style={{ color:lvlFg(lvl, dark), fontWeight:700, fontSize:15, fontFamily:FONT }}>
                        {dateObj.toLocaleDateString([], { weekday:"short", month:"short", day:"numeric" })}
                      </span>
                    </div>
                    <div style={{ display:"flex", gap:6, marginTop:3, flexWrap:"wrap" }}>
                      <span style={{ color:lvlFg(lvl, dark), fontSize:11, fontFamily:FONT, opacity:0.8 }}>{SEASON_META[day.season]?.icon} {SEASON_META[day.season]?.label}</span>
                      <span style={{ color:conf.color, fontSize:11, fontFamily:FONT }}>{conf.icon} {conf.label}</span>
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ color:lvlFg(lvl, dark), fontWeight:800, fontSize:16, fontFamily:FONT }}>~{day.avg}m</div>
                    <div style={{ color:lvlFg(lvl, dark), fontSize:11, fontFamily:FONT, opacity:0.8 }}>{lvl.label}</div>
                  </div>
                </div>
                <div style={{ height:5, borderRadius:3, background:"rgba(0,0,0,0.1)", overflow:"hidden" }}>
                  <div style={{ width:`${pct}%`, height:"100%", background:lvlFg(lvl, dark), borderRadius:3, transition:"width 0.5s" }} />
                </div>
                {/* Per-park breakdown when "all" selected */}
                {selectedPark === "all" && day.parkAvgs && (
                  <div style={{ display:"flex", gap:6, marginTop:8, flexWrap:"wrap" }}>
                    {PARK_IDS.map(pid => {
                      const pavg = day.parkAvgs[pid];
                      if (pavg == null) return null;
                      const plvl = crowdLevel(pavg, dark);
                      return (
                        <div key={pid} style={{ display:"flex", alignItems:"center", gap:4 }}>
                          <span style={{ fontSize:12 }}>{PARK_ICONS[pid]}</span>
                          <span style={{ color:lvlFg(plvl, dark), fontSize:11, fontFamily:FONT, fontWeight:600 }}>~{pavg}m</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Worst days */}
      <div style={{ marginBottom:16 }}>
        <div style={{ color:T.textSub, fontSize:11, fontFamily:FONT, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>⚠️ Busiest days</div>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {worstDays.map((day, rank) => {
            const lvl     = crowdLevel(day.avg, dark);
            const dateObj = new Date(day.date + "T12:00:00");
            return (
              <div key={day.date} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", borderRadius:12, background:T.surface, border:`1px solid ${T.border}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ color:T.textMuted, fontSize:12, fontFamily:FONT }}>{rank===0?"🔴":rank===1?"🟠":"🟡"}</span>
                  <span style={{ color:T.text, fontWeight:600, fontSize:13, fontFamily:FONT }}>
                    {dateObj.toLocaleDateString([], { weekday:"short", month:"short", day:"numeric" })}
                  </span>
                </div>
                <span style={{ color:lvlFg(lvl, dark), fontWeight:700, fontSize:13, fontFamily:FONT }}>~{day.avg}m · {lvl.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day-of-week pattern */}
      {dowAvgs.length > 1 && (
        <div style={{ marginBottom:16, padding:"14px", borderRadius:14, background:T.surface, border:`1px solid ${T.border}` }}>
          <div style={{ color:T.textSub, fontSize:11, fontFamily:FONT, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>📅 Day-of-week pattern</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {dowAvgs.map(({ dow, avg }) => {
              const lvl = crowdLevel(avg, dark);
              const pct = Math.round((avg / Math.max(...dowAvgs.map(d => d.avg))) * 100);
              return (
                <div key={dow} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ minWidth:32, color:T.textSub, fontSize:12, fontFamily:FONT, fontWeight:600 }}>{DAY_SHORT[dow]}</div>
                  <div style={{ flex:1, height:8, borderRadius:4, background:T.bg, overflow:"hidden" }}>
                    <div style={{ width:`${pct}%`, height:"100%", background:lvlFg(lvl, dark), borderRadius:4, transition:"width 0.5s" }} />
                  </div>
                  <div style={{ minWidth:60, textAlign:"right" }}>
                    <span style={{ color:lvlFg(lvl, dark), fontSize:12, fontFamily:FONT, fontWeight:700 }}>~{avg}m</span>
                    <span style={{ color:T.textMuted, fontSize:10, fontFamily:FONT, marginLeft:4 }}>{lvl.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Park comparison */}
      {selectedPark === "all" && parkAvgs.length > 1 && (
        <div style={{ marginBottom:16, padding:"14px", borderRadius:14, background:T.surface, border:`1px solid ${T.border}` }}>
          <div style={{ color:T.textSub, fontSize:11, fontFamily:FONT, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>🎡 Quietest parks during your trip</div>
          {parkAvgs.map(({ pid, avg }, i) => {
            const lvl = crowdLevel(avg, dark);
            return (
              <div key={pid} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", borderRadius:10, background:i===0?lvlBg(lvl,dark):T.bg, border:`1px solid ${i===0?lvlFg(lvl,dark)+"44":T.border}`, marginBottom:6 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:18 }}>{PARK_ICONS[pid]}</span>
                  <div>
                    <div style={{ color:T.text, fontWeight:600, fontSize:13, fontFamily:FONT }}>{PARK_NAMES[pid]}</div>
                    <div style={{ color:T.textMuted, fontSize:10, fontFamily:FONT }}>avg ~{avg}m wait</div>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  {i === 0 && <span style={{ color:lvlFg(lvl,dark), fontSize:11, fontFamily:FONT, fontWeight:700 }}>Best pick</span>}
                  <span style={{ background:lvlBg(lvl,dark), color:lvlFg(lvl,dark), borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:700, fontFamily:FONT, border:`1px solid ${lvlFg(lvl,dark)}44` }}>
                    {lvl.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full day-by-day list */}
      <div>
        <div style={{ color:T.textSub, fontSize:11, fontFamily:FONT, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>All days</div>
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          {days.map(day => {
            const lvl     = crowdLevel(day.avg, dark);
            const dateObj = new Date(day.date + "T12:00:00");
            const conf    = CONFIDENCE_META[day.confidence] || CONFIDENCE_META.estimated;
            if (!lvl) return null;
            return (
              <div key={day.date} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", borderRadius:10, background:T.surface, border:`1px solid ${T.border}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:3, height:32, borderRadius:2, background:lvlFg(lvl, dark), flexShrink:0 }} />
                  <div>
                    <div style={{ color:T.text, fontWeight:600, fontSize:13, fontFamily:FONT }}>
                      {dateObj.toLocaleDateString([], { weekday:"short", month:"short", day:"numeric" })}
                    </div>
                    <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                      <span style={{ color:T.textMuted, fontSize:10, fontFamily:FONT }}>{SEASON_META[day.season]?.icon} {SEASON_META[day.season]?.label}</span>
                      <span style={{ color:conf.color, fontSize:10, fontFamily:FONT }}>{conf.icon} {conf.label}</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ color:lvlFg(lvl, dark), fontWeight:700, fontSize:13, fontFamily:FONT }}>~{day.avg}m</div>
                  <div style={{ color:T.textMuted, fontSize:10, fontFamily:FONT }}>{lvl.icon} {lvl.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function TripPredictor({ T, dark, accent, accentLight, accentDark, onClose }) {
  const today     = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState("");
  const [endDate,   setEndDate]   = useState("");
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  const tripDays = startDate && endDate ? Math.round((new Date(endDate) - new Date(startDate)) / 86400000) + 1 : 0;
  const canPredict = startDate && endDate && endDate >= startDate && tripDays <= 30;

  async function predict() {
    if (!canPredict) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await fetchPrediction(startDate, endDate);
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Quick presets
  const presets = [
    { label: "This weekend", fn: () => {
      const d = new Date(); const dow = d.getDay();
      const sat = new Date(d); sat.setDate(d.getDate() + (6 - dow));
      const sun = new Date(sat); sun.setDate(sat.getDate() + 1);
      setStartDate(sat.toISOString().slice(0,10));
      setEndDate(sun.toISOString().slice(0,10));
    }},
    { label: "Next week", fn: () => {
      const d = new Date(); const dow = d.getDay();
      const mon = new Date(d); mon.setDate(d.getDate() + (8 - dow) % 7 || 7);
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      setStartDate(mon.toISOString().slice(0,10));
      setEndDate(sun.toISOString().slice(0,10));
    }},
    { label: "July 4th week", fn: () => { setStartDate("2026-06-28"); setEndDate("2026-07-07"); }},
    { label: "Thanksgiving", fn: () => { setStartDate("2026-11-22"); setEndDate("2026-11-30"); }},
    { label: "Christmas", fn: () => { setStartDate("2026-12-20"); setEndDate("2026-12-31"); }},
  ];

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:T.bg,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:500,maxHeight:"92vh",overflow:"auto",boxShadow:"0 -4px 32px rgba(0,0,0,0.3)" }}>

        {/* Header */}
        <div style={{ padding:"20px 20px 0",position:"sticky",top:0,background:T.bg,zIndex:1,borderBottom:`1px solid ${T.border}`,paddingBottom:14 }}>
          <div style={{ width:36,height:4,borderRadius:2,background:T.border,margin:"0 auto 16px" }} />
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}>
            <div style={{ color:T.text,fontWeight:700,fontSize:18,fontFamily:FONT }}>🔮 Trip Predictor</div>
            <button onClick={onClose} style={{ background:"none",border:"none",color:T.textMuted,fontSize:22,cursor:"pointer" }}>✕</button>
          </div>
          <div style={{ color:T.textMuted,fontSize:12,fontFamily:FONT }}>Pick your dates to get a crowd prediction</div>
        </div>

        <div style={{ padding:"16px 20px 48px" }}>

          {/* Date pickers */}
          <div style={{ display:"flex", gap:10, marginBottom:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ color:T.textSub,fontSize:11,fontFamily:FONT,fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:5 }}>Arrival</div>
              <input type="date" value={startDate} min={today}
                onChange={e => { setStartDate(e.target.value); if (endDate && e.target.value > endDate) setEndDate(""); }}
                style={{ width:"100%",padding:"10px 12px",borderRadius:10,border:`1px solid ${T.border}`,background:T.surface,color:T.text,fontFamily:FONT,fontSize:14,boxSizing:"border-box",cursor:"pointer" }}
              />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ color:T.textSub,fontSize:11,fontFamily:FONT,fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:5 }}>Departure</div>
              <input type="date" value={endDate} min={startDate || today}
                onChange={e => setEndDate(e.target.value)}
                style={{ width:"100%",padding:"10px 12px",borderRadius:10,border:`1px solid ${T.border}`,background:T.surface,color:T.text,fontFamily:FONT,fontSize:14,boxSizing:"border-box",cursor:"pointer" }}
              />
            </div>
          </div>

          {/* Quick presets */}
          <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
            {presets.map(p => (
              <button key={p.label} onClick={p.fn} style={{ padding:"4px 10px",borderRadius:20,border:`1px solid ${T.border}`,background:T.surface,color:T.textSub,fontSize:11,fontFamily:FONT,cursor:"pointer" }}>
                {p.label}
              </button>
            ))}
          </div>

          {/* Trip length indicator */}
          {tripDays > 0 && (
            <div style={{ marginBottom:14, padding:"8px 12px", borderRadius:10, background:dark?accentDark:accentLight, border:`1px solid ${accent}33` }}>
              <span style={{ color:accent, fontSize:12, fontFamily:FONT, fontWeight:600 }}>
                {tripDays} day{tripDays!==1?"s":""} selected
                {tripDays > 30 && " · Max 30 days"}
              </span>
            </div>
          )}

          {/* Predict button */}
          <button onClick={predict} disabled={!canPredict || loading} style={{
            width:"100%", padding:"13px", borderRadius:14, border:"none",
            background: canPredict ? accent : "#9ca3af",
            color:"#fff", fontFamily:FONT, fontWeight:700, fontSize:15,
            cursor: canPredict ? "pointer" : "default", marginBottom:20,
          }}>
            {loading ? "Predicting…" : "🔮 Predict Crowd Levels"}
          </button>

          {error && (
            <div style={{ background:dark?"#3b0a0a":"#fee2e2",borderRadius:12,padding:"12px 16px",color:dark?"#f87171":"#991b1b",fontFamily:FONT,fontSize:13,marginBottom:16 }}>⚠️ {error}</div>
          )}

          {loading && (
            <div style={{ textAlign:"center",padding:"32px 0",color:T.textMuted,fontFamily:FONT }}>
              <div style={{ fontSize:32,marginBottom:12 }}>🔮</div>
              <div>Analyzing crowd patterns…</div>
            </div>
          )}

          {/* Confidence legend */}
          {data && !loading && (
            <div style={{ marginBottom:16, padding:"10px 12px", borderRadius:10, background:T.surface, border:`1px solid ${T.border}` }}>
              <div style={{ color:T.textSub,fontSize:11,fontFamily:FONT,fontWeight:600,marginBottom:6 }}>Prediction confidence</div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                {Object.entries(CONFIDENCE_META).map(([id, m]) => (
                  <div key={id} style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <span style={{ color:m.color, fontSize:13 }}>{m.icon}</span>
                    <span style={{ color:T.textMuted, fontSize:10, fontFamily:FONT }}>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data && !loading && (
            <TripSummary data={data} T={T} dark={dark} accent={accent} accentLight={accentLight} accentDark={accentDark} />
          )}
        </div>
      </div>
    </div>
  );
}
