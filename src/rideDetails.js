// rideDetails.js
// Verified from Disney Rewards official accessibility guide (2025),
// MouseHacking height requirements (updated May 2026), and DISboards mobility info.
//
// a11y values:
//   "May Remain in Wheelchair" — stay in wheelchair/ECV on the ride
//   "ECV to Wheelchair"        — transfer from ECV to attraction wheelchair, then ride
//   "Must Transfer"            — transfer from wheelchair/ECV to ride vehicle
//   "Must Be Ambulatory"       — must walk; no wheelchair access at all
//   "No Loose Articles"        — must secure all items before boarding

export const RIDE_DETAILS = {

  // ── Magic Kingdom ──────────────────────────────────────────────────────────
  // Height requirements
  "barnstormer":                           { height: 35,   a11y: ["Must Transfer"] },
  "big thunder mountain":                  { height: 38,   a11y: ["Must Transfer"] },
  "seven dwarfs mine train":               { height: 38,   a11y: ["Must Transfer", "No Loose Articles"] },
  "tron lightcycle":                       { height: 48,   a11y: ["Must Transfer", "No Loose Articles"] },
  "space mountain":                        { height: 44,   a11y: ["Must Transfer", "No Loose Articles"] },
  "tiana's bayou adventure":               { height: 40,   a11y: ["Must Transfer"] },
  "splash mountain":                       { height: 40,   a11y: ["Must Transfer"] },
  "tomorrowland speedway":                 { height: 32,   a11y: ["Must Transfer"] }, // 32" to ride, 54" to drive alone
  "astro orbiter":                         { height: null, a11y: ["Must Transfer"] },
  "peter pan":                             { height: null, a11y: ["Must Transfer"] },
  "haunted mansion":                       { height: null, a11y: ["Must Transfer"] },
  "mad tea party":                         { height: null, a11y: ["Must Transfer"] },
  "dumbo the flying elephant":             { height: null, a11y: ["Must Transfer"] },

  // ECV must transfer to provided wheelchair (then to ride vehicle)
  "buzz lightyear":                        { height: null, a11y: ["ECV to Wheelchair"] },
  "it's a small world":                    { height: null, a11y: ["ECV to Wheelchair"] },
  "small world":                           { height: null, a11y: ["ECV to Wheelchair"] },
  "magic carpets of aladdin":              { height: null, a11y: ["ECV to Wheelchair"] },
  "magic carpets":                         { height: null, a11y: ["ECV to Wheelchair"] },
  "little mermaid":                        { height: null, a11y: ["ECV to Wheelchair"] },
  "under the sea":                         { height: null, a11y: ["ECV to Wheelchair"] },
  "winnie the pooh":                       { height: null, a11y: ["ECV to Wheelchair"] },
  "many adventures of winnie":             { height: null, a11y: ["ECV to Wheelchair"] },
  "prince charming regal":                 { height: null, a11y: ["ECV to Wheelchair"] },
  "walt disney world railroad":            { height: null, a11y: ["ECV to Wheelchair"] },
  "enchanted tales with belle":            { height: null, a11y: ["ECV to Wheelchair"] },

  // May remain in wheelchair/ECV
  "jungle cruise":                         { height: null, a11y: ["May Remain in Wheelchair"] },
  "pirates of the caribbean":              { height: null, a11y: ["Must Transfer"] },
  "monsters inc":                          { height: null, a11y: ["May Remain in Wheelchair"] },
  "country bear":                          { height: null, a11y: ["May Remain in Wheelchair"] },
  "hall of presidents":                    { height: null, a11y: ["May Remain in Wheelchair"] },
  "enchanted tiki room":                   { height: null, a11y: ["May Remain in Wheelchair"] },
  "liberty square riverboat":              { height: null, a11y: ["May Remain in Wheelchair"] },
  "carousel of progress":                  { height: null, a11y: ["May Remain in Wheelchair"] },
  "philharmagic":                          { height: null, a11y: ["May Remain in Wheelchair"] },
  "casey jr":                              { height: null, a11y: ["May Remain in Wheelchair"] },
  "pirate's adventure":                    { height: null, a11y: ["May Remain in Wheelchair"] },
  "pirates adventure":                     { height: null, a11y: ["May Remain in Wheelchair"] },
  "main street vehicles":                  { height: null, a11y: ["May Remain in Wheelchair"] },
  "cinderella castle":                     { height: null, a11y: ["May Remain in Wheelchair"] },

  // Must be ambulatory
  "tomorrowland transit authority":        { height: null, a11y: ["Must Be Ambulatory"] },
  "people mover":                          { height: null, a11y: ["Must Be Ambulatory"] },
  "swiss family treehouse":                { height: null, a11y: ["Must Be Ambulatory"] },
  "tom sawyer island":                     { height: null, a11y: ["Must Be Ambulatory"] },


  // ── EPCOT ──────────────────────────────────────────────────────────────────
  "guardians of the galaxy":               { height: 42,   a11y: ["Must Transfer", "No Loose Articles"] },
  "mission: space orange":                 { height: 44,   a11y: ["Must Transfer"] },
  "mission: space green":                  { height: 40,   a11y: ["Must Transfer"] },
  "mission space":                         { height: 40,   a11y: ["Must Transfer"] }, // green default
  "test track":                            { height: 40,   a11y: ["Must Transfer"] },
  "soarin":                                { height: 40,   a11y: ["Must Transfer"] },
  "frozen ever after":                     { height: null, a11y: ["Must Transfer"] },

  // ECV to wheelchair
  "remy":                                  { height: null, a11y: ["ECV to Wheelchair"] },
  "ratatouille":                           { height: null, a11y: ["ECV to Wheelchair"] },
  "living with the land":                  { height: null, a11y: ["ECV to Wheelchair"] },
  "gran fiesta":                           { height: null, a11y: ["ECV to Wheelchair"] },
  "seas with nemo":                        { height: null, a11y: ["ECV to Wheelchair"] },

  // May remain in wheelchair
  "spaceship earth":                       { height: null, a11y: ["May Remain in Wheelchair"] },
  "turtle talk":                           { height: null, a11y: ["May Remain in Wheelchair"] },
  "journey into imagination":              { height: null, a11y: ["May Remain in Wheelchair"] },
  "impressions de france":                 { height: null, a11y: ["May Remain in Wheelchair"] },
  "reflections of china":                  { height: null, a11y: ["May Remain in Wheelchair"] },
  "canada far and wide":                   { height: null, a11y: ["May Remain in Wheelchair"] },
  "american adventure":                    { height: null, a11y: ["May Remain in Wheelchair"] },


  // ── Hollywood Studios ──────────────────────────────────────────────────────
  "rock 'n' roller coaster":               { height: 48,   a11y: ["Must Transfer", "No Loose Articles"] },
  "rock n roller":                         { height: 48,   a11y: ["Must Transfer", "No Loose Articles"] },
  "tower of terror":                       { height: 40,   a11y: ["Must Transfer"] },
  "rise of the resistance":                { height: 40,   a11y: ["Must Transfer"] },
  "millennium falcon":                     { height: 38,   a11y: ["Must Transfer"] },
  "smugglers run":                         { height: 38,   a11y: ["Must Transfer"] },
  "slinky dog":                            { height: 38,   a11y: ["Must Transfer"] },
  "star tours":                            { height: 40,   a11y: ["Must Transfer"] },
  "alien swirling":                        { height: 32,   a11y: ["May Remain in Wheelchair"] },

  // May remain in wheelchair
  "toy story mania":                       { height: null, a11y: ["May Remain in Wheelchair"] },
  "runaway railway":                       { height: null, a11y: ["May Remain in Wheelchair"] },
  "lightning mcqueen":                     { height: null, a11y: ["May Remain in Wheelchair"] },
  "muppet":                                { height: null, a11y: ["May Remain in Wheelchair"] },
  "star wars launch bay":                  { height: null, a11y: ["May Remain in Wheelchair"] },
  "indiana jones epic stunt":              { height: null, a11y: ["May Remain in Wheelchair"] },
  "frozen sing":                           { height: null, a11y: ["May Remain in Wheelchair"] },


  // ── Animal Kingdom ─────────────────────────────────────────────────────────
  "flight of passage":                     { height: 44,   a11y: ["Must Transfer"] },
  "expedition everest":                    { height: 44,   a11y: ["Must Transfer", "No Loose Articles"] },
  "dinosaur":                              { height: 40,   a11y: ["Must Transfer"] },
  "kali river rapids":                     { height: 38,   a11y: ["Must Transfer"] },

  // ECV to wheelchair
  "kilimanjaro safaris":                   { height: null, a11y: ["ECV to Wheelchair"] },

  // May remain in wheelchair
  "na'vi river":                           { height: null, a11y: ["May Remain in Wheelchair"] },
  "navi river":                            { height: null, a11y: ["May Remain in Wheelchair"] },
  "triceratop spin":                       { height: null, a11y: ["May Remain in Wheelchair"] },
  "it's tough to be a bug":                { height: null, a11y: ["May Remain in Wheelchair"] },
  "tough to be a bug":                     { height: null, a11y: ["May Remain in Wheelchair"] },
  "gorilla falls":                         { height: null, a11y: ["May Remain in Wheelchair"] },
  "maharajah jungle trek":                 { height: null, a11y: ["May Remain in Wheelchair"] },
  "wildlife express":                      { height: null, a11y: ["May Remain in Wheelchair"] },
  "festival of the lion king":             { height: null, a11y: ["May Remain in Wheelchair"] },
  "finding nemo":                          { height: null, a11y: ["May Remain in Wheelchair"] },
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
