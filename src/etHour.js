// etHour.js — shared utility to get the current hour in US Eastern Time
// Handles both EST (UTC-5) and EDT (UTC-4) automatically

export function getETHour(date = new Date()) {
  return parseInt(
    date.toLocaleString("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      hour12: false,
    }),
    10
  );
}

export function getETDay(date = new Date()) {
  return new Date(
    date.toLocaleString("en-US", { timeZone: "America/New_York" })
  ).getDay();
}
