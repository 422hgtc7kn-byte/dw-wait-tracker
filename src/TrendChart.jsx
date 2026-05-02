import { useState } from "react";
import { HOUR_LABELS, PARK_OPEN_HOUR, mergeWithTypical, bestHours } from "./trends.js";

const FONT = "'Inter', sans-serif";
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const W = 320, H = 96;
const PAD = { top: 10, right: 8, bottom: 22, left: 30 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;

function barColor(wait, isReal, dark) {
  const base = wait < 20 ? "#22c55e" : wait < 40 ? "#eab308" : wait < 60 ? "#f97316" : "#ef4444";
  return isReal ? base : base + (dark ? "55" : "66");
}

export default function TrendChart({ hourlyAvg, dowHourlyAvg, thrillLevel, accent, accentLight, currentWait, T, dark }) {
  const todayDow = new Date().getDay();
  const [selectedDow, setSelectedDow] = useState(todayDow);

  // Pick the right data source: per-DOW if available, else fall back to all-days avg
  const dowData   = dowHourlyAvg?.[selectedDow] ?? null;
  const sourceAvg = dowData?.some(v => v != null) ? dowData : hourlyAvg;

  const { merged, realMask } = mergeWithTypical(sourceAvg, thrillLevel);
  const best      = bestHours(merged);
  const max       = Math.max(...merged, 10);
  const barW      = INNER_W / HOUR_LABELS.length;
  const gap       = barW * 0.2;
  const nowET     = ((new Date().getUTCHours() - 5) + 24) % 24;
  const nowIdx    = nowET - PARK_OPEN_HOUR;
  const inPark    = selectedDow === todayDow && nowIdx >= 0 && nowIdx < HOUR_LABELS.length;
  const realCount = realMask.filter(Boolean).length;
  const xLabels   = HOUR_LABELS.map((l, i) => i % 2 === 0 ? l.replace("am","").replace("pm","") : "");

  return (
    <div style={{ marginTop: 14, background: T.chartBg, borderRadius: 12, padding: "12px 12px 8px", border: `1px solid ${T.border}` }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ color: T.textSub, fontSize: 11, fontFamily: FONT, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
          Wait Trend
        </span>
        <span style={{ fontSize: 10, fontFamily: FONT, color: T.textMuted }}>
          {realCount > 0 ? `${realCount}h real data` : "estimated"}
        </span>
      </div>

      {/* Day-of-week selector */}
      <div style={{ display: "flex", gap: 4, marginBottom: 10, overflowX: "auto" }}>
        {DAYS.map((d, i) => {
          const hasDowData = dowHourlyAvg?.[i]?.some(v => v != null);
          const isToday    = i === todayDow;
          const isSelected = i === selectedDow;
          return (
            <button key={i} onClick={() => setSelectedDow(i)} style={{
              flex: "0 0 auto",
              padding: "4px 9px",
              borderRadius: 8,
              border: isSelected ? `1.5px solid ${accent}` : `1px solid ${T.border}`,
              background: isSelected ? accent : T.surface,
              color: isSelected ? "#fff" : isToday ? accent : T.textSub,
              fontFamily: FONT, fontWeight: isSelected || isToday ? 700 : 400,
              fontSize: 11, cursor: "pointer", position: "relative",
            }}>
              {d}
              {hasDowData && !isSelected && (
                <span style={{ position: "absolute", top: 2, right: 2, width: 4, height: 4, borderRadius: "50%", background: accent }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        {[0.25, 0.5, 0.75, 1].map(pct => {
          const y = PAD.top + INNER_H * (1 - pct);
          return (
            <g key={pct}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke={T.border} strokeWidth={1} />
              <text x={PAD.left - 4} y={y + 3} textAnchor="end" fill={T.textMuted} fontSize={7} fontFamily={FONT}>
                {Math.round(max * pct)}
              </text>
            </g>
          );
        })}

        {merged.map((wait, i) => {
          const bh        = Math.max(3, (wait / max) * INNER_H);
          const x         = PAD.left + i * barW + gap / 2;
          const y         = PAD.top + INNER_H - bh;
          const isCurrent = inPark && i === nowIdx;
          const isBest    = best.some(b => b.i === i);
          const fill      = isCurrent && currentWait != null ? barColor(currentWait, true, dark) : barColor(wait, realMask[i], dark);
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

        {inPark && (
          <line x1={PAD.left+nowIdx*barW+barW/2} x2={PAD.left+nowIdx*barW+barW/2}
            y1={PAD.top} y2={PAD.top+INNER_H}
            stroke={accent} strokeWidth={1.5} strokeDasharray="3,2" opacity={0.6} />
        )}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
        {[
          { bg: "#22c55e",   label: "Real data" },
          { bg: "#22c55e55", label: "Estimated" },
          { icon: "★", color: accent, label: "Best time" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {item.icon ? <span style={{ fontSize: 10, color: item.color }}>{item.icon}</span>
              : <div style={{ width: 10, height: 10, borderRadius: 2, background: item.bg }} />}
            <span style={{ color: T.textMuted, fontSize: 10, fontFamily: FONT }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Best hours */}
      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        {best.map((b, i) => (
          <div key={i} style={{ flex: 1, background: accentLight, borderRadius: 10, padding: "7px 8px", textAlign: "center", border: `1px solid ${accent}22` }}>
            <div style={{ color: accent, fontSize: 12, fontWeight: 700, fontFamily: FONT }}>{b.label}</div>
            <div style={{ color: T.textSub, fontSize: 10, fontFamily: FONT }}>~{b.wait}m</div>
          </div>
        ))}
      </div>

      {realCount === 0 && (
        <div style={{ color: T.textMuted, fontSize: 10, fontFamily: FONT, marginTop: 8 }}>
          Showing typical patterns. Real data builds with each visit.
        </div>
      )}
    </div>
  );
}
