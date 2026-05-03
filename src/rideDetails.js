// rideDetails.js
// Static ride metadata: height requirements and accessibility info
// Keyed by lowercase partial name match

export const RIDE_DETAILS = {
  // ── Magic Kingdom ─────────────────────────────────────────────────────────
  "seven dwarfs mine train":      { height: 38, a11y: ["Must Transfer", "No Loose Articles"] },
  "space mountain":               { height: 44, a11y: ["Must Transfer", "No Loose Articles"] },
  "big thunder mountain":         { height: 38, a11y: ["Must Transfer"] },
  "splash mountain":              { height: 40, a11y: ["Must Transfer", "May Remain in Wheelchair"] },
  "tron lightcycle":              { height: 48, a11y: ["Must Transfer", "No Loose Articles"] },
  "barnstormer":                  { height: 35, a11y: ["Must Transfer"] },
  "magic carpets":                { height: null, a11y: ["May Remain in Wheelchair"] },
  "dumbo":                        { height: null, a11y: ["May Remain in Wheelchair"] },
  "haunted mansion":              { height: null, a11y: ["Must Transfer", "May Remain in ECV"] },
  "pirates of the caribbean":     { height: null, a11y: ["May Remain in Wheelchair"] },
  "peter pan":                    { height: null, a11y: ["Must Transfer"] },
  "little mermaid":               { height: null, a11y: ["May Remain in Wheelchair"] },
  "buzz lightyear":               { height: null, a11y: ["May Remain in Wheelchair"] },
  "tomorrowland speedway":        { height: 54, a11y: ["Must Transfer"] },
  "people mover":                 { height: null, a11y: ["May Remain in Wheelchair"] },
  "astro orbiter":                { height: null, a11y: ["Must Transfer"] },
  "mad tea party":                { height: null, a11y: ["May Remain in Wheelchair"] },
  "it's a small world":           { height: null, a11y: ["May Remain in Wheelchair"] },
  "small world":                  { height: null, a11y: ["May Remain in Wheelchair"] },
  "jungle cruise":                { height: null, a11y: ["May Remain in Wheelchair"] },
  "swiss family treehouse":       { height: null, a11y: [] },
  "walt disney world railroad":   { height: null, a11y: ["May Remain in Wheelchair"] },
  "liberty square riverboat":     { height: null, a11y: ["May Remain in Wheelchair"] },
  "hall of presidents":           { height: null, a11y: ["May Remain in Wheelchair"] },
  "country bear":                 { height: null, a11y: ["May Remain in Wheelchair"] },
  "enchanted tiki room":          { height: null, a11y: ["May Remain in Wheelchair"] },
  "monsters inc":                 { height: null, a11y: ["May Remain in Wheelchair"] },
  "prince charming regal":        { height: null, a11y: ["May Remain in Wheelchair"] },
  "casey jr":                     { height: null, a11y: ["May Remain in Wheelchair"] },
  "main street vehicles":         { height: null, a11y: ["May Remain in Wheelchair"] },

  // ── EPCOT ─────────────────────────────────────────────────────────────────
  "guardians of the galaxy":      { height: 42, a11y: ["Must Transfer", "No Loose Articles"] },
  "test track":                   { height: 40, a11y: ["Must Transfer"] },
  "frozen ever after":            { height: null, a11y: ["May Remain in Wheelchair"] },
  "remy":                         { height: null, a11y: ["May Remain in Wheelchair"] },
  "ratatouille":                  { height: null, a11y: ["May Remain in Wheelchair"] },
  "soarin":                       { height: 40, a11y: ["Must Transfer"] },
  "living with the land":         { height: null, a11y: ["May Remain in Wheelchair"] },
  "spaceship earth":              { height: null, a11y: ["May Remain in Wheelchair"] },
  "turtle talk":                  { height: null, a11y: ["May Remain in Wheelchair"] },
  "journey into imagination":     { height: null, a11y: ["May Remain in Wheelchair"] },
  "seas with nemo":               { height: null, a11y: ["May Remain in Wheelchair"] },
  "gran fiesta tour":             { height: null, a11y: ["May Remain in Wheelchair"] },
  "reflections of china":         { height: null, a11y: ["May Remain in Wheelchair"] },
  "impressions de france":        { height: null, a11y: ["May Remain in Wheelchair"] },
  "o canada":                     { height: null, a11y: ["May Remain in Wheelchair"] },

  // ── Hollywood Studios ─────────────────────────────────────────────────────
  "rise of the resistance":       { height: 40, a11y: ["Must Transfer"] },
  "millennium falcon":            { height: 38, a11y: ["Must Transfer"] },
  "smugglers run":                { height: 38, a11y: ["Must Transfer"] },
  "tower of terror":              { height: 40, a11y: ["Must Transfer"] },
  "rock 'n' roller coaster":      { height: 48, a11y: ["Must Transfer", "No Loose Articles"] },
  "rock n roller":                { height: 48, a11y: ["Must Transfer", "No Loose Articles"] },
  "slinky dog":                   { height: 38, a11y: ["Must Transfer"] },
  "toy story mania":              { height: null, a11y: ["May Remain in Wheelchair"] },
  "runaway railway":              { height: null, a11y: ["May Remain in Wheelchair"] },
  "alien swirling":               { height: null, a11y: ["May Remain in Wheelchair"] },
  "star tours":                   { height: 40, a11y: ["Must Transfer"] },
  "indiana jones":                { height: null, a11y: ["May Remain in Wheelchair"] },

  // ── Animal Kingdom ────────────────────────────────────────────────────────
  "flight of passage":            { height: 44, a11y: ["Must Transfer"] },
  "na'vi river":                  { height: null, a11y: ["May Remain in Wheelchair"] },
  "navi river":                   { height: null, a11y: ["May Remain in Wheelchair"] },
  "expedition everest":           { height: 44, a11y: ["Must Transfer", "No Loose Articles"] },
  "kilimanjaro safaris":          { height: null, a11y: ["May Remain in Wheelchair"] },
  "dinosaur":                     { height: 40, a11y: ["Must Transfer"] },
  "kali river rapids":            { height: 38, a11y: ["Must Transfer"] },
  "triceratop spin":              { height: null, a11y: ["May Remain in Wheelchair"] },
  "it's tough to be a bug":       { height: null, a11y: ["May Remain in Wheelchair"] },
  "tough to be a bug":            { height: null, a11y: ["May Remain in Wheelchair"] },
  "wildlife express":             { height: null, a11y: ["May Remain in Wheelchair"] },
  "gorilla falls":                { height: null, a11y: ["May Remain in Wheelchair"] },
  "maharajah jungle trek":        { height: null, a11y: ["May Remain in Wheelchair"] },
};

// Look up ride details by name — returns { height, a11y } or null
export function getRideDetails(name) {
  const n = name.toLowerCase();
  for (const [key, details] of Object.entries(RIDE_DETAILS)) {
    if (n.includes(key)) return details;
  }
  return null;
}

// Format height requirement
export function fmtHeight(inches) {
  if (!inches) return null;
  const feet = Math.floor(inches / 12);
  const remaining = inches % 12;
  return `${feet}'${remaining}" (${inches}")`;
}
