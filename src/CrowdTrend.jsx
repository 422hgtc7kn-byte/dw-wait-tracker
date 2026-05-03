import { useState, useEffect } from "react";
import { getETHour, getETDay } from "./etHour.js";

const FONT = "'Inter', sans-serif";
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DAYS_FULL  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const PARK_OPEN  = 9;
const HOUR_LABELS = ["9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm","6pm","7pm","8pm","9pm","10pm"];

const TYPICAL_HOURLY = {
  mk: [18,32,48,58,62,60,54,48,42,36,30,24,18,12],
  ep: [14,24,38,48,52,50,46,40,34,28,22,18,12,8],
  hs: [20,36,52,62,65,63,56,50,44,36,28,22,15,10],
  ak: [16,28,42,50,52,48,40,32,24,18,12,8,5,4],
};

const TYPICAL_DOW = {
  mk: [42,52,36,34,38,44,56],
  ep: [34,44,30,28,32,38,48],
  hs: [46,54,38,36,40,46,58],
  ak: [32,40,26,24,28,34,44],
};

// Crowd level thresholds (avg wait minutes)
const LEVELS = [
  { label:"Low",      max:20,  icon:"🟢", bg:{ l:["#dcfce7","#15803d"], d:["#052e16","#4ade80"] } },
  { label:"Moderate", max:35,  icon:"🟡", bg:{ l:["#fef9c3","#854d0e"], d:["#422006","#fbbf24"] } },
  { label:"High",     max:50,  icon:"🟠", bg:{ l:["#ffedd5","#9a3412"], d:["#431407","#fb923c"] } },
  { label:"Peak",     max:9999,icon:"🔴", bg:{ l:["#fee2e2","#991b1b"], d:["#3b0a0a","#f87171"] } },
];

function getLevel(avg) {
  return LEVELS.find(l => avg < l.max) || LEVELS[LEVELS.length - 1];
}
function crowdColor(avg, dark) {
  const level = getLevel(avg);
  return dark ? level.bg.d[1] : level.bg.l[1];
}
function crowdBg(avg, dark) {
  const level = getLevel(avg);
  return dark ? level.bg.d[0] : level.bg.l[0];
}

async function fetchCrowdData(parkId) {
  try {
    const res = await fetch(`/api/crowd?parkId=${parkId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

// Compute per-DOW avg wait from historical data
function dowAvgFromData(data, parkId, dow) {
  const typicalDow = TYPICAL_DOW[parkId] || TYPICAL_DOW.mk;
  const hours = data?.dowHourlyAvg?.[dow];
  const parkHours = hours
    ? hours.slice(PARK_OPEN, PARK_OPEN + HOUR_LABELS.length).filter(v => v != null)
    : [];
  if (parkHours.length >= 3) {
    return { value: Math.round(parkHours.reduce((s,v)=>s+v,0)/parkHours.length), isReal: true, readings: parkHours.length };
  }
  // Blend real + typical if we have some data but not much
  if (parkHours.length > 0) {
    const realAvg = parkHours.reduce((s,v)=>s+v,0)/parkHours.length;
    const blended = Math.round(realAvg * 0.6 + typicalDow[dow] * 0.4);
    return { value: blended, isReal: false, readings: parkHours.length, blended: true };
  }
  return { value: typicalDow[dow], isReal: false, readings: 0 };
}

// ── Forecast view — next 7 days ───────────────────────────────────────────────
function ForecastView({ data, parkId, todayDow, T, dark, accent, accentLight, accentDark }) {
  // Build forecast for next 7 days starting today
  const forecast = Array.from({ length: 7 }, (_, i) => {
    const dow     = (todayDow + i) % 7;
    const result  = dowAvgFromData(data, parkId, dow);
    const level   = getLevel(result.value);
    const date    = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = date.toLocaleDateString([], { month:"short", day:"numeric" });
    return { dow, i, dateStr, ...result, level };
  });

  const bestDay  = [...forecast].sort((a,b) => a.value - b.value)[0];
  const worstDay = [...forecast].sort((a,b) => b.value - a.value)[0];
  const totalReadings = forecast.reduce((s, f) => s + f.readings, 0);
  const confidence = totalReadings === 0 ? "low" : totalReadings < 20 ? "medium" : "high";

  const confidenceInfo = {
    low:    { label:"Based on typical patterns", color: T.textMuted },
    medium: { label:"Based on some real data",   color: dark ? "#fbbf24" : "#854d0e" },
    high:   { label:"Based on your real data",   color: dark ? "#4ade80" : "#15803d" },
  }[confidence];

  return (
    <>
      {/* Confidence badge */}
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:14, padding:"8px 12px", borderRadius:10, background: T.bg, border:`1px solid ${T.border}` }}>
        <div style={{ width:8, height:8, borderRadius:"50%", background: confidenceInfo.color, flexShrink:0 }} />
        <span style={{ color:confidenceInfo.color, fontSize:11, fontFamily:FONT, fontWeight:600 }}>{confidenceInfo.label}</span>
        {totalReadings > 0 && (
          <span style={{ color:T.textMuted, fontSize:10, fontFamily:FONT, marginLeft:"auto" }}>{totalReadings} data points</span>
        )}
      </div>

      {/* 7-day forecast cards */}
      <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:14 }}>
        {forecast.map((day, i) => {
          const isToday   = i === 0;
          const isBest    = day.dow === bestDay.dow && i === forecast.indexOf(bestDay);
          const isWorst   = day.dow === worstDay.dow && i === forecast.indexOf(worstDay);
          const bg        = crowdBg(day.value, dark);
          const color     = crowdColor(day.value, dark);

          return (
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:12,
              padding:"12px 14px", borderRadius:12,
              background: isToday ? bg : T.bg,
              border: isToday ? `1.5px solid ${color}` : `1px solid ${T.border}`,
              transition:"all 0.2s",
            }}>
              {/* Day + date */}
              <div style={{ minWidth:52 }}>
                <div style={{ color: isToday ? color : T.text, fontWeight: isToday ? 800 : 600, fontSize:14, fontFamily:FONT }}>
                  {isToday ? "Today" : DAYS_SHORT[day.dow]}
                </div>
                <div style={{ color:T.textMuted, fontSize:10, fontFamily:FONT }}>{day.dateStr}</div>
              </div>

              {/* Bar */}
              <div style={{ flex:1, height:8, borderRadius:4, background: dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)", overflow:"hidden" }}>
                <div style={{
                  width:`${Math.min(100, Math.round((day.value / 65) * 100))}%`,
                  height:"100%",
                  background: crowdColor(day.value, dark),
                  borderRadius:4,
                  opacity: day.isReal ? 1 : 0.55,
                  transition:"width 0.6s ease",
                }} />
              </div>

              {/* Level badge */}
              <div style={{
                minWidth:80, textAlign:"right",
                display:"flex", alignItems:"center", justifyContent:"flex-end", gap:5,
              }}>
                {(isBest || isWorst) && (
                  <span style={{ fontSize:11 }}>{isBest ? "⭐" : "⚠️"}</span>
                )}
                <span style={{
                  background: bg,
                  color,
                  borderRadius:20, padding:"3px 10px",
                  fontSize:11, fontWeight:700, fontFamily:FONT,
                  border:`1px solid ${color}44`,
                  opacity: day.isReal ? 1 : 0.8,
                }}>
                  {day.level.icon} {day.level.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Best / worst callout */}
      <div style={{ display:"flex", gap:8 }}>
        <div style={{ flex:1, padding:"10px 12px", borderRadius:12, background:dark?"#052e16":"#dcfce7", border:`1px solid ${dark?"#166534":"#86efac"}` }}>
          <div style={{ color:dark?"#4ade80":"#15803d", fontWeight:700, fontSize:12, fontFamily:FONT, marginBottom:2 }}>
            ⭐ Best day
          </div>
          <div style={{ color:dark?"#86efac":"#166534", fontWeight:800, fontSize:15, fontFamily:FONT }}>{bestDay.i===0?"Today":DAYS_FULL[bestDay.dow]}</div>
          <div style={{ color:dark?"#4ade80":"#15803d", fontSize:11, fontFamily:FONT }}>~{bestDay.value}m avg wait</div>
        </div>
        <div style={{ flex:1, padding:"10px 12px", borderRadius:12, background:dark?"#3b0a0a":"#fee2e2", border:`1px solid ${dark?"#7f1d1d":"#fecaca"}` }}>
          <div style={{ color:dark?"#f87171":"#991b1b", fontWeight:700, fontSize:12, fontFamily:FONT, marginBottom:2 }}>
            ⚠️ Busiest day
          </div>
          <div style={{ color:dark?"#fca5a5":"#7f1d1d", fontWeight:800, fontSize:15, fontFamily:FONT }}>{worstDay.i===0?"Today":DAYS_FULL[worstDay.dow]}</div>
          <div style={{ color:dark?"#f87171":"#991b1b", fontSize:11, fontFamily:FONT }}>~{worstDay.value}m avg wait</div>
        </div>
      </div>

      {totalReadings === 0 && (
        <div style={{ color:T.textMuted, fontSize:10, fontFamily:FONT, marginTop:10, textAlign:"center" }}>
          Predictions improve as real data is collected over time.
        </div>
      )}
    </>
  );
}

// ── Hourly chart ──────────────────────────────────────────────────────────────
function HourlyChart({ data, parkId, selectedDow, setSelectedDow, todayDow, T, dark, accent, accentLight, accentDark }) {
  const typical  = TYPICAL_HOURLY[parkId] || TYPICAL_HOURLY.mk;
  const dowData  = data?.dowHourlyAvg?.[selectedDow];
  const allData  = data?.hourlyAvg;

  const merged = HOUR_LABELS.map((_, i) => {
    const hod  = PARK_OPEN + i;
    const real = dowData?.[hod] ?? allData?.[hod];
    return { value: real ?? typical[i], isReal: real != null };
  });

  const W = 320, H = 90;
  const PAD = { top:8, right:8, bottom:22, left:32 };
  const INNER_W = W - PAD.left - PAD.right;
  const INNER_H = H - PAD.top - PAD.bottom;
  const max    = Math.max(...merged.map(m => m.value), 10);
  const barW   = INNER_W / HOUR_LABELS.length;
  const gap    = barW * 0.18;
  const nowET  = getETHour();
  const nowIdx = nowET - PARK_OPEN;
  const inPark = selectedDow === todayDow && nowIdx >= 0 && nowIdx < HOUR_LABELS.length;
  const xLabels = HOUR_LABELS.map((l, i) => i % 2 === 0 ? l.replace("am","").replace("pm","") : "");
  const realCount = merged.filter(m => m.isReal).length;
  const best3 = [...merged].map((m,i)=>({...m,i,label:HOUR_LABELS[i]})).sort((a,b)=>a.value-b.value).slice(0,3);
  const worst = [...merged].sort((a,b)=>b.value-a.value)[0];

  return (
    <>
      {/* Day selector */}
      <div style={{ display:"flex", gap:4, marginBottom:10, overflowX:"auto" }}>
        {DAYS_SHORT.map((d, i) => {
          const hasDow     = data?.dowHourlyAvg?.[i]?.some(v => v != null);
          const isToday    = i === todayDow;
          const isSelected = i === selectedDow;
          return (
            <button key={i} onClick={() => setSelectedDow(i)} style={{
              flex:"0 0 auto", padding:"4px 9px", borderRadius:8,
              border: isSelected ? `1.5px solid ${accent}` : `1px solid ${T.border}`,
              background: isSelected ? accent : T.bg,
              color: isSelected ? "#fff" : isToday ? accent : T.textSub,
              fontFamily:FONT, fontWeight: isSelected||isToday ? 700 : 400,
              fontSize:11, cursor:"pointer", position:"relative",
            }}>
              {d}
              {hasDow && !isSelected && <span style={{ position:"absolute",top:2,right:2,width:4,height:4,borderRadius:"50%",background:accent }} />}
            </button>
          );
        })}
      </div>
      <div style={{ color:T.textMuted, fontSize:10, fontFamily:FONT, marginBottom:8 }}>
        {realCount > 0 ? `${realCount}h real data · ${DAYS_FULL[selectedDow]}` : `Typical pattern · ${DAYS_FULL[selectedDow]}`}
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:"visible", marginBottom:4 }}>
        {[0.25,0.5,0.75,1].map(pct => {
          const y = PAD.top + INNER_H*(1-pct);
          return (
            <g key={pct}>
              <line x1={PAD.left} x2={W-PAD.right} y1={y} y2={y} stroke={T.border} strokeWidth={1} />
              <text x={PAD.left-4} y={y+3} textAnchor="end" fill={T.textMuted} fontSize={7} fontFamily={FONT}>{Math.round(max*pct)}m</text>
            </g>
          );
        })}
        {merged.map(({ value, isReal }, i) => {
          const bh = Math.max(3, (value/max)*INNER_H);
          const x  = PAD.left + i*barW + gap/2;
          const y  = PAD.top + INNER_H - bh;
          const isCurrent = inPark && i===nowIdx;
          const isBest    = best3.some(b=>b.i===i);
          const fill = crowdColor(value, dark) + (isReal ? "" : "55");
          return (
            <g key={i}>
              {isCurrent && <rect x={x-1} y={PAD.top} width={barW-gap+2} height={INNER_H} fill={accent+(dark?"20":"12")} rx={3} />}
              <rect x={x} y={y} width={barW-gap} height={bh} fill={fill} rx={3} />
              {isBest && <text x={x+(barW-gap)/2} y={y-3} textAnchor="middle" fontSize={8} fill={accent}>★</text>}
              <text x={x+(barW-gap)/2} y={H-2} textAnchor="middle" fontSize={7}
                fill={isCurrent?T.text:T.textMuted} fontFamily={FONT} fontWeight={isCurrent?"700":"400"}>
                {xLabels[i]}
              </text>
            </g>
          );
        })}
        {inPark && <line x1={PAD.left+nowIdx*barW+barW/2} x2={PAD.left+nowIdx*barW+barW/2} y1={PAD.top} y2={PAD.top+INNER_H} stroke={accent} strokeWidth={1.5} strokeDasharray="3,2" opacity={0.6} />}
      </svg>

      <div style={{ color:T.textSub, fontSize:11, fontFamily:FONT, fontWeight:600, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>★ Best times</div>
      <div style={{ display:"flex", gap:6, marginBottom:12 }}>
        {best3.map((b, i) => (
          <div key={i} style={{ flex:1, background:dark?accentDark:accentLight, borderRadius:10, padding:"8px", textAlign:"center", border:`1px solid ${accent}22` }}>
            <div style={{ color:accent, fontSize:12, fontWeight:700, fontFamily:FONT }}>{b.label}</div>
            <div style={{ color:T.textSub, fontSize:10, fontFamily:FONT }}>{getLevel(b.value).label}</div>
            <div style={{ color:T.textMuted, fontSize:10, fontFamily:FONT }}>~{b.value}m avg</div>
          </div>
        ))}
      </div>
      <div style={{ background:dark?"#3b0a0a":"#fee2e2", borderRadius:10, padding:"8px 12px", border:`1px solid ${dark?"#7f1d1d":"#fecaca"}` }}>
        <span style={{ color:dark?"#f87171":"#991b1b", fontSize:11, fontFamily:FONT, fontWeight:600 }}>
          ⚠️ Avoid {worst.label} — typically {getLevel(worst.value).label.toLowerCase()} (~{worst.value}m avg)
        </span>
      </div>
    </>
  );
}

// ── Day-of-week comparison chart ──────────────────────────────────────────────
function DayChart({ data, parkId, todayDow, T, dark, accent, accentLight, accentDark }) {
  const dowAvgs = DAYS_SHORT.map((_, dow) => dowAvgFromData(data, parkId, dow));
  const W = 280, H = 100;
  const PAD = { top:10, right:8, bottom:28, left:32 };
  const INNER_W = W - PAD.left - PAD.right;
  const INNER_H = H - PAD.top - PAD.bottom;
  const max  = Math.max(...dowAvgs.map(d=>d.value), 10);
  const barW = INNER_W / 7;
  const gap  = barW * 0.22;
  const ranked   = dowAvgs.map((d,i)=>({...d,dow:i})).sort((a,b)=>a.value-b.value);
  const bestDow  = ranked[0].dow;
  const worstDow = ranked[ranked.length-1].dow;
  const realCount = dowAvgs.filter(d=>d.isReal).length;

  return (
    <>
      <div style={{ color:T.textMuted, fontSize:10, fontFamily:FONT, marginBottom:12 }}>
        {realCount > 0 ? `${realCount} days with real data` : "Typical patterns — real data builds over time"}
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:"visible", marginBottom:8 }}>
        {[0.25,0.5,0.75,1].map(pct => {
          const y = PAD.top + INNER_H*(1-pct);
          return (
            <g key={pct}>
              <line x1={PAD.left} x2={W-PAD.right} y1={y} y2={y} stroke={T.border} strokeWidth={1} />
              <text x={PAD.left-4} y={y+3} textAnchor="end" fill={T.textMuted} fontSize={7} fontFamily={FONT}>{Math.round(max*pct)}m</text>
            </g>
          );
        })}
        {dowAvgs.map(({ value, isReal }, dow) => {
          const bh      = Math.max(4, (value/max)*INNER_H);
          const x       = PAD.left + dow*barW + gap/2;
          const y       = PAD.top + INNER_H - bh;
          const isToday = dow === todayDow;
          const fill    = crowdColor(value, dark) + (isReal ? "" : "55");
          return (
            <g key={dow}>
              {isToday && <rect x={x-1} y={PAD.top} width={barW-gap+2} height={INNER_H} fill={accent+(dark?"20":"12")} rx={3} />}
              <rect x={x} y={y} width={barW-gap} height={bh} fill={isToday?accent:fill} rx={3} />
              {dow===bestDow  && <text x={x+(barW-gap)/2} y={y-3} textAnchor="middle" fontSize={9} fill={dark?"#4ade80":"#15803d"}>★</text>}
              {dow===worstDow && <text x={x+(barW-gap)/2} y={y-3} textAnchor="middle" fontSize={9} fill={dark?"#f87171":"#991b1b"}>!</text>}
              <text x={x+(barW-gap)/2} y={H-10} textAnchor="middle" fontSize={8}
                fill={isToday?accent:T.textSub} fontFamily={FONT} fontWeight={isToday?"700":"500"}>
                {DAYS_SHORT[dow]}
              </text>
              <text x={x+(barW-gap)/2} y={H-1} textAnchor="middle" fontSize={7} fill={T.textMuted} fontFamily={FONT}>
                {getLevel(value).label[0]}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ color:T.textSub, fontSize:11, fontFamily:FONT, fontWeight:600, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Best days to visit</div>
      <div style={{ display:"flex", gap:6, marginBottom:12 }}>
        {ranked.slice(0,3).map((d, i) => (
          <div key={i} style={{ flex:1, background:dark?accentDark:accentLight, borderRadius:10, padding:"8px", textAlign:"center", border:`1px solid ${accent}22` }}>
            <div style={{ color:accent, fontSize:13, fontWeight:800, fontFamily:FONT }}>{DAYS_SHORT[d.dow]}</div>
            <div style={{ color:T.textSub, fontSize:10, fontFamily:FONT }}>{getLevel(d.value).label}</div>
            <div style={{ color:T.textMuted, fontSize:10, fontFamily:FONT }}>~{d.value}m avg</div>
          </div>
        ))}
      </div>
      <div style={{ background:dark?"#3b0a0a":"#fee2e2", borderRadius:10, padding:"8px 12px", border:`1px solid ${dark?"#7f1d1d":"#fecaca"}` }}>
        <span style={{ color:dark?"#f87171":"#991b1b", fontSize:11, fontFamily:FONT, fontWeight:600 }}>
          ⚠️ Busiest: {DAYS_FULL[worstDow]} — typically {getLevel(dowAvgs[worstDow].value).label.toLowerCase()} (~{dowAvgs[worstDow].value}m avg wait)
        </span>
      </div>
    </>
  );
}

// ── Main CrowdTrend component ─────────────────────────────────────────────────
export default function CrowdTrend({ parkId, accent, accentLight, accentDark, T, dark }) {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState(false);
  const [view, setView]           = useState("forecast");
  const [selectedDow, setSelectedDow] = useState(getETDay());
  const todayDow = getETDay();

  useEffect(() => {
    setLoading(true);
    setData(null);
    fetchCrowdData(parkId).then(d => { setData(d); setLoading(false); });
  }, [parkId]);

  // Compute today's crowd level for the collapsed summary
  const todayData = dowAvgFromData(data, parkId, todayDow);
  const todayLevel = getLevel(todayData.value);
  const todayColor = crowdColor(todayData.value, dark);
  const todayBg    = crowdBg(todayData.value, dark);

  const VIEWS = [
    { id:"forecast", label:"7-Day" },
    { id:"day",      label:"By Day" },
    { id:"hour",     label:"By Hour" },
  ];

  return (
    <div style={{ background:T.surface, borderRadius:16, border:`1px solid ${T.border}`, marginBottom:14, overflow:"hidden" }}>
      {/* Header row — always visible, tap to expand/collapse */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", cursor:"pointer" }}
      >
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ color:T.text, fontWeight:700, fontSize:14, fontFamily:FONT }}>📊 Crowd Forecast</span>
          {!loading && (
            <span style={{
              background: todayBg,
              color: todayColor,
              borderRadius:20, padding:"3px 10px",
              fontSize:11, fontWeight:700, fontFamily:FONT,
              border:`1px solid ${todayColor}44`,
            }}>
              {todayLevel.icon} Today: {todayLevel.label}
            </span>
          )}
          {loading && <span style={{ color:T.textMuted, fontSize:11, fontFamily:FONT }}>Loading…</span>}
        </div>
        <span style={{ color:T.textMuted, fontSize:16, lineHeight:1 }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding:"0 16px 16px" }}>
          {/* View toggle */}
          <div style={{ display:"flex", gap:4, marginBottom:14, background:T.bg, borderRadius:10, padding:3 }}>
            {VIEWS.map(v => (
              <button key={v.id} onClick={() => setView(v.id)} style={{
                flex:1, padding:"6px 0", borderRadius:8, border:"none",
                background: view===v.id ? T.surface : "transparent",
                color: view===v.id ? T.text : T.textMuted,
                fontFamily:FONT, fontWeight: view===v.id ? 700 : 400,
                fontSize:12, cursor:"pointer",
                boxShadow: view===v.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                transition:"all 0.15s",
              }}>{v.label}</button>
            ))}
          </div>

          {/* Level legend */}
          <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
            {LEVELS.map((l, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:4 }}>
                <span style={{ fontSize:10 }}>{l.icon}</span>
                <span style={{ color:T.textMuted, fontSize:10, fontFamily:FONT }}>{l.label}</span>
              </div>
            ))}
            <div style={{ display:"flex", alignItems:"center", gap:4, marginLeft:"auto" }}>
              <div style={{ width:8, height:8, borderRadius:2, background:T.textMuted, opacity:0.3 }} />
              <span style={{ color:T.textMuted, fontSize:10, fontFamily:FONT }}>Estimated</span>
            </div>
          </div>

          {!loading && view === "forecast" && (
            <ForecastView data={data} parkId={parkId} todayDow={todayDow} T={T} dark={dark} accent={accent} accentLight={accentLight} accentDark={accentDark} />
          )}
          {!loading && view === "day" && (
            <DayChart data={data} parkId={parkId} todayDow={todayDow} T={T} dark={dark} accent={accent} accentLight={accentLight} accentDark={accentDark} />
          )}
          {!loading && view === "hour" && (
            <HourlyChart data={data} parkId={parkId} selectedDow={selectedDow} setSelectedDow={setSelectedDow} todayDow={todayDow} T={T} dark={dark} accent={accent} accentLight={accentLight} accentDark={accentDark} />
          )}
        </div>
      )}
    </div>
  );
}
