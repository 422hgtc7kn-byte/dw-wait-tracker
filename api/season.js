// api/season.js
// Shared utility — determines Disney World crowd season from an ET date.
// Import this in collect.js, crowd.js, and history.js.
//
// Seasons:
//   peak    — Christmas/New Year, Spring Break, 4th of July week
//   summer  — June, July, August (minus 4th of July peak week)
//   holiday — Halloween season (Sep 1–Oct 31), Thanksgiving week, Nov–Dec 14
//   value   — Everything else (Jan 6–Feb, early Sep lull, early Dec)

export function getSeason(etDate) {
  const m = etDate.getMonth() + 1; // 1-12
  const d = etDate.getDate();
  const md = m * 100 + d; // e.g. 1225 = Dec 25

  // Peak: Christmas/New Year (Dec 15 – Jan 5)
  if (md >= 1215 || md <= 105) return 'peak';

  // Peak: Spring Break (Mar 15 – Apr 15)
  if (md >= 315 && md <= 415) return 'peak';

  // Peak: 4th of July week (Jun 28 – Jul 7)
  if (md >= 628 && md <= 707) return 'peak';

  // Peak: Thanksgiving week (Wed before through Sun after — ~Nov 22-30 range)
  if (md >= 1122 && md <= 1130) return 'peak';

  // Summer: June (non-peak), July (non-peak), August
  if (m >= 6 && m <= 8) return 'summer';

  // Holiday: Halloween season Sep–Oct, post-Thanksgiving Nov, early Dec
  if (m === 9 || m === 10) return 'holiday';
  if (m === 11 && md < 1122) return 'holiday';
  if (md >= 1201 && md <= 1214) return 'holiday';

  // Value: Jan 6–Feb, Mar 1–14, Apr 16–May
  return 'value';
}

export const SEASONS = ['value', 'holiday', 'summer', 'peak'];

export const SEASON_LABELS = {
  value:   { label: 'Value',   icon: '🟢', tip: 'Jan–Feb, early Sep/Dec' },
  holiday: { label: 'Holiday', icon: '🟡', tip: 'Halloween, Nov, early Dec' },
  summer:  { label: 'Summer',  icon: '🟠', tip: 'June–August' },
  peak:    { label: 'Peak',    icon: '🔴', tip: 'Christmas, Spring Break, July 4th, Thanksgiving' },
};
