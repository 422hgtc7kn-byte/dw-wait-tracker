// trends.js
// Typical intra-day wait time multipliers for Disney World, by ride thrill level.
// Based on publicly available crowd pattern research and enthusiast data.
// Index 0 = 9am, index 1 = 10am … index 13 = 10pm (park close)
// Values are multipliers × the ride's "moderate" base wait.

// Park hours 9am–10pm = 14 hours
export const PARK_OPEN_HOUR = 9;   // 9am ET
export const PARK_CLOSE_HOUR = 22; // 10pm ET
export const HOUR_LABELS = ["9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm","6pm","7pm","8pm","9pm","10pm"];

// Crowd multipliers by thrill level across the operating day
// Source: synthesised from Touringplans, WDW Magic, and Disney Food Blog crowd patterns
const CURVES = {
  high: [
    0.45, // 9am  - rope drop rush, then settles
    0.90, // 10am - building fast
    1.25, // 11am - peak begins
    1.45, // 12pm - lunch crowd adds to queue
    1.50, // 1pm  - peak
    1.45, // 2pm  - slight dip, still heavy
    1.35, // 3pm  - parade draws some away
    1.20, // 4pm  - moderate
    1.05, // 5pm  - evening reprieve starts
    0.90, // 6pm  - dinner crowds leave
    0.80, // 7pm  - fireworks prep draws people out
    0.65, // 8pm  - lighter
    0.50, // 9pm  - late evening
    0.35, // 10pm - last hour
  ],
  medium: [
    0.35,
    0.65,
    1.00,
    1.25,
    1.35,
    1.30,
    1.20,
    1.10,
    0.95,
    0.85,
    0.75,
    0.60,
    0.45,
    0.30,
  ],
  low: [
    0.30,
    0.50,
    0.75,
    0.95,
    1.05,
    1.10,
    1.00,
    0.90,
    0.80,
    0.70,
    0.60,
    0.50,
    0.35,
    0.25,
  ],
};

// Typical base waits (minutes) by thrill level — used when no real data exists yet
const BASE_WAITS = { high: 65, medium: 40, low: 18 };

/**
 * Returns a 14-element array of typical wait minutes for a given thrill level.
 * Each element corresponds to one hour starting at PARK_OPEN_HOUR.
 */
export function typicalCurve(thrillLevel) {
  const curve = CURVES[thrillLevel] || CURVES.low;
  const base  = BASE_WAITS[thrillLevel] || BASE_WAITS.low;
  return curve.map(m => Math.round(base * m));
}

/**
 * Merge real historical hourly averages with the typical curve.
 * - Hours with real data: use real data
 * - Hours with no real data: use typical curve value
 * Returns { merged: number[], realMask: boolean[] }
 */
export function mergeWithTypical(hourlyAvg, thrillLevel) {
  const typical = typicalCurve(thrillLevel);
  const merged   = [];
  const realMask = [];

  for (let i = 0; i < HOUR_LABELS.length; i++) {
    const hour = PARK_OPEN_HOUR + i; // 9–22
    const real = hourlyAvg?.[hour];  // null if no data for this hour yet
    if (real != null) {
      merged.push(real);
      realMask.push(true);
    } else {
      merged.push(typical[i]);
      realMask.push(false);
    }
  }
  return { merged, realMask };
}

/**
 * Given the merged curve, return the top 3 best hours to ride.
 */
export function bestHours(merged) {
  return HOUR_LABELS
    .map((label, i) => ({ label, wait: merged[i], i }))
    .sort((a, b) => a.wait - b.wait)
    .slice(0, 3);
}
