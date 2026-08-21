// src/foodWineMapPositions.js
//
// Schematic (not-to-scale) layout of EPCOT World Showcase for the Food &
// Wine map view. This is an original simplified diagram inspired by the
// relative arrangement of pavilions around World Showcase Lagoon — it does
// not reproduce Disney's official festival map artwork. `num` matches the
// numbered marketplace list on the official 2026 festival map handout where
// a booth appears on it; booths without an official number (smaller carts
// and kiosks not on that numbered list) have num: null.

export const MAP_VIEWBOX = "0 0 600 620";

export const LAGOON = { cx: 300, cy: 290, rx: 175, ry: 155 };

export const PAVILION_LABELS = [
  { name: "THE AMERICAN ADVENTURE", x: 300, y: 55 },
  { name: "JAPAN", x: 420, y: 95 },
  { name: "MOROCCO", x: 468, y: 148 },
  { name: "FRANCE", x: 500, y: 195 },
  { name: "UNITED KINGDOM", x: 520, y: 300 },
  { name: "CANADA", x: 500, y: 355 },
  { name: "MEXICO", x: 150, y: 460 },
  { name: "NORWAY", x: 78, y: 345 },
  { name: "CHINA", x: 65, y: 290 },
  { name: "GERMANY", x: 95, y: 175 },
  { name: "ITALY", x: 165, y: 105 },
];

// booth id -> { x, y, num }
export const BOOTH_MAP_POSITIONS = {
  "block-and-hans-american-adventure": { x: 286.0, y: 90.5, num: null },
  "regal-eagle-smokehouse-american-adventure": { x: 361.8, y: 99.8, num: null },
  "hops-barley": { x: 368.4, y: 102.1, num: 16 },
  "funnel-cake": { x: 402.0, y: 118.0, num: 17 },
  "japan": { x: 432.1, y: 139.8, num: 18 },
  "greece": { x: 457.6, y: 166.9, num: 19 },
  "tangierine-caf-flavors-of-the-medina": { x: 469.6, y: 184.0, num: 20 },
  "france": { x: 479.8, y: 202.3, num: 23 },
  "belgium": { x: 494.1, y: 241.6, num: 21 },
  "brazil": { x: 499.9, y: 283.0, num: 22 },
  "uk-beer-cart": { x: 499.2, y: 307.4, num: null },
  "canada": { x: 495.6, y: 331.6, num: 24 },
  "la-poutinerie-hosted-by-air-canada": { x: 486.7, y: 361.7, num: null },
  "canada-popcorn-cart": { x: 473.2, y: 390.0, num: null },
  "swirled-showcase": { x: 465.8, y: 401.8, num: 25 },
  "shimmering-sips": { x: 444.8, y: 427.9, num: 26 },
  "hawai-i": { x: 419.8, y: 450.1, num: 27 },
  "forest-field": { x: 391.4, y: 467.9, num: 28 },
  "milled-mulled": { x: 360.5, y: 480.6, num: 29 },
  "bramblewood-bites": { x: 327.8, y: 488.1, num: 30 },
  "gyozas-of-the-galaxy": { x: 314.0, y: 489.5, num: 1 },
  "coastal-eats": { x: 293.0, y: 489.9, num: 2 },
  "the-fry-basket": { x: 272.2, y: 488.1, num: 3 },
  "flavors-from-fire": { x: 251.6, y: 484.1, num: 4 },
  "brew-wing-lab-at-the-odyssey": { x: 231.6, y: 477.9, num: 6 },
  "connections-eatery": { x: 212.3, y: 469.8, num: null },
  "connections-caf": { x: 194.0, y: 459.6, num: null },
  "festival-favorites": { x: 176.9, y: 447.6, num: 32 },
  "the-wedge-hosted-by-dairy-does-more": { x: 161.1, y: 433.9, num: 33 },
  "australia": { x: 149.1, y: 421.2, num: 7 },
  "mexico": { x: 132.3, y: 398.9, num: 8 },
  "earth-eats": { x: 123.4, y: 383.9, num: 31 },
  "sunshine-seasons": { x: 107.7, y: 345.1, num: null },
  "norway-cart": { x: 103.7, y: 328.2, num: null },
  "refreshment-outpost": { x: 100.3, y: 300.5, num: 11 },
  "china": { x: 100.1, y: 283.0, num: 9 },
  "india": { x: 109.8, y: 228.2, num: 10 },
  "germany": { x: 114.6, y: 215.1, num: 13 },
  "sommerfest": { x: 138.2, y: 172.4, num: null },
  "the-alps": { x: 153.7, y: 153.6, num: 12 },
  "spain": { x: 176.9, y: 132.4, num: 14 },
  "italy": { x: 244.9, y: 97.7, num: 15 },
};
