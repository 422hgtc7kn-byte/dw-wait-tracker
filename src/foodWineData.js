// src/foodWineData.js
//
// 2026 EPCOT International Food & Wine Festival — booth + menu data.
// Source: BlogMickey, "FULL LIST of 2026 EPCOT Food & Wine Festival Menus
// (With Prices)", published August 19, 2026.
// https://blogmickey.com/2026/08/full-list-of-2026-epcot-food-wine-festival-menus/
//
// Each item has a `type` of "food" or "drink". Drink items also carry an
// `alcoholic` boolean (false for things like teas, lassis, mocktails, and
// soft drinks). Two mini-booths from the source with drinks only — UK Beer
// Cart and Canada Popcorn Cart — are included as their own booths since
// they're distinct serving locations, not part of the France or Canada
// marketplaces.
//
// Item descriptions are concise paraphrases of the source's ingredient
// descriptions; a few items (the two unlisted France entries and the
// Milled & Mulled fall fruit cheesecake) had no description in the
// source and are left blank rather than invented.
//
// A handful of items have price: null — the source listed these as
// "price not listed" rather than omitting them, so they're kept in the
// list with no price shown rather than dropped. Some drink prices are
// ranges (e.g. "$6.00–$9.75" for different pour sizes) — kept as-shown
// rather than picking one number.
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
      { id: "the-wedge-hosted-by-dairy-does-more--crab-and-corn-macaroni-and-cheese", name: "Crab and Corn Macaroni and Cheese", price: "$7.19", desc: "Mac and cheese with crab seasoning, roasted corn, bacon, smoked-cheddar sauce, herbed panko, and jalapeño.", type: "food" },
      { id: "the-wedge-hosted-by-dairy-does-more--cheesesteak-macaroni-and-cheese", name: "Cheesesteak Macaroni and Cheese", price: null, desc: "Smoked-cheddar mac and cheese topped with shaved beef, peppers, onions, and herbed panko.", type: "food" },
    ],
  },
  {
    id: "festival-favorites",
    name: "Festival Favorites",
    location: "CommuniCore Hall",
    opensAt: "2026-09-09",
    items: [
      { id: "festival-favorites--potato-pierogi", name: "Potato Pierogi", price: "$5.99", desc: "Potato-filled pierogi served with kielbasa, caramelized onions, and sour cream.", type: "food" },
      { id: "festival-favorites--bo-ssam-pork-belly-lettuce-wraps", name: "Bo Ssam Pork Belly Lettuce Wraps", price: "$6.19", desc: "Tender bo ssam-style pork belly with kimchi slaw and spicy aioli, served as lettuce wraps.", type: "food" },
      { id: "festival-favorites--pumpkin-cheesecake-mousse-trifle", name: "Pumpkin Cheesecake Mousse Trifle", price: "$5.29", desc: "Layers of pumpkin cheesecake mousse, citrus sauce, and spiced cake finished with cranberry streusel.", type: "food" },
      { id: "festival-favorites--frozen-s-mores", name: "Frozen S'mores", price: "$5.29", desc: "Chocolate milk shake with marshmallow syrup, topped with mini marshmallows, chocolate shavings, and a graham cracker.", type: "drink", alcoholic: false },
      { id: "festival-favorites--sch-fferhofer-grapefruit-hefeweizen", name: "Schöfferhofer Grapefruit Hefeweizen", price: "$6.00–$9.75", desc: "Grapefruit hefeweizen from Mainz, Germany.", type: "drink", alcoholic: true },
      { id: "festival-favorites--parish-brewing-co-sips-cabernet-franc-strawberry-berliner-weisse", name: "Parish Brewing Co. SIPS Cabernet Franc Strawberry Berliner Weisse", price: "$6.00–$9.75", desc: "Berliner weisse from Broussard, LA.", type: "drink", alcoholic: true },
      { id: "festival-favorites--3-daughters-brewing-beach-blonde-ale", name: "3 Daughters Brewing Beach Blonde Ale", price: "$6.00–$9.75", desc: "Blonde ale from St. Petersburg, FL.", type: "drink", alcoholic: true },
      { id: "festival-favorites--beer-flight", name: "Beer Flight", price: "$12.75", desc: "Flight of the booth's featured beers.", type: "drink", alcoholic: true },
      { id: "festival-favorites--frozen-apple-blossom", name: "Frozen Apple Blossom", price: "$16.50", desc: "Apple cider, Seagram's Ginger Ale, Hartley Apple VSOP brandy, mini marshmallows, and maple syrup.", type: "drink", alcoholic: true },
    ],
  },
  {
    id: "brew-wing-lab-at-the-odyssey",
    name: "Brew-Wing Lab at The Odyssey",
    location: "World Celebration",
    opensAt: null,
    items: [
      { id: "brew-wing-lab-at-the-odyssey--garlic-parmesan", name: "Garlic-Parmesan", price: "$7.79", desc: "Chicken wing coated in garlic-Parmesan seasoning and sauce.", type: "food" },
      { id: "brew-wing-lab-at-the-odyssey--buffalo-dill-pickle", name: "Buffalo-Dill Pickle", price: "$7.79", desc: "Buffalo-style wing with dill-pickle flavor and house-made pickle ranch.", type: "food" },
      { id: "brew-wing-lab-at-the-odyssey--korean-barbecue", name: "Korean Barbecue", price: "$7.79", desc: "Wing tossed with Korean barbecue sauce and toasted sesame.", type: "food" },
      { id: "brew-wing-lab-at-the-odyssey--carolina-reaper-pepper-curry", name: "Carolina Reaper Pepper-Curry", price: "$7.79", desc: "Very spicy curry-seasoned wing made with Carolina Reaper pepper and served with cooling cucumber raita.", type: "food" },
      { id: "brew-wing-lab-at-the-odyssey--sweet-chile-lime-plant-based-chicken-strips", name: "Sweet Chile-Lime Plant-based Chicken Strips", price: "$7.79", desc: "Plant-based chicken strips with sweet chile-lime flavor, cilantro crema, and spicy peppers.", type: "food" },
      { id: "brew-wing-lab-at-the-odyssey--fried-pickle-spears", name: "Fried Pickle Spears", price: "$5.79", desc: "Crispy fried dill-pickle spears served with dill ranch.", type: "food" },
      { id: "brew-wing-lab-at-the-odyssey--frozen-pomegranate-raspberry-tea", name: "Frozen Pomegranate & Raspberry Tea", price: "$5.19", desc: "Twinings Pomegranate & Raspberry herbal tea with orange ice cream molecules.", type: "drink", alcoholic: false },
      { id: "brew-wing-lab-at-the-odyssey--pickle-milk-shake", name: "Pickle Milk Shake", price: "$6.49", desc: "Pickle-flavored milk shake.", type: "drink", alcoholic: false },
      { id: "brew-wing-lab-at-the-odyssey--civil-society-brewing-everyday-i-m-waffle-n-ipa", name: "Civil Society Brewing Everyday I'm Waffle'n IPA", price: "$6.00–$9.75", desc: "IPA from Jupiter, FL.", type: "drink", alcoholic: true },
      { id: "brew-wing-lab-at-the-odyssey--3-daughters-brewing-peanut-butter-blondie-blonde-ale", name: "3 Daughters Brewing Peanut Butter Blondie Blonde Ale", price: "$6.00–$9.75", desc: "Blonde ale from St. Petersburg, FL.", type: "drink", alcoholic: true },
      { id: "brew-wing-lab-at-the-odyssey--playalinda-brewing-co-pumpkin-cheesecake-blonde-stout", name: "Playalinda Brewing Co. Pumpkin Cheesecake Blonde Stout", price: "$6.00–$9.75", desc: "Blonde stout from Titusville, FL.", type: "drink", alcoholic: true },
      { id: "brew-wing-lab-at-the-odyssey--beer-flight", name: "Beer Flight", price: "$12.75", desc: "Flight of the booth's featured beers.", type: "drink", alcoholic: true },
      { id: "brew-wing-lab-at-the-odyssey--bold-rock-apple-crumble-hard-cider", name: "Bold Rock Apple Crumble Hard Cider", price: "$6.00–$9.75", desc: "Hard cider from Nellysford, VA.", type: "drink", alcoholic: true },
      { id: "brew-wing-lab-at-the-odyssey--ciderboys-cherry-jubilee-hard-cider", name: "Ciderboys Cherry Jubilee Hard Cider", price: "$6.00–$9.75", desc: "Hard cider from Stevens Point, WI.", type: "drink", alcoholic: true },
      { id: "brew-wing-lab-at-the-odyssey--ciderboys-pumpkin-spice-hard-cider", name: "Ciderboys Pumpkin Spice Hard Cider", price: "$6.00–$9.75", desc: "Hard cider from Stevens Point, WI.", type: "drink", alcoholic: true },
      { id: "brew-wing-lab-at-the-odyssey--hard-cider-flight", name: "Hard Cider Flight", price: "$12.75", desc: "Flight of the booth's featured hard ciders.", type: "drink", alcoholic: true },
    ],
  },
  {
    id: "connections-eatery",
    name: "Connections Eatery",
    location: "World Celebration",
    opensAt: null,
    items: [
      { id: "connections-eatery--bbq-braai-chicken-pizza", name: "BBQ Braai Chicken Pizza", price: "$12.29", desc: "Two pizza slices topped with tamarind barbecue, arugula, cheese, onions, and piri piri sauce.", type: "food" },
      { id: "connections-eatery--caramel-apple-cheesecake-baumkuchen", name: "Caramel-Apple Cheesecake Baumkuchen", price: "$6.49", desc: "Layered German-style cake with caramel-apple cheesecake flavors.", type: "food" },
    ],
  },
  {
    id: "connections-caf",
    name: "Connections Café",
    location: "World Celebration",
    opensAt: null,
    items: [
      { id: "connections-caf--pistachio-chocolate-mochi-doughnut", name: "Pistachio-Chocolate Mochi Doughnut", price: "$5.29", desc: "Chewy mochi doughnut combining pistachio and chocolate flavors.", type: "food" },
    ],
  },
  {
    id: "coastal-eats",
    name: "Coastal Eats",
    location: "World Discovery",
    opensAt: "2026-10-02",
    items: [
      { id: "coastal-eats--crab-cake", name: "Crab Cake", price: "$7.49", desc: "Crab cake paired with tropical fruit chutney, mustard sauce, and micro celery.", type: "food" },
      { id: "coastal-eats--seafood-pot-pie", name: "Seafood Pot Pie", price: "$7.49", desc: "Shrimp and scallops in lobster bisque under a puff-pastry topping.", type: "food" },
      { id: "coastal-eats--rileys-lookout-sauvignon-blanc", name: "Rileys Lookout Sauvignon Blanc", price: "$6.50", desc: "Sauvignon blanc from Marlborough, New Zealand.", type: "drink", alcoholic: true },
      { id: "coastal-eats--boyd-blair-pomegranate-codder", name: "Boyd & Blair Pomegranate Codder", price: "$12.50", desc: "Cocktail from Glenshaw, PA.", type: "drink", alcoholic: true },
    ],
  },
  {
    id: "gyozas-of-the-galaxy",
    name: "Gyozas of the Galaxy",
    location: "World Discovery",
    opensAt: null,
    items: [
      { id: "gyozas-of-the-galaxy--basil-pesto-chicken-dumplings", name: "Basil Pesto Chicken Dumplings", price: "$5.99", desc: "Chicken dumplings with basil pesto, creamy fonduta, tomato confit, and balsamic.", type: "food" },
      { id: "gyozas-of-the-galaxy--street-corn-style-dumplings", name: "Street Corn-style Dumplings", price: "$5.99", desc: "Chicken dumplings with tomatillo salsa verde, street-corn salad, cotija, lime crema, and cilantro.", type: "food" },
      { id: "gyozas-of-the-galaxy--edamame-dumplings", name: "Edamame Dumplings", price: "$5.29", desc: "Dumplings served with butternut-squash purée, caramelized onions, sage, and walnut-garlic sauce.", type: "food" },
      { id: "gyozas-of-the-galaxy--willamette-valley-vineyards-pinot-gris", name: "Willamette Valley Vineyards Pinot Gris", price: "$7.50", desc: "Pinot gris from Willamette Valley, OR.", type: "drink", alcoholic: true },
    ],
  },
  {
    id: "flavors-from-fire",
    name: "Flavors from Fire",
    location: "World Discovery",
    opensAt: null,
    items: [
      { id: "flavors-from-fire--rodizio-style-grilled-beef-skewer", name: "Rodizio-style Grilled Beef Skewer", price: "$6.99", desc: "Grilled beef skewer with marble potatoes, charred shallots, baby peppers, and chimichurri.", type: "food" },
      { id: "flavors-from-fire--smoked-corned-beef", name: "Smoked Corned Beef", price: "$6.49", desc: "Smoked corned beef with house-made potato chips, cheese curds, pickled onions, and beer-cheese fondue.", type: "food" },
      { id: "flavors-from-fire--smoked-chocolate-bread-pudding", name: "Smoked Chocolate Bread Pudding", price: "$4.99", desc: "Chocolate bread pudding with chocolate ganache, vanilla-bean bourbon sauce, and smoked sea salt.", type: "food" },
      { id: "flavors-from-fire--left-hand-brewing-co-sawtooth-amber-ale", name: "Left Hand Brewing Co. Sawtooth Amber Ale", price: "$6.00–$9.75", desc: "Amber ale from Longmont, CO.", type: "drink", alcoholic: true },
      { id: "flavors-from-fire--1000-stories-bourbon-barrel-aged-zinfandel", name: "1000 Stories Bourbon Barrel-aged Zinfandel", price: "$6.50", desc: "Bourbon barrel-aged zinfandel from Lodi, CA.", type: "drink", alcoholic: true },
      { id: "flavors-from-fire--swine-brine", name: "Swine Brine", price: "$13.00", desc: "Jim Beam Kentucky Straight Bourbon Whiskey, apple-cinnamon cider, lemon juice, and Dijon mustard, topped with a pork wing.", type: "drink", alcoholic: true },
    ],
  },
  {
    id: "the-fry-basket",
    name: "The Fry Basket",
    location: "World Discovery",
    opensAt: null,
    items: [
      { id: "the-fry-basket--adobo-yuca-fries", name: "Adobo Yuca Fries", price: "$5.79", desc: "Crispy yuca fries with plant-based garlic-cilantro aioli.", type: "food" },
      { id: "the-fry-basket--fry-flight", name: "Fry Flight", price: "$7.99", desc: "Three fry styles: sea-salt malt-vinegar, truffle-Parmesan, and sweet-potato casserole-inspired fries.", type: "food" },
      { id: "the-fry-basket--barrel-of-monks-blood-orange-bliss-sour-ale", name: "Barrel of Monks Blood Orange Bliss Sour Ale", price: "$6.00–$9.75", desc: "Sour ale from Boca Raton, FL.", type: "drink", alcoholic: true },
      { id: "the-fry-basket--boyd-blair-grapefruit-mule", name: "Boyd & Blair Grapefruit Mule", price: "$12.50", desc: "Cocktail from Glenshaw, PA.", type: "drink", alcoholic: true },
    ],
  },
  {
    id: "earth-eats",
    name: "Earth Eats",
    location: "World Nature",
    opensAt: "2026-10-02",
    items: [
      { id: "earth-eats--red-wine-braised-beef-short-rib", name: "Red Wine-braised Beef Short Rib", price: "$8.49", desc: "Braised beef short rib with goat-cheese polenta, tomato ragù, pecorino, and herbs.", type: "food" },
      { id: "earth-eats--lemon-almond-olive-oil-cake", name: "Lemon-Almond-Olive Oil Cake", price: "$4.49", desc: "Moist lemon, almond, and olive-oil cake served with whipped Greek-yogurt panna cotta.", type: "food" },
      { id: "earth-eats--minute-maid-aguas-frescas-strawberry-hibiscus", name: "Minute Maid Aguas Frescas – Strawberry Hibiscus", price: "$4.79", desc: "Strawberry hibiscus aguas frescas.", type: "drink", alcoholic: false },
      { id: "earth-eats--harken-barrel-fermented-chardonnay", name: "Harken Barrel Fermented Chardonnay", price: "$6.50", desc: "Barrel-fermented chardonnay from Parlier, CA.", type: "drink", alcoholic: true },
    ],
  },
  {
    id: "sunshine-seasons",
    name: "Sunshine Seasons",
    location: "World Nature",
    opensAt: null,
    items: [
      { id: "sunshine-seasons--mickey-shaped-celebration-macaron", name: "Mickey-shaped Celebration Macaron", price: "$6.29", desc: "A Mickey-shaped macaron celebrating the festival anniversary.", type: "food" },
      { id: "sunshine-seasons--remy-milk-shake", name: "Remy Milk Shake", price: "$10.50", desc: "Strawberry-cheesecake milk shake topped with a cookie, mini cheesecake, white-chocolate Eiffel Tower, and strawberry.", type: "food" },
    ],
  },
  {
    id: "australia",
    name: "Australia",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "australia--grilled-bushberry-spiced-shrimp-skewer", name: "Grilled Bushberry-spiced Shrimp Skewer", price: "$6.99", desc: "Grilled shrimp seasoned with bushberry spices, served with sweet-and-sour vegetables and coconut-chili sauce.", type: "food" },
      { id: "australia--roasted-lamb-chop", name: "Roasted Lamb Chop", price: "$8.79", desc: "Roasted lamb chop with mint pesto and crushed salt-and-vinegar potato chips.", type: "food" },
      { id: "australia--mixed-berry-pavlova", name: "Mixed Berry Pavlova", price: "$4.79", desc: "Crisp meringue shell filled with macerated mixed berries and whipped cream.", type: "food" },
      { id: "australia--yalumba-the-y-series-viognier", name: "Yalumba 'The Y Series' Viognier", price: "$6.50", desc: "Viognier from Angaston.", type: "drink", alcoholic: true },
      { id: "australia--bulletin-place-sauvignon-blanc", name: "Bulletin Place Sauvignon Blanc", price: "$6.50", desc: "Sauvignon blanc from Riverina.", type: "drink", alcoholic: true },
      { id: "australia--fowles-farm-to-table-shiraz", name: "Fowles Farm to Table Shiraz", price: "$7.50", desc: "Shiraz from Upton Hills.", type: "drink", alcoholic: true },
      { id: "australia--wine-flight", name: "Wine Flight", price: "$7.50", desc: "Flight of the booth's featured wines.", type: "drink", alcoholic: true },
    ],
  },
  {
    id: "mexico",
    name: "Mexico",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "mexico--tostada-de-osso-buco", name: "Tostada de Osso Buco", price: "$8.25", desc: "Pork osso buco on a fried corn tortilla with chipotle black beans, salsa verde, queso fresco, and chives.", type: "food" },
      { id: "mexico--taco-de-camaron", name: "Taco de Camaron", price: "$8.50", desc: "Crispy tempura shrimp in a flour tortilla with shredded cabbage and chipotle aioli.", type: "food" },
      { id: "mexico--paleta-de-moras", name: "Paleta de Moras", price: "$7.00", desc: "Berry ice pop filled with sweetened condensed milk and finished with chili-lime seasoning.", type: "food" },
    ],
  },
  {
    id: "norway-cart",
    name: "Norway Cart",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "norway-cart--caramel-cream-and-gjetost-norwegian-brown-cheese-bolle", name: "Caramel Cream and Gjetost Norwegian Brown Cheese Bolle", price: null, desc: "Sweet Norwegian bread roll filled with caramel cream and tangy brown gjetost cheese.", type: "food" },
    ],
  },
  {
    id: "china",
    name: "China",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "china--dumplings-trio", name: "Dumplings Trio", price: "$7.35", desc: "Three pan-fried dumplings—chicken, pork, and vegetable—with sweet-and-spicy sauce.", type: "food" },
      { id: "china--smoked-duck-bao-bun", name: "Smoked Duck Bao Bun", price: "$8.25", desc: "Smoked duck in a steamed bao with pickled cucumber, scallion, and hoisin.", type: "food" },
      { id: "china--beijing-zhajiang-noodles", name: "Beijing Zhajiang Noodles", price: "$8.50", desc: "Stir-fried noodles with minced beef, cucumber, chili, carrots, and savory douban sauce.", type: "food" },
      { id: "china--mango-peach-bubble-tea", name: "Mango-Peach Bubble Tea", price: "$7.95", desc: "Green tea, mango and peach syrups, and white boba.", type: "drink", alcoholic: false },
      { id: "china--dasani-bottled-water", name: "Dasani Bottled Water", price: "$4.25", desc: "Bottled water.", type: "drink", alcoholic: false },
      { id: "china--honghe-rice-lager-draft-beer", name: "Honghe Rice Lager Draft Beer", price: "$6.00–$10.75", desc: "Rice lager from Littleton, NH.", type: "drink", alcoholic: true },
      { id: "china--baijiu-punch", name: "Baijiu Punch", price: "$14.25", desc: "Baijiu spirit, lychee syrup, soda water, and piña colada mix.", type: "drink", alcoholic: true },
      { id: "china--hainan-prosperity", name: "Hainan Prosperity", price: "$14.25", desc: "Tequila, vodka, Minute Maid orange juice, and mango syrup.", type: "drink", alcoholic: true },
      { id: "china--frozen-strawberry-jasmine-cocktail", name: "Frozen Strawberry-Jasmine Cocktail", price: "$14.00", desc: "Light rum, jasmine tea, and strawberry syrup.", type: "drink", alcoholic: true },
    ],
  },
  {
    id: "india",
    name: "India",
    location: "World Showcase",
    opensAt: "2026-10-02",
    items: [
      { id: "india--potato-pea-samosas", name: "Potato-Pea Samosas", price: "$5.49", desc: "Crisp plant-based samosas filled with potato and peas, served with coriander-lime cream.", type: "food" },
      { id: "india--chicken-tikka-masala", name: "Chicken Tikka Masala", price: "$6.49", desc: "Chicken tikka in a spiced tomato-style sauce with fennel-seasoned yogurt and naan.", type: "food" },
      { id: "india--mango-lassi", name: "Mango Lassi", price: "$5.29", desc: "Mango lassi.", type: "drink", alcoholic: false },
      { id: "india--united-breweries-taj-mahal-premium-lager", name: "United Breweries Taj Mahal Premium Lager", price: "$6.00–$9.75", desc: "Premium lager from Bengaluru.", type: "drink", alcoholic: true },
      { id: "india--sula-tropicale-brut-sparkling-wine", name: "Sula Tropicale Brut Sparkling Wine", price: "$7.75", desc: "Sparkling wine from Nashik Valley.", type: "drink", alcoholic: true },
      { id: "india--mango-lassi-with-camikara-8-year-old-cask-aged-rum", name: "Mango Lassi with Camikara 8-Year-Old Cask Aged Rum", price: "$12.50", desc: "Mango lassi spiked with 8-year-old cask aged rum.", type: "drink", alcoholic: true },
    ],
  },
  {
    id: "refreshment-outpost",
    name: "Refreshment Outpost",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "refreshment-outpost--berbere-spiced-beef-stew", name: "Berbere-spiced Beef Stew", price: "$6.79", desc: "Berbere-seasoned beef stew served with sweet-potato mealie pap and kachumbari slaw.", type: "food" },
      { id: "refreshment-outpost--sweet-potato-mealie-pap", name: "Sweet Potato Mealie Pap", price: "$5.79", desc: "Plant-based stew of beans, peppers, carrots, and tomatoes served with sweet-potato mealie pap.", type: "food" },
      { id: "refreshment-outpost--south-african-cream-liqueur-chocolate-mousse", name: "South African Cream Liqueur Chocolate Mousse", price: "$6.29", desc: "Chocolate mousse made with South African cream liqueur, white-chocolate ganache, and chocolate popping candy.", type: "food" },
      { id: "refreshment-outpost--dole-whip-in-a-cone", name: "DOLE Whip in a Cone", price: "$6.29", desc: "Soft-serve DOLE Whip served in a cone.", type: "food" },
      { id: "refreshment-outpost--breckenridge-brewery-palisade-peach-wheat-ale", name: "Breckenridge Brewery Palisade Peach Wheat Ale", price: "$12.50", desc: "Wheat ale from Breckenridge, CO.", type: "drink", alcoholic: true },
      { id: "refreshment-outpost--3-daughters-brewing-cinnamon-donut-hard-cider", name: "3 Daughters Brewing Cinnamon Donut Hard Cider", price: "$12.50", desc: "Hard cider from St. Petersburg, FL.", type: "drink", alcoholic: true },
      { id: "refreshment-outpost--coppertail-brewing-co-cherry-cola-hard-cider", name: "Coppertail Brewing Co. Cherry Cola Hard Cider", price: "$12.50", desc: "Hard cider from Tampa, FL.", type: "drink", alcoholic: true },
      { id: "refreshment-outpost--midnight-safari", name: "Midnight Safari", price: "$17.50", desc: "Mansas African whisky, crème de cassis liqueur, and sour mix, garnished with blackberry and mint.", type: "drink", alcoholic: true },
      { id: "refreshment-outpost--frozen-slushy", name: "Frozen Slushy", price: "$6.29", desc: "Coca-Cola or Minute Maid Premium Lemonade slushy.", type: "drink", alcoholic: false },
      { id: "refreshment-outpost--assorted-fountain-beverage-regular", name: "Assorted Fountain Beverage – Regular", price: "$4.79", desc: "Fountain beverage, regular size.", type: "drink", alcoholic: false },
      { id: "refreshment-outpost--assorted-fountain-beverage-large", name: "Assorted Fountain Beverage – Large", price: "$5.59", desc: "Fountain beverage, large size.", type: "drink", alcoholic: false },
      { id: "refreshment-outpost--dasani-bottled-water", name: "DASANI Bottled Water", price: "$4.25", desc: "Bottled water.", type: "drink", alcoholic: false },
      { id: "refreshment-outpost--bud-light-lager-draft", name: "Bud Light Lager Draft", price: "$10.00", desc: "Lager draft from St. Louis, MO.", type: "drink", alcoholic: true },
      { id: "refreshment-outpost--mango-rum-freeze", name: "Mango Rum Freeze", price: "$16.50", desc: "Mango purée and STARR African rum.", type: "drink", alcoholic: true },
      { id: "refreshment-outpost--frozen-brown-elephant", name: "Frozen Brown Elephant", price: "$16.50", desc: "Frozen Coca-Cola with Amarula cream liqueur.", type: "drink", alcoholic: true },
      { id: "refreshment-outpost--outpost-lemonade", name: "Outpost Lemonade", price: "$16.50", desc: "Frozen Minute Maid Lemonade and Absolut Vodka.", type: "drink", alcoholic: true },
    ],
  },
  {
    id: "the-alps",
    name: "The Alps",
    location: "World Showcase",
    opensAt: "2026-10-02",
    items: [
      { id: "the-alps--warm-raclette-swiss-cheese", name: "Warm Raclette Swiss Cheese", price: "$6.79", desc: "Melted Swiss raclette over a baguette with ham and apple-mustard relish.", type: "food" },
      { id: "the-alps--tartiflette", name: "Tartiflette", price: "$5.49", desc: "French Alpine potato gratin with caramelized onions, bacon, thyme, crème fraîche, and Brie.", type: "food" },
      { id: "the-alps--kirschwasser-torte", name: "Kirschwasser Torte", price: "$5.49", desc: "Cherry-brandy cake with buttercream, fondant, sugared almonds, and cherry compote.", type: "food" },
    ],
  },
  {
    id: "germany",
    name: "Germany",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "germany--schinkennudeln", name: "Schinkennudeln", price: "$5.29", desc: "German baked pasta with ham, onions, and cheese.", type: "food" },
      { id: "germany--wiener-schnitzel", name: "Wiener Schnitzel", price: "$7.29", desc: "Breaded veal cutlet with mustard, warm potato salad, bacon, watercress-radish salad, and lemon.", type: "food" },
      { id: "germany--apple-strudel", name: "Apple Strudel", price: "$4.99", desc: "Classic apple strudel served with vanilla sauce.", type: "food" },
      { id: "germany--sch-fferhofer-orange-spritz-hefeweizen", name: "Schöfferhofer Orange Spritz Hefeweizen", price: "$6.00–$9.75", desc: "Orange spritz hefeweizen from Mainz.", type: "drink", alcoholic: true },
      { id: "germany--weihenstephaner-festbier", name: "Weihenstephaner Festbier", price: "$6.00–$9.75", desc: "Festbier from Freising.", type: "drink", alcoholic: true },
      { id: "germany--von-trapp-brewing-oktoberfest-m-rzen-style-lager", name: "von Trapp Brewing Oktoberfest Märzen-style Lager", price: "$6.00–$9.75", desc: "Märzen-style lager from Stowe, VT.", type: "drink", alcoholic: true },
      { id: "germany--beer-flight", name: "Beer Flight", price: "$12.75", desc: "Flight of the booth's featured beers.", type: "drink", alcoholic: true },
      { id: "germany--selbach-oster-riesling", name: "Selbach-Oster Riesling", price: "$9.00", desc: "Riesling from Mosel.", type: "drink", alcoholic: true },
    ],
  },
  {
    id: "sommerfest",
    name: "Sommerfest",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "sommerfest--zwiebelkuchen", name: "Zwiebelkuchen", price: "$9.79", desc: "German savory onion cake with caramelized onions, bacon, herbs, and custard.", type: "food" },
      { id: "sommerfest--cinnamon-pretzel-cold-brew", name: "Cinnamon Pretzel Cold Brew", price: "$6.49", desc: "Joffrey's Cold Brew Coffee with sweet cream, caramel, vanilla, cinnamon, and pretzel pieces.", type: "drink", alcoholic: false },
    ],
  },
  {
    id: "spain",
    name: "Spain",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "spain--croquetas-de-jam-n", name: "Croquetas de Jamón", price: "$6.99", desc: "Crispy ham croquettes served with saffron aioli and shaved Jamón Serrano.", type: "food" },
      { id: "spain--paella-caldoso", name: "Paella Caldoso", price: "$7.99", desc: "Brothy saffron rice with chicken, chorizo, and beans.", type: "food" },
      { id: "spain--basque-cheesecake", name: "Basque Cheesecake", price: "$5.29", desc: "Creamy Basque-style cheesecake served with orange sauce.", type: "food" },
      { id: "spain--volver-quinta-del-67-garnacha-tintorera", name: "Volver Quinta del '67 Garnacha Tintorera", price: "$7.50", desc: "Garnacha tintorera from Alicante.", type: "drink", alcoholic: true },
      { id: "spain--summer-in-spain", name: "Summer In Spain", price: "$13.00", desc: "Frozen Simply Lemonade with herbal liqueurs.", type: "drink", alcoholic: true },
    ],
  },
  {
    id: "italy",
    name: "Italy",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "italy--stromboli", name: "Stromboli", price: "$8.00", desc: "Baked roll filled with ham and provolone, served with Parmesan and tomato sauce.", type: "food" },
      { id: "italy--pollo-al-marsala", name: "Pollo al Marsala", price: "$9.00", desc: "Roasted chicken with creamy potato gnocchi, mushrooms, and Marsala sauce.", type: "food" },
      { id: "italy--almond-panna-cotta", name: "Almond Panna Cotta", price: "$6.00", desc: "Panna cotta with almond flavor, orange marmalade, whipped cream, and candied almonds.", type: "food" },
    ],
  },
  {
    id: "block-and-hans-american-adventure",
    name: "Block and Hans (American Adventure)",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "block-and-hans-american-adventure--spicy-strawberry-mango-smoothie", name: "Spicy Strawberry-Mango Smoothie", price: "$6.29", desc: "Strawberry smoothie blended with spicy mango syrup.", type: "food" },
    ],
  },
  {
    id: "regal-eagle-smokehouse-american-adventure",
    name: "Regal Eagle Smokehouse (American Adventure)",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "regal-eagle-smokehouse-american-adventure--blackberry-buckle", name: "Blackberry Buckle", price: "$4.79", desc: "Warm-style blackberry dessert paired with blackberry gelato and streusel.", type: "food" },
      { id: "regal-eagle-smokehouse-american-adventure--pumpkin-pie-milk-shake", name: "Pumpkin Pie Milk Shake", price: "$6.79", desc: "Vanilla ice cream blended with pumpkin-pie filling and caramel, topped with whipped cream and streusel.", type: "food" },
    ],
  },
  {
    id: "hops-barley",
    name: "Hops & Barley",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "hops-barley--gulf-coast-style-seafood-roll", name: "Gulf Coast-style Seafood Roll", price: "$8.99", desc: "Warm-water lobster and rock shrimp with lobster bisque and sherry crème fraîche on toasted brioche.", type: "food" },
      { id: "hops-barley--smoked-brisket-and-cheddar-melt", name: "Smoked Brisket and Cheddar Melt", price: "$6.49", desc: "Chopped smoked brisket with caramelized onions, barbecue sauce, and cheddar on a potato roll.", type: "food" },
      { id: "hops-barley--freshly-baked-chocolate-pudding-cake", name: "Freshly Baked Chocolate Pudding Cake", price: "$4.99", desc: "Chocolate pudding cake finished with Kentucky bourbon caramel.", type: "food" },
    ],
  },
  {
    id: "funnel-cake",
    name: "Funnel Cake",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "funnel-cake--pumpkin-pie-funnel-cake", name: "Pumpkin Pie Funnel Cake", price: "$12.50", desc: "Funnel cake topped with pumpkin-pie ice cream, whipped cream, dark-chocolate sauce, cinnamon streusel, and powdered sugar.", type: "food" },
    ],
  },
  {
    id: "japan",
    name: "Japan",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "japan--spicy-temaki-hand-roll", name: "Spicy Temaki Hand Roll", price: "$9.00", desc: "Temaki hand roll with spicy tuna, cucumber, rice cracker, and spicy mayonnaise.", type: "food" },
      { id: "japan--beef-wagyu-temaki-hand-roll", name: "Beef Wagyu Temaki Hand Roll", price: "$10.25", desc: "Temaki hand roll with savory American Wagyu beef, pickled ginger, and spicy mayonnaise.", type: "food" },
      { id: "japan--teriyaki-chicken-bun", name: "Teriyaki Chicken Bun", price: "$8.00", desc: "Steamed bun filled with minced chicken, vegetables, and teriyaki sauce.", type: "food" },
    ],
  },
  {
    id: "greece",
    name: "Greece",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "greece--spanakopita", name: "Spanakopita", price: "$5.19", desc: "Greek pastry filled with seasoned spinach and cheese.", type: "food" },
      { id: "greece--griddled-cheese", name: "Griddled Cheese", price: "$5.49", desc: "Griddled cheese served with pistachios and honey.", type: "food" },
      { id: "greece--chicken-souvlaki-gyro", name: "Chicken Souvlaki Gyro", price: "$6.99", desc: "Chicken souvlaki with lettuce, tomato-cucumber relish, and tzatziki in warm pita.", type: "food" },
      { id: "greece--mylonas-winery-assyrtiko-dry-white", name: "Mylonas Winery Assyrtiko Dry White", price: "$6.50", desc: "Dry white assyrtiko from Attiki.", type: "drink", alcoholic: true },
      { id: "greece--zoe-ros", name: "Zoe Rosé", price: "$6.50", desc: "Rosé from Peloponnese.", type: "drink", alcoholic: true },
      { id: "greece--kir-yianni-naoussa-xinomavro-dry-red", name: "Kir-Yianni Naoussa Xinomavro Dry Red", price: "$7.50", desc: "Dry red xinomavro from Naoussa.", type: "drink", alcoholic: true },
      { id: "greece--wine-flight", name: "Wine Flight", price: "$7.50", desc: "Flight of the booth's featured wines.", type: "drink", alcoholic: true },
      { id: "greece--greek-melon-limeade", name: "Greek Melon Limeade", price: "$12.00", desc: "Kleos Mastiha spirit, Artonic melon apéritif, Pearl vodka, and lime sour mix.", type: "drink", alcoholic: true },
    ],
  },
  {
    id: "tangierine-caf-flavors-of-the-medina",
    name: "Tangierine Café: Flavors of the Medina",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "tangierine-caf-flavors-of-the-medina--plant-based-falafel-wrap", name: "Plant-based Falafel Wrap", price: "$6.29", desc: "Plant-based falafel with tomato-cucumber relish and garlic sauce in Moroccan flatbread.", type: "food" },
      { id: "tangierine-caf-flavors-of-the-medina--chermoula-chicken-hummus-bowl", name: "Chermoula Chicken Hummus Bowl", price: "$6.79", desc: "Hummus bowl topped with chermoula chicken, apricot chutney, shishito peppers, and pita.", type: "food" },
      { id: "tangierine-caf-flavors-of-the-medina--spiced-flank-steak-hummus-bowl", name: "Spiced Flank Steak Hummus Bowl", price: "$7.29", desc: "Hummus bowl with spiced flank steak, harissa yogurt, roasted peppers, and pita.", type: "food" },
      { id: "tangierine-caf-flavors-of-the-medina--ras-el-hanout-cauliflower-bowl", name: "Ras el Hanout Cauliflower Bowl", price: "$6.49", desc: "Roasted cauliflower and chickpea salad with golden-raisin relish and parsley, served with pita.", type: "food" },
      { id: "tangierine-caf-flavors-of-the-medina--chocolate-pistachio-cookie", name: "Chocolate-Pistachio Cookie", price: "$4.29", desc: "Cookie combining rich chocolate and pistachio flavors.", type: "food" },
    ],
  },
  {
    id: "belgium",
    name: "Belgium",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "belgium--beer-braised-beef", name: "Beer-braised Beef", price: "$6.79", desc: "Beef braised in beer and served with smoked Gouda mashed potatoes.", type: "food" },
      { id: "belgium--belgian-waffle", name: "Belgian Waffle", price: "$5.49", desc: "Belgian-style waffle topped with cookie butter, whipped cream, and speculoos pieces.", type: "food" },
    ],
  },
  {
    id: "brazil",
    name: "Brazil",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "brazil--p-o-de-queijo", name: "Pão de Queijo", price: "$5.19", desc: "Brazilian cheese bread with a chewy, cheesy center.", type: "food" },
      { id: "brazil--moqueca-de-camar-o", name: "Moqueca de Camarão", price: "$6.99", desc: "Shrimp, peppers, cilantro, and tomatoes simmered in a rich coconut-milk broth, served with rice.", type: "food" },
      { id: "brazil--brewdog-brewing-company-peach-mango-wheat-ale", name: "BrewDog Brewing Company Peach Mango Wheat Ale", price: "$6.00–$9.75", desc: "Wheat ale from Canal Winchester, OH.", type: "drink", alcoholic: true },
      { id: "brazil--frozen-caipirinha", name: "Frozen Caipirinha", price: "$12.50", desc: "Frozen caipirinha with cachaça spirit.", type: "drink", alcoholic: true },
    ],
  },
  {
    id: "france",
    name: "France",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "france--brioche-aux-epices-avec-une-garniture-mornay-de-trois-fromages", name: "Brioche aux Epices avec une Garniture Mornay de Trois Fromages", price: "$8.95", desc: "", type: "food" },
      { id: "france--trio-d-escargots-garniture-a-l-ail-et-au-persil", name: "Trio d'Escargots, Garniture a l'ail et au Persil", price: "$9.25", desc: "Three escargot bites baked in croissant dough with garlic-parsley dip.", type: "food" },
      { id: "france--boeuf-braise-vin-rouge-et-echalottes-g-teau-de-pomes-de-terre", name: "Boeuf Braise vin Rouge et Echalottes, Gâteau de Pomes de Terre", price: "$9.50", desc: "", type: "food" },
      { id: "france--cr-me-br-l-e-pistache-confiture-de-fruits-rouges", name: "Crème Brûlée Pistache, Confiture de Fruits Rouges", price: "$7.95", desc: "Pistachio crème brûlée served with berry compote.", type: "food" },
    ],
  },
  {
    id: "uk-beer-cart",
    name: "UK Beer Cart",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "uk-beer-cart--sparkling-cucumber-gin-cocktail", name: "Sparkling Cucumber-Gin Cocktail", price: "$17.50", desc: "Fords Gin, blackberry brandy, cucumber syrup, Minute Maid Premium Lemonade, and Maschio Prosecco.", type: "drink", alcoholic: true },
    ],
  },
  {
    id: "canada-popcorn-cart",
    name: "Canada Popcorn Cart",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "canada-popcorn-cart--northern-ruby", name: "Northern Ruby", price: "$17.50", desc: "Rhubarb liqueur, vodka, strawberry, ginger, and lime.", type: "drink", alcoholic: true },
    ],
  },
  {
    id: "canada",
    name: "Canada",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "canada--cheddar-and-bacon-soup", name: "Cheddar and Bacon Soup", price: "$6.29", desc: "Rich cheddar-and-bacon soup served with a pretzel roll.", type: "food" },
      { id: "canada--filet-mignon", name: "Filet Mignon", price: "$10.49", desc: "Filet mignon served with mushrooms and mashed potatoes.", type: "food" },
      { id: "canada--collective-arts-brewing-festbier", name: "Collective Arts Brewing Festbier", price: "$6.00–$9.75", desc: "Festbier from Hamilton, ON.", type: "drink", alcoholic: true },
      { id: "canada--ch-teau-des-charmes-p-tales-rouge", name: "Château des Charmes Pétales Rouge", price: "$9.50", desc: "Pétales Rouge from Niagara-on-the-Lake, ON.", type: "drink", alcoholic: true },
    ],
  },
  {
    id: "la-poutinerie-hosted-by-air-canada",
    name: "La Poutinerie Hosted by Air Canada",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "la-poutinerie-hosted-by-air-canada--seoul-south-korea-bo-ssam-pork-poutine", name: "Seoul, South Korea: Bo Ssam Pork Poutine", price: "$11.99", desc: "French fries topped with cheese curds, bo ssam pork, gochujang gravy, kimchi pickles, aioli, and sesame.", type: "food" },
    ],
  },
  {
    id: "shimmering-sips",
    name: "Shimmering Sips",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "shimmering-sips--strawberry-champagne-trifle", name: "Strawberry Champagne Trifle", price: "$5.79", desc: "Layered strawberry trifle with a light, creamy dessert presentation; plant-based.", type: "food" },
      { id: "shimmering-sips--tropical-mimosa", name: "Tropical Mimosa", price: "$7.75", desc: "Sparkling wine and Minute Maid Passion Fruit Orange Guava juice.", type: "drink", alcoholic: true },
      { id: "shimmering-sips--berry-mimosa", name: "Berry Mimosa", price: "$7.75", desc: "La Gioiosa Berry Fizz and white cranberry juice.", type: "drink", alcoholic: true },
      { id: "shimmering-sips--blood-orange-mimosa", name: "Blood Orange Mimosa", price: "$7.75", desc: "Sparkling wine and blood orange juice.", type: "drink", alcoholic: true },
      { id: "shimmering-sips--mimosa-flight", name: "Mimosa Flight", price: "$15.00", desc: "Flight of the booth's featured mimosas.", type: "drink", alcoholic: true },
    ],
  },
  {
    id: "hawai-i",
    name: "Hawai'i",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "hawai-i--slow-roasted-pork-slider", name: "Slow-roasted Pork Slider", price: "$5.99", desc: "Slow-roasted pork on a Hawaiian roll with pineapple chutney and spicy mayonnaise.", type: "food" },
      { id: "hawai-i--hawaiian-rice-bowl", name: "Hawaiian Rice Bowl", price: "$6.29", desc: "Rice bowl topped with SPAM, egg, eel sauce, spicy mayonnaise, and furikake.", type: "food" },
      { id: "hawai-i--pineapple-cheesecake", name: "Pineapple Cheesecake", price: "$5.49", desc: "Pineapple cheesecake with passion-fruit curd and macadamia nuts.", type: "food" },
      { id: "hawai-i--florida-avenue-brewing-co-lei-d-back-double-ipa", name: "Florida Avenue Brewing Co Lei'd Back Double IPA", price: "$6.00–$9.75", desc: "Double IPA from Tampa, FL.", type: "drink", alcoholic: true },
      { id: "hawai-i--florida-orange-groves-winery-sparkling-pineapple-wine", name: "Florida Orange Groves Winery Sparkling Pineapple Wine", price: "$10.00", desc: "Sparkling pineapple wine from St. Petersburg, FL.", type: "drink", alcoholic: true },
      { id: "hawai-i--o-ahu-sunrise", name: "O'ahu Sunrise", price: "$14.50", desc: "Vodka, DOLE Pineapple Juice, and grenadine.", type: "drink", alcoholic: true },
    ],
  },
  {
    id: "bramblewood-bites",
    name: "Bramblewood Bites",
    location: "Walkway (Imagination! to World Showcase)",
    opensAt: null,
    items: [
      { id: "bramblewood-bites--grilled-cider-brined-pork-tenderloin", name: "Grilled Cider-brined Pork Tenderloin", price: "$7.19", desc: "Cider-brined pork tenderloin with chili-apple butter, celeriac-apple slaw, and apple-cider gastrique.", type: "food" },
      { id: "bramblewood-bites--cast-iron-seared-river-trout", name: "Cast Iron-seared River Trout", price: "$7.29", desc: "Seared river trout with vanilla-butternut squash purée, Brussels-sprout salad, pecans, pumpkin seeds, cranberries, and maple dressing.", type: "food" },
      { id: "bramblewood-bites--br-l-ed-sweet-potatoes", name: "Brûléed Sweet Potatoes", price: "$4.99", desc: "Sweet potatoes topped with dried cranberries, walnut streusel, and orange goat cheese.", type: "food" },
      { id: "bramblewood-bites--crooked-can-brewing-company-banana-bread-german-style-wheat-beer", name: "Crooked Can Brewing Company Banana Bread German Style Wheat Beer", price: "$6.00–$9.75", desc: "Wheat beer from Winter Garden, FL.", type: "drink", alcoholic: true },
      { id: "bramblewood-bites--spiced-apple-rum-old-fashioned", name: "Spiced Apple Rum Old Fashioned", price: "$12.50", desc: "Old fashioned with Boyd & Blair rum.", type: "drink", alcoholic: true },
    ],
  },
  {
    id: "milled-mulled",
    name: "Milled & Mulled",
    location: "Walkway (Imagination! to World Showcase)",
    opensAt: null,
    items: [
      { id: "milled-mulled--butternut-squash-and-ginger-bisque", name: "Butternut Squash and Ginger Bisque", price: "$5.49", desc: "Creamy squash-and-ginger soup with cinnamon cream, toasted pumpkin seeds, and pumpkin-seed oil.", type: "food" },
      { id: "milled-mulled--freshly-baked-carrot-cake", name: "Freshly Baked Carrot Cake", price: "$4.99", desc: "Carrot cake with walnuts and cream-cheese icing.", type: "food" },
      { id: "milled-mulled--fall-fruit-cheesecake-featuring-boursin-fig-balsamic-cheese", name: "Fall Fruit Cheesecake featuring Boursin Fig & Balsamic Cheese", price: "$5.50", desc: "", type: "food" },
      { id: "milled-mulled--apple-cinnamon-and-caramel-mini-churros-sundae", name: "Apple-Cinnamon and Caramel Mini Churros Sundae", price: "$5.29", desc: "Mini churros with apple-cinnamon and caramel flavors served over vanilla gelato.", type: "food" },
      { id: "milled-mulled--keel-farms-maple-harvest-hard-cider", name: "Keel Farms Maple Harvest Hard Cider", price: "$5.75–$9.75", desc: "Hard cider from Plant City, FL.", type: "drink", alcoholic: true },
      { id: "milled-mulled--3-daughters-brewing-apple-strudel-hard-cider", name: "3 Daughters Brewing Apple Strudel Hard Cider", price: "$6.00–$9.75", desc: "Hard cider from St. Petersburg, FL.", type: "drink", alcoholic: true },
    ],
  },
  {
    id: "forest-field",
    name: "Forest & Field",
    location: "Walkway (Imagination! to World Showcase)",
    opensAt: null,
    items: [
      { id: "forest-field--spicy-black-bean-mushroom-chili", name: "Spicy Black Bean-Mushroom Chili", price: "$5.99", desc: "Plant-based chili made with black beans and mushrooms, topped with plant-based sour cream and cheddar plus cornbread croutons.", type: "food" },
      { id: "forest-field--pumpkin-mascarpone-ravioli", name: "Pumpkin-Mascarpone Ravioli", price: "$5.49", desc: "Pumpkin-mascarpone ravioli with brown-butter vinaigrette, pecorino, pomegranate, and hazelnut praline.", type: "food" },
      { id: "forest-field--schiacciata-sandwich", name: "Schiacciata Sandwich", price: "$6.29", desc: "Warm focaccia filled with mortadella, prosciutto, sun-dried peppers, arugula, stracciatella, squash mostarda, and pistachio pesto.", type: "food" },
      { id: "forest-field--brewery-ommegang-all-hallows-treat-imperial-chocolate-peanut-butter-stout", name: "Brewery Ommegang All Hallows Treat Imperial Chocolate Peanut Butter Stout", price: "$6.00–$9.75", desc: "Imperial stout from Cooperstown, NY.", type: "drink", alcoholic: true },
      { id: "forest-field--famille-hugel-classic-pinot-noir", name: "Famille Hugel Classic Pinot Noir", price: "$7.00", desc: "Pinot noir from Alsace, France.", type: "drink", alcoholic: true },
      { id: "forest-field--daou-vineyards-chardonnay", name: "Daou Vineyards Chardonnay", price: "$6.50", desc: "Chardonnay from Paso Robles, CA.", type: "drink", alcoholic: true },
    ],
  },
  {
    id: "swirled-showcase",
    name: "Swirled Showcase",
    location: "Walkway (Imagination! to World Showcase)",
    opensAt: null,
    items: [
      { id: "swirled-showcase--liquid-nitrogen-almond-truffle-mousse", name: "Liquid Nitrogen Almond Truffle Mousse", price: "$5.49", desc: "Almond truffle mousse finished with whiskey-caramel sauce.", type: "food" },
    ],
  },
];
