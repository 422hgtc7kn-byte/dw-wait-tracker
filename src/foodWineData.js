// src/foodWineData.js
//
// 2026 EPCOT International Food & Wine Festival — booth + menu data.
// Source: BlogMickey, "FULL LIST of 2026 EPCOT Food & Wine Festival Menus
// (With Prices)", published August 19, 2026.
// https://blogmickey.com/2026/08/full-list-of-2026-epcot-food-wine-festival-menus/
//
// A handful of items have price: null — the source listed these as
// "price not listed" rather than omitting them, so they're kept in the
// list with no price shown rather than dropped.
//
// opensAt is set for the 6 marketplaces that open after day one:
// Festival Favorites (Sep 9), The Wedge (Sep 18), and The Alps / Coastal
// Eats / Earth Eats / India (all Oct 2). Everything else opens Aug 27.

export const FESTIVAL_DATES = {
  start: "2026-08-27",
  end:   "2026-11-21",
};

export const FESTIVAL_BOOTHS = [
  {
    id: "the-wedge-hosted-by-dairy-does-more",
    name: "The Wedge Hosted by Dairy Does More",
    location: "CommuniCore Hall",
    opensAt: "2026-09-18",
    items: [
      { id: "the-wedge-hosted-by-dairy-does-more--crab-and-corn-macaroni-and-cheese", name: "Crab and Corn Macaroni and Cheese", price: "$7.19", desc: "" },
      { id: "the-wedge-hosted-by-dairy-does-more--cheesesteak-macaroni-and-cheese", name: "Cheesesteak Macaroni and Cheese", price: null, desc: "" },
    ],
  },
  {
    id: "festival-favorites",
    name: "Festival Favorites",
    location: "CommuniCore Hall",
    opensAt: "2026-09-09",
    items: [
      { id: "festival-favorites--potato-pierogi", name: "Potato Pierogi", price: "$5.99", desc: "" },
      { id: "festival-favorites--bo-ssam-pork-belly-lettuce-wraps", name: "Bo Ssam Pork Belly Lettuce Wraps", price: "$6.19", desc: "" },
      { id: "festival-favorites--pumpkin-cheesecake-mousse-trifle", name: "Pumpkin Cheesecake Mousse Trifle", price: "$5.29", desc: "" },
    ],
  },
  {
    id: "brew-wing-lab-at-the-odyssey",
    name: "Brew-Wing Lab at The Odyssey",
    location: "World Celebration",
    opensAt: null,
    items: [
      { id: "brew-wing-lab-at-the-odyssey--garlic-parmesan", name: "Garlic-Parmesan", price: "$7.79", desc: "" },
      { id: "brew-wing-lab-at-the-odyssey--buffalo-dill-pickle", name: "Buffalo-Dill Pickle", price: "$7.79", desc: "" },
      { id: "brew-wing-lab-at-the-odyssey--korean-barbecue", name: "Korean Barbecue", price: "$7.79", desc: "" },
      { id: "brew-wing-lab-at-the-odyssey--carolina-reaper-pepper-curry", name: "Carolina Reaper Pepper-Curry", price: "$7.79", desc: "" },
      { id: "brew-wing-lab-at-the-odyssey--sweet-chile-lime-plant-based-chicken-strips", name: "Sweet Chile-Lime Plant-based Chicken Strips", price: "$7.79", desc: "" },
      { id: "brew-wing-lab-at-the-odyssey--fried-pickle-spears", name: "Fried Pickle Spears", price: "$5.79", desc: "" },
    ],
  },
  {
    id: "connections-eatery",
    name: "Connections Eatery",
    location: "World Celebration",
    opensAt: null,
    items: [
      { id: "connections-eatery--bbq-braai-chicken-pizza", name: "BBQ Braai Chicken Pizza", price: "$12.29", desc: "" },
      { id: "connections-eatery--caramel-apple-cheesecake-baumkuchen", name: "Caramel-Apple Cheesecake Baumkuchen", price: "$6.49", desc: "" },
    ],
  },
  {
    id: "connections-caf",
    name: "Connections Café",
    location: "World Celebration",
    opensAt: null,
    items: [
      { id: "connections-caf--pistachio-chocolate-mochi-doughnut", name: "Pistachio-Chocolate Mochi Doughnut", price: "$5.29", desc: "" },
    ],
  },
  {
    id: "coastal-eats",
    name: "Coastal Eats",
    location: "World Discovery",
    opensAt: "2026-10-02",
    items: [
      { id: "coastal-eats--crab-cake", name: "Crab Cake", price: "$7.49", desc: "" },
      { id: "coastal-eats--seafood-pot-pie", name: "Seafood Pot Pie", price: "$7.49", desc: "" },
    ],
  },
  {
    id: "gyozas-of-the-galaxy",
    name: "Gyozas of the Galaxy",
    location: "World Discovery",
    opensAt: null,
    items: [
      { id: "gyozas-of-the-galaxy--basil-pesto-chicken-dumplings", name: "Basil Pesto Chicken Dumplings", price: "$5.99", desc: "" },
      { id: "gyozas-of-the-galaxy--street-corn-style-dumplings", name: "Street Corn-style Dumplings", price: "$5.99", desc: "" },
      { id: "gyozas-of-the-galaxy--edamame-dumplings", name: "Edamame Dumplings", price: "$5.29", desc: "" },
    ],
  },
  {
    id: "flavors-from-fire",
    name: "Flavors from Fire",
    location: "World Discovery",
    opensAt: null,
    items: [
      { id: "flavors-from-fire--rodizio-style-grilled-beef-skewer", name: "Rodizio-style Grilled Beef Skewer", price: "$6.99", desc: "" },
      { id: "flavors-from-fire--smoked-corned-beef", name: "Smoked Corned Beef", price: "$6.49", desc: "" },
      { id: "flavors-from-fire--smoked-chocolate-bread-pudding", name: "Smoked Chocolate Bread Pudding", price: "$4.99", desc: "" },
    ],
  },
  {
    id: "the-fry-basket",
    name: "The Fry Basket",
    location: "World Discovery",
    opensAt: null,
    items: [
      { id: "the-fry-basket--adobo-yuca-fries", name: "Adobo Yuca Fries", price: "$5.79", desc: "" },
      { id: "the-fry-basket--fry-flight", name: "Fry Flight", price: "$7.99", desc: "" },
    ],
  },
  {
    id: "earth-eats",
    name: "Earth Eats",
    location: "World Nature",
    opensAt: "2026-10-02",
    items: [
      { id: "earth-eats--red-wine-braised-beef-short-rib", name: "Red Wine-braised Beef Short Rib", price: "$8.49", desc: "" },
      { id: "earth-eats--lemon-almond-olive-oil-cake", name: "Lemon-Almond-Olive Oil Cake", price: "$4.49", desc: "" },
    ],
  },
  {
    id: "sunshine-seasons",
    name: "Sunshine Seasons",
    location: "World Nature",
    opensAt: null,
    items: [
      { id: "sunshine-seasons--mickey-shaped-celebration-macaron", name: "Mickey-shaped Celebration Macaron", price: "$6.29", desc: "" },
      { id: "sunshine-seasons--remy-milk-shake", name: "Remy Milk Shake", price: "$10.50", desc: "" },
    ],
  },
  {
    id: "australia",
    name: "Australia",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "australia--grilled-bushberry-spiced-shrimp-skewer", name: "Grilled Bushberry-spiced Shrimp Skewer", price: "$6.99", desc: "" },
      { id: "australia--roasted-lamb-chop", name: "Roasted Lamb Chop", price: "$8.79", desc: "" },
      { id: "australia--mixed-berry-pavlova", name: "Mixed Berry Pavlova", price: "$4.79", desc: "" },
    ],
  },
  {
    id: "mexico",
    name: "Mexico",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "mexico--tostada-de-osso-buco", name: "Tostada de Osso Buco", price: "$8.25", desc: "" },
      { id: "mexico--taco-de-camaron", name: "Taco de Camaron", price: "$8.50", desc: "" },
      { id: "mexico--paleta-de-moras", name: "Paleta de Moras", price: "$7.00", desc: "" },
    ],
  },
  {
    id: "norway-cart",
    name: "Norway Cart",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "norway-cart--caramel-cream-and-gjetost-norwegian-brown-cheese-bolle", name: "Caramel Cream and Gjetost Norwegian Brown Cheese Bolle", price: null, desc: "" },
    ],
  },
  {
    id: "china",
    name: "China",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "china--dumplings-trio", name: "Dumplings Trio", price: "$7.35", desc: "" },
      { id: "china--smoked-duck-bao-bun", name: "Smoked Duck Bao Bun", price: "$8.25", desc: "" },
      { id: "china--beijing-zhajiang-noodles", name: "Beijing Zhajiang Noodles", price: "$8.50", desc: "" },
    ],
  },
  {
    id: "india",
    name: "India",
    location: "World Showcase",
    opensAt: "2026-10-02",
    items: [
      { id: "india--potato-pea-samosas", name: "Potato-Pea Samosas", price: "$5.49", desc: "" },
      { id: "india--chicken-tikka-masala", name: "Chicken Tikka Masala", price: "$6.49", desc: "" },
    ],
  },
  {
    id: "refreshment-outpost",
    name: "Refreshment Outpost",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "refreshment-outpost--berbere-spiced-beef-stew", name: "Berbere-spiced Beef Stew", price: "$6.79", desc: "" },
      { id: "refreshment-outpost--sweet-potato-mealie-pap", name: "Sweet Potato Mealie Pap", price: "$5.79", desc: "" },
      { id: "refreshment-outpost--south-african-cream-liqueur-chocolate-mousse", name: "South African Cream Liqueur Chocolate Mousse", price: "$6.29", desc: "" },
      { id: "refreshment-outpost--dole-whip-in-a-cone", name: "DOLE Whip in a Cone", price: "$6.29", desc: "" },
    ],
  },
  {
    id: "the-alps",
    name: "The Alps",
    location: "World Showcase",
    opensAt: "2026-10-02",
    items: [
      { id: "the-alps--warm-raclette-swiss-cheese", name: "Warm Raclette Swiss Cheese", price: "$6.79", desc: "" },
      { id: "the-alps--tartiflette", name: "Tartiflette", price: "$5.49", desc: "" },
      { id: "the-alps--kirschwasser-torte", name: "Kirschwasser Torte", price: "$5.49", desc: "" },
    ],
  },
  {
    id: "germany",
    name: "Germany",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "germany--schinkennudeln", name: "Schinkennudeln", price: "$5.29", desc: "" },
      { id: "germany--wiener-schnitzel", name: "Wiener Schnitzel", price: "$7.29", desc: "" },
      { id: "germany--apple-strudel", name: "Apple Strudel", price: "$4.99", desc: "" },
    ],
  },
  {
    id: "sommerfest",
    name: "Sommerfest",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "sommerfest--zwiebelkuchen", name: "Zwiebelkuchen", price: "$9.79", desc: "" },
    ],
  },
  {
    id: "spain",
    name: "Spain",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "spain--croquetas-de-jam-n", name: "Croquetas de Jamón", price: "$6.99", desc: "" },
      { id: "spain--paella-caldoso", name: "Paella Caldoso", price: "$7.99", desc: "" },
      { id: "spain--basque-cheesecake", name: "Basque Cheesecake", price: "$5.29", desc: "" },
    ],
  },
  {
    id: "italy",
    name: "Italy",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "italy--stromboli", name: "Stromboli", price: "$8.00", desc: "" },
      { id: "italy--pollo-al-marsala", name: "Pollo al Marsala", price: "$9.00", desc: "" },
      { id: "italy--almond-panna-cotta", name: "Almond Panna Cotta", price: "$6.00", desc: "" },
    ],
  },
  {
    id: "block-and-hans-american-adventure",
    name: "Block and Hans (American Adventure)",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "block-and-hans-american-adventure--spicy-strawberry-mango-smoothie", name: "Spicy Strawberry-Mango Smoothie", price: "$6.29", desc: "" },
    ],
  },
  {
    id: "regal-eagle-smokehouse-american-adventure",
    name: "Regal Eagle Smokehouse (American Adventure)",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "regal-eagle-smokehouse-american-adventure--blackberry-buckle", name: "Blackberry Buckle", price: "$4.79", desc: "" },
      { id: "regal-eagle-smokehouse-american-adventure--pumpkin-pie-milk-shake", name: "Pumpkin Pie Milk Shake", price: "$6.79", desc: "" },
    ],
  },
  {
    id: "hops-barley",
    name: "Hops & Barley",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "hops-barley--gulf-coast-style-seafood-roll", name: "Gulf Coast-style Seafood Roll", price: "$8.99", desc: "" },
      { id: "hops-barley--smoked-brisket-and-cheddar-melt", name: "Smoked Brisket and Cheddar Melt", price: "$6.49", desc: "" },
      { id: "hops-barley--freshly-baked-chocolate-pudding-cake", name: "Freshly Baked Chocolate Pudding Cake", price: "$4.99", desc: "" },
    ],
  },
  {
    id: "funnel-cake",
    name: "Funnel Cake",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "funnel-cake--pumpkin-pie-funnel-cake", name: "Pumpkin Pie Funnel Cake", price: "$12.50", desc: "" },
    ],
  },
  {
    id: "japan",
    name: "Japan",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "japan--spicy-temaki-hand-roll", name: "Spicy Temaki Hand Roll", price: "$9.00", desc: "" },
      { id: "japan--beef-wagyu-temaki-hand-roll", name: "Beef Wagyu Temaki Hand Roll", price: "$10.25", desc: "" },
      { id: "japan--teriyaki-chicken-bun", name: "Teriyaki Chicken Bun", price: "$8.00", desc: "" },
    ],
  },
  {
    id: "greece",
    name: "Greece",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "greece--spanakopita", name: "Spanakopita", price: "$5.19", desc: "" },
      { id: "greece--griddled-cheese", name: "Griddled Cheese", price: "$5.49", desc: "" },
      { id: "greece--chicken-souvlaki-gyro", name: "Chicken Souvlaki Gyro", price: "$6.99", desc: "" },
    ],
  },
  {
    id: "tangierine-caf-flavors-of-the-medina",
    name: "Tangierine Café: Flavors of the Medina",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "tangierine-caf-flavors-of-the-medina--plant-based-falafel-wrap", name: "Plant-based Falafel Wrap", price: "$6.29", desc: "" },
      { id: "tangierine-caf-flavors-of-the-medina--chermoula-chicken-hummus-bowl", name: "Chermoula Chicken Hummus Bowl", price: "$6.79", desc: "" },
      { id: "tangierine-caf-flavors-of-the-medina--spiced-flank-steak-hummus-bowl", name: "Spiced Flank Steak Hummus Bowl", price: "$7.29", desc: "" },
      { id: "tangierine-caf-flavors-of-the-medina--ras-el-hanout-cauliflower-bowl", name: "Ras el Hanout Cauliflower Bowl", price: "$6.49", desc: "" },
      { id: "tangierine-caf-flavors-of-the-medina--chocolate-pistachio-cookie", name: "Chocolate-Pistachio Cookie", price: "$4.29", desc: "" },
    ],
  },
  {
    id: "belgium",
    name: "Belgium",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "belgium--beer-braised-beef", name: "Beer-braised Beef", price: "$6.79", desc: "" },
      { id: "belgium--belgian-waffle", name: "Belgian Waffle", price: "$5.49", desc: "" },
    ],
  },
  {
    id: "brazil",
    name: "Brazil",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "brazil--p-o-de-queijo", name: "Pão de Queijo", price: "$5.19", desc: "" },
      { id: "brazil--moqueca-de-camar-o", name: "Moqueca de Camarão", price: "$6.99", desc: "" },
    ],
  },
  {
    id: "france",
    name: "France",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "france--brioche-aux-epices-avec-une-garniture-mornay-de-trois-fromages", name: "Brioche aux Epices avec une Garniture Mornay de Trois Fromages", price: "$8.95", desc: "" },
      { id: "france--trio-d-escargots-garniture-a-l-ail-et-au-persil", name: "Trio d'Escargots, Garniture a l'ail et au Persil", price: "$9.25", desc: "" },
      { id: "france--boeuf-braise-vin-rouge-et-echalottes-g-teau-de-pomes-de-terre", name: "Boeuf Braise vin Rouge et Echalottes, Gâteau de Pomes de Terre", price: "$9.50", desc: "" },
      { id: "france--cr-me-br-l-e-pistache-confiture-de-fruits-rouges", name: "Crème Brûlée Pistache, Confiture de Fruits Rouges", price: "$7.95", desc: "" },
    ],
  },
  {
    id: "canada",
    name: "Canada",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "canada--cheddar-and-bacon-soup", name: "Cheddar and Bacon Soup", price: "$6.29", desc: "" },
      { id: "canada--filet-mignon", name: "Filet Mignon", price: "$10.49", desc: "" },
    ],
  },
  {
    id: "la-poutinerie-hosted-by-air-canada",
    name: "La Poutinerie Hosted by Air Canada",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "la-poutinerie-hosted-by-air-canada--seoul-south-korea-bo-ssam-pork-poutine", name: "Seoul, South Korea: Bo Ssam Pork Poutine", price: "$11.99", desc: "" },
    ],
  },
  {
    id: "shimmering-sips",
    name: "Shimmering Sips",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "shimmering-sips--strawberry-champagne-trifle", name: "Strawberry Champagne Trifle", price: "$5.79", desc: "" },
    ],
  },
  {
    id: "hawai-i",
    name: "Hawai'i",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "hawai-i--slow-roasted-pork-slider", name: "Slow-roasted Pork Slider", price: "$5.99", desc: "" },
      { id: "hawai-i--hawaiian-rice-bowl", name: "Hawaiian Rice Bowl", price: "$6.29", desc: "" },
      { id: "hawai-i--pineapple-cheesecake", name: "Pineapple Cheesecake", price: "$5.49", desc: "" },
    ],
  },
  {
    id: "bramblewood-bites",
    name: "Bramblewood Bites",
    location: "Walkway (Imagination! to World Showcase)",
    opensAt: null,
    items: [
      { id: "bramblewood-bites--grilled-cider-brined-pork-tenderloin", name: "Grilled Cider-brined Pork Tenderloin", price: "$7.19", desc: "" },
      { id: "bramblewood-bites--cast-iron-seared-river-trout", name: "Cast Iron-seared River Trout", price: "$7.29", desc: "" },
      { id: "bramblewood-bites--br-l-ed-sweet-potatoes", name: "Brûléed Sweet Potatoes", price: "$4.99", desc: "" },
    ],
  },
  {
    id: "milled-mulled",
    name: "Milled & Mulled",
    location: "Walkway (Imagination! to World Showcase)",
    opensAt: null,
    items: [
      { id: "milled-mulled--butternut-squash-and-ginger-bisque", name: "Butternut Squash and Ginger Bisque", price: "$5.49", desc: "" },
      { id: "milled-mulled--freshly-baked-carrot-cake", name: "Freshly Baked Carrot Cake", price: "$4.99", desc: "" },
      { id: "milled-mulled--fall-fruit-cheesecake-featuring-boursin-fig-balsamic-cheese", name: "Fall Fruit Cheesecake featuring Boursin Fig & Balsamic Cheese", price: "$5.50", desc: "" },
      { id: "milled-mulled--apple-cinnamon-and-caramel-mini-churros-sundae", name: "Apple-Cinnamon and Caramel Mini Churros Sundae", price: "$5.29", desc: "" },
    ],
  },
  {
    id: "forest-field",
    name: "Forest & Field",
    location: "Walkway (Imagination! to World Showcase)",
    opensAt: null,
    items: [
      { id: "forest-field--spicy-black-bean-mushroom-chili", name: "Spicy Black Bean-Mushroom Chili", price: "$5.99", desc: "" },
      { id: "forest-field--pumpkin-mascarpone-ravioli", name: "Pumpkin-Mascarpone Ravioli", price: "$5.49", desc: "" },
      { id: "forest-field--schiacciata-sandwich", name: "Schiacciata Sandwich", price: "$6.29", desc: "" },
    ],
  },
  {
    id: "swirled-showcase",
    name: "Swirled Showcase",
    location: "Walkway (Imagination! to World Showcase)",
    opensAt: null,
    items: [
      { id: "swirled-showcase--liquid-nitrogen-almond-truffle-mousse", name: "Liquid Nitrogen Almond Truffle Mousse", price: "$5.49", desc: "" },
    ],
  },
];
