// TrendChart.jsx
// Inline SVG bar chart showing typical + real wait time trends across the day.

import { HOUR_LABELS, PARK_OPEN_HOUR, mergeWithTypical, bestHours } from "./trends.js";

const W = 320;
const H = 90;
const PAD = { top: 8, right: 8, bottom: 20, left: 28 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;

function barColor(wait, isReal) {
  const base =
    wait < 20 ? "#27ae60" :
    wait < 40 ? "#f39c12" :
    wait < 60 ? "#e67e22" : "#e74c3c";
  return isReal ? base : base + "66"; // translucent for estimated bars
}

export default function TrendChart({ hourlyAvg, thrillLevel, accent, currentWait }) {
  const { merged, realMask } = mergeWithTypical(hourlyAvg, thrillLevel);
  const best = bestHours(merged);
  const max = Math.max(...merged, 10);

  // Current hour index in our chart (0 = 9am)
  const nowET = ((new Date().getUTCHours() - 5) + 24) % 24;
  const nowIdx = nowET - PARK_OPEN_HOUR;
  const inPark = nowIdx >= 0 && nowIdx < HOUR_LABELS.length;

  const barW = INNER_W / HOUR_LABELS.length;
  const gap  = barW * 0.18;

  // X-axis labels: show every other hour to avoid crowding
  const xLabels = HOUR_LABELS.map((l, i) => (i % 2 === 0 ? l.replace("am","").replace("pm","") : ""));

  const realCount = realMask.filter(Boolean).length;

  return (
    <div style={{ marginTop: 12 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: 1 }}>
          Wait Trend — Today
        </span>
        <span style={{ fontSize: 10, fontFamily: "sans-serif", color: "rgba(255,255,255,0.25)" }}>
          {realCount > 0 ? `${realCount}h real data` : "estimated"}
        </span>
      </div>

      {/* SVG chart */}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        {/* Y-axis gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map(pct => {
          const y = PAD.top + INNER_H * (1 - pct);
          const val = Math.round(max * pct);
          return (
            <g key={pct}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y}
                stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
              {pct > 0 && (
                <text x={PAD.left - 4} y={y + 3} textAnchor="end"
                  fill="rgba(255,255,255,0.2)" fontSize={7} fontFamily="monospace">
                  {val}
                </text>
              )}
            </g>
          );
        })}

        {/* Bars */}
        {merged.map((wait, i) => {
          const bh = Math.max(2, (wait / max) * INNER_H);
          const x  = PAD.left + i * barW + gap / 2;
          const y  = PAD.top + INNER_H - bh;
          const isCurrent = inPark && i === nowIdx;
          const isBest = best.some(b => b.i === i);

          return (
            <g key={i}>
              {/* Bar */}
              <rect
                x={x} y={y} width={barW - gap} height={bh}
                fill={isCurrent && currentWait != null
                  ? barColor(currentWait, true)
                  : barColor(wait, realMask[i])}
                rx={2}
                opacity={isCurrent ? 1 : 0.85}
              />
              {/* Current time indicator */}
              {isCurrent && (
                <rect x={x} y={PAD.top} width={barW - gap} height={INNER_H}
                  fill="rgba(255,255,255,0.04)" rx={2} />
              )}
              {/* Best time star */}
              {isBest && (
                <text x={x + (barW - gap) / 2} y={y - 3}
                  textAnchor="middle" fontSize={7} fill={accent}>★</text>
              )}
              {/* X label */}
              <text x={x + (barW - gap) / 2} y={H - 3}
                textAnchor="middle" fontSize={7}
                fill={isCurrent ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)"}
                fontFamily="sans-serif">
                {xLabels[i]}
              </text>
            </g>
          );
        })}

        {/* "Now" line */}
        {inPark && (
          <line
            x1={PAD.left + nowIdx * barW + (barW - gap) / 2 + gap / 2}
            x2={PAD.left + nowIdx * barW + (barW - gap) / 2 + gap / 2}
            y1={PAD.top} y2={PAD.top + INNER_H}
            stroke="rgba(255,255,255,0.3)" strokeWidth={1} strokeDasharray="2,2"
          />
        )}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: "#27ae60" }} />
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "sans-serif" }}>Real data</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: "#27ae60", opacity: 0.4 }} />
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "sans-serif" }}>Estimated</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 10, color: accent }}>★</span>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "sans-serif" }}>Best time</span>
        </div>
      </div>

      {/* Best hours summary */}
      <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
        {best.map((b, i) => (
          <div key={i} style={{
            flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 8,
            padding: "6px 8px", textAlign: "center",
            border: `1px solid ${accent}33`,
          }}>
            <div style={{ color: accent, fontSize: 11, fontWeight: 700, fontFamily: "monospace" }}>{b.label}</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "sans-serif" }}>~{b.wait}m</div>
          </div>
        ))}
      </div>

      {realCount === 0 && (
        <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, fontFamily: "sans-serif", marginTop: 8, fontStyle: "italic" }}>
          Showing typical patterns. Real data builds with each visit.
        </div>
      )}
    </div>
  );
}
