import { useState, useEffect } from "react";

const FONT = "'Inter', sans-serif";
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const PARK_OPEN = 9;
const HOUR_LABELS = ["9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm","6pm","7pm","8pm","9pm","10pm"];

// Typical crowd curves per park (avg wait in minutes across the day)
// Derived from publicly known Disney crowd patterns
const TYPICAL = {
  mk: [18, 32, 48, 58, 62, 60, 54, 48, 42, 36, 30, 24, 18, 12],
  ep: [14, 24, 38, 48, 52, 50, 46, 40, 34, 28, 22, 18, 12, 8],
  hs: [20, 36, 52, 62, 65, 63, 56, 50, 44, 36, 28, 22, 15, 10],
  ak: [16, 28, 42, 50, 52, 48, 40, 32, 24, 18, 12, 8, 5, 4],
};

const W = 320, H = 90;
const PAD = { top: 8, right: 8, bottom: 22, left: 32 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;

function crowdColor(avg, dark) {
  if (avg < 20) return dark ? "#4ade80" : "#22c55e";
  if (avg < 35) return dark ? "#fbbf24" : "#eab308";
  if (avg < 50) return dark ? "#fb923c" : "#f97316";
  return dark ? "#f87171" : "#ef4444";
}

function crowdLabel(avg) {
  if (avg < 20) return "Low";
  if (avg < 35) return "Moderate";
  if (avg < 50) return "High";
  return "Peak";
}

async function fetchCrowdData(parkId) {
  try {
    const res = await fetch(`/api/crowd?parkId=${parkId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

export default function CrowdTrend({ parkId, accent, accentLight, accentDark, T, dark }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDow, setSelectedDow] = useState(new Date().getDay());

  useEffect(() => {
    setLoading(true);
    fetchCrowdData(parkId).then(d => { setData(d); setLoading(false); });
  }, [parkId]);

  const todayDow  = new Date().getDay();
  const typical   = TYPICAL[parkId] || TYPICAL.mk;

  // Pick data source: per-DOW real data if available, else all-days avg, else typical
  const dowData   = data?.dowHourlyAvg?.[selectedDow];
  const allData   = data?.hourlyAvg;

  // Build merged array: real data where available, typical otherwise
  const merged = HOUR_LABELS.map((_, i) => {
    const hod  = PARK_OPEN + i;
    const real = dowData?.[hod] ?? allData?.[hod];
    return { value: real ?? typical[i], isReal: real != null };
  });

  const max       = Math.max(...merged.map(m => m.value), 10);
  const barW      = INNER_W / HOUR_LABELS.length;
  const gap       = barW * 0.18;
  const nowET     = ((new Date().getUTCHours() - 5) + 24) % 24;
  const nowIdx    = nowET - PARK_OPEN;
  const inPark    = selectedDow === todayDow && nowIdx >= 0 && nowIdx < HOUR_LABELS.length;
  const xLabels   = HOUR_LABELS.map((l, i) => i % 2 === 0 ? l.replace("am","").replace("pm","") : "");
  const realCount = merged.filter(m => m.isReal).length;

  // Best 3 hours (lowest crowd)
  const best3 = [...merged]
    .map((m, i) => ({ ...m, i, label: HOUR_LABELS[i] }))
    .sort((a, b) => a.value - b.value)
    .slice(0, 3);

  // Worst hour for context
  const worst = [...merged].sort((a, b) => b.value - a.value)[0];

  return (
    <div style={{ ...( { background: T.surface, borderRadius: 16, border: `1px solid ${T.border}` }), padding: "16px", marginBottom: 14 }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <div>
          <div style={{ color:T.text, fontWeight:700, fontSize:14, fontFamily:FONT }}>📊 Crowd Trend</div>
          <div style={{ color:T.textMuted, fontSize:10, fontFamily:FONT, marginTop:1 }}>
            {realCount > 0 ? `${realCount}h real data · ` : ""}{realCount === 0 ? "Typical patterns (real data builds over time)" : "Tap a day to compare"}
          </div>
        </div>
        {loading && <div style={{ color:T.textMuted, fontSize:11, fontFamily:FONT }}>Loading…</div>}
      </div>

      {/* Day selector */}
      <div style={{ display:"flex", gap:4, marginBottom:12, overflowX:"auto" }}>
        {DAYS.map((d, i) => {
          const hasDow    = data?.dowHourlyAvg?.[i]?.some(v => v != null);
          const isToday   = i === todayDow;
          const isSelected = i === selectedDow;
          return (
            <button key={i} onClick={() => setSelectedDow(i)} style={{
              flex:"0 0 auto", padding:"4px 9px", borderRadius:8,
              border: isSelected ? `1.5px solid ${accent}` : `1px solid ${T.border}`,
              background: isSelected ? accent : T.bg,
              color: isSelected ? "#fff" : isToday ? accent : T.textSub,
              fontFamily:FONT, fontWeight: isSelected || isToday ? 700 : 400,
              fontSize:11, cursor:"pointer", position:"relative",
            }}>
              {d}
              {hasDow && !isSelected && (
                <span style={{ position:"absolute", top:2, right:2, width:4, height:4, borderRadius:"50%", background:accent }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Bar chart */}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:"visible", marginBottom:4 }}>
        {/* Gridlines */}
        {[0.25, 0.5, 0.75, 1].map(pct => {
          const y = PAD.top + INNER_H * (1 - pct);
          return (
            <g key={pct}>
              <line x1={PAD.left} x2={W-PAD.right} y1={y} y2={y} stroke={T.border} strokeWidth={1} />
              <text x={PAD.left-4} y={y+3} textAnchor="end" fill={T.textMuted} fontSize={7} fontFamily={FONT}>
                {Math.round(max * pct)}m
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {merged.map(({ value, isReal }, i) => {
          const bh        = Math.max(3, (value / max) * INNER_H);
          const x         = PAD.left + i * barW + gap / 2;
          const y         = PAD.top + INNER_H - bh;
          const isCurrent = inPark && i === nowIdx;
          const isBest    = best3.some(b => b.i === i);
          const color     = crowdColor(value, dark);
          const fill      = isReal ? color : color + "55";

          return (
            <g key={i}>
              {isCurrent && <rect x={x-1} y={PAD.top} width={barW-gap+2} height={INNER_H} fill={accent+(dark?"20":"12")} rx={3} />}
              <rect x={x} y={y} width={barW-gap} height={bh} fill={fill} rx={3} />
              {isBest && <text x={x+(barW-gap)/2} y={y-3} textAnchor="middle" fontSize={8} fill={accent}>★</text>}
              <text x={x+(barW-gap)/2} y={H-2} textAnchor="middle" fontSize={7}
                fill={isCurrent ? T.text : T.textMuted} fontFamily={FONT} fontWeight={isCurrent?"700":"400"}>
                {xLabels[i]}
              </text>
            </g>
          );
        })}

        {/* Now line */}
        {inPark && (
          <line x1={PAD.left+nowIdx*barW+barW/2} x2={PAD.left+nowIdx*barW+barW/2}
            y1={PAD.top} y2={PAD.top+INNER_H}
            stroke={accent} strokeWidth={1.5} strokeDasharray="3,2" opacity={0.6} />
        )}
      </svg>

      {/* Legend */}
      <div style={{ display:"flex", gap:10, marginBottom:12, flexWrap:"wrap" }}>
        {[
          { color:"#22c55e", label:"Low (<20m avg)" },
          { color:"#eab308", label:"Moderate" },
          { color:"#f97316", label:"High" },
          { color:"#ef4444", label:"Peak" },
        ].map((item, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:4 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:item.color }} />
            <span style={{ color:T.textMuted, fontSize:10, fontFamily:FONT }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Best times */}
      <div style={{ color:T.textSub, fontSize:11, fontFamily:FONT, fontWeight:600, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>
        ★ Best times · {DAYS[selectedDow]}
      </div>
      <div style={{ display:"flex", gap:6, marginBottom:12 }}>
        {best3.map((b, i) => (
          <div key={i} style={{ flex:1, background:dark?accentDark:accentLight, borderRadius:10, padding:"8px", textAlign:"center", border:`1px solid ${accent}22` }}>
            <div style={{ color:accent, fontSize:12, fontWeight:700, fontFamily:FONT }}>{b.label}</div>
            <div style={{ color:T.textSub, fontSize:10, fontFamily:FONT }}>{crowdLabel(b.value)}</div>
            <div style={{ color:T.textMuted, fontSize:10, fontFamily:FONT }}>~{b.value}m avg</div>
          </div>
        ))}
      </div>

      {/* Avoid tip */}
      <div style={{ background:dark?"#3b0a0a":"#fee2e2", borderRadius:10, padding:"8px 12px", border:`1px solid ${dark?"#7f1d1d":"#fecaca"}` }}>
        <span style={{ color:dark?"#f87171":"#991b1b", fontSize:11, fontFamily:FONT, fontWeight:600 }}>
          ⚠️ Avoid {worst.label} — typically {crowdLabel(worst.value).toLowerCase()} (~{worst.value}m avg wait)
        </span>
      </div>
    </div>
  );
}
