// src/foodWineData.js
//
// 2026 EPCOT International Food & Wine Festival — booth + menu data.
// Source: BlogMickey, "FULL LIST of 2026 EPCOT Food & Wine Festival Menus
// (With Prices)", published August 19, 2026.
// https://blogmickey.com/2026/08/full-list-of-2026-epcot-food-wine-festival-menus/
//
// Item descriptions are concise paraphrases of the source's ingredient
// descriptions; a few items (the two unlisted France entries and the
// Milled & Mulled fall fruit cheesecake) had no description in the
// source and are left blank rather than invented.
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
      { id: "the-wedge-hosted-by-dairy-does-more--crab-and-corn-macaroni-and-cheese", name: "Crab and Corn Macaroni and Cheese", price: "$7.19", desc: "Mac and cheese with crab seasoning, roasted corn, bacon, smoked-cheddar sauce, herbed panko, and jalapeño." },
      { id: "the-wedge-hosted-by-dairy-does-more--cheesesteak-macaroni-and-cheese", name: "Cheesesteak Macaroni and Cheese", price: null, desc: "Smoked-cheddar mac and cheese topped with shaved beef, peppers, onions, and herbed panko." },
    ],
  },
  {
    id: "festival-favorites",
    name: "Festival Favorites",
    location: "CommuniCore Hall",
    opensAt: "2026-09-09",
    items: [
      { id: "festival-favorites--potato-pierogi", name: "Potato Pierogi", price: "$5.99", desc: "Potato-filled pierogi served with kielbasa, caramelized onions, and sour cream." },
      { id: "festival-favorites--bo-ssam-pork-belly-lettuce-wraps", name: "Bo Ssam Pork Belly Lettuce Wraps", price: "$6.19", desc: "Tender bo ssam-style pork belly with kimchi slaw and spicy aioli, served as lettuce wraps." },
      { id: "festival-favorites--pumpkin-cheesecake-mousse-trifle", name: "Pumpkin Cheesecake Mousse Trifle", price: "$5.29", desc: "Layers of pumpkin cheesecake mousse, citrus sauce, and spiced cake finished with cranberry streusel." },
    ],
  },
  {
    id: "brew-wing-lab-at-the-odyssey",
    name: "Brew-Wing Lab at The Odyssey",
    location: "World Celebration",
    opensAt: null,
    items: [
      { id: "brew-wing-lab-at-the-odyssey--garlic-parmesan", name: "Garlic-Parmesan", price: "$7.79", desc: "Chicken wing coated in garlic-Parmesan seasoning and sauce." },
      { id: "brew-wing-lab-at-the-odyssey--buffalo-dill-pickle", name: "Buffalo-Dill Pickle", price: "$7.79", desc: "Buffalo-style wing with dill-pickle flavor and house-made pickle ranch." },
      { id: "brew-wing-lab-at-the-odyssey--korean-barbecue", name: "Korean Barbecue", price: "$7.79", desc: "Wing tossed with Korean barbecue sauce and toasted sesame." },
      { id: "brew-wing-lab-at-the-odyssey--carolina-reaper-pepper-curry", name: "Carolina Reaper Pepper-Curry", price: "$7.79", desc: "Very spicy curry-seasoned wing made with Carolina Reaper pepper and served with cooling cucumber raita." },
      { id: "brew-wing-lab-at-the-odyssey--sweet-chile-lime-plant-based-chicken-strips", name: "Sweet Chile-Lime Plant-based Chicken Strips", price: "$7.79", desc: "Plant-based chicken strips with sweet chile-lime flavor, cilantro crema, and spicy peppers." },
      { id: "brew-wing-lab-at-the-odyssey--fried-pickle-spears", name: "Fried Pickle Spears", price: "$5.79", desc: "Crispy fried dill-pickle spears served with dill ranch." },
    ],
  },
  {
    id: "connections-eatery",
    name: "Connections Eatery",
    location: "World Celebration",
    opensAt: null,
    items: [
      { id: "connections-eatery--bbq-braai-chicken-pizza", name: "BBQ Braai Chicken Pizza", price: "$12.29", desc: "Two pizza slices topped with tamarind barbecue, arugula, cheese, onions, and piri piri sauce." },
      { id: "connections-eatery--caramel-apple-cheesecake-baumkuchen", name: "Caramel-Apple Cheesecake Baumkuchen", price: "$6.49", desc: "Layered German-style cake with caramel-apple cheesecake flavors." },
      { id: "connections-eatery--frozen-waffle-old-fashioned", name: "Frozen Waffle Old Fashioned", price: "$17.50", desc: "A frozen blend of Maker’s Mark Kentucky Straight Bourbon Whisky, maple syrup, butterscotch syrup, and angostura bitters topped with a liege waffle and cherry" },
    ],
  },
  {
    id: "connections-caf",
    name: "Connections Café",
    location: "World Celebration",
    opensAt: null,
    items: [
      { id: "connections-caf--pistachio-chocolate-mochi-doughnut", name: "Pistachio-Chocolate Mochi Doughnut", price: "$5.29", desc: "Chewy mochi doughnut combining pistachio and chocolate flavors." },
    ],
  },
  {
    id: "coastal-eats",
    name: "Coastal Eats",
    location: "World Discovery",
    opensAt: "2026-10-02",
    items: [
      { id: "coastal-eats--crab-cake", name: "Crab Cake", price: "$7.49", desc: "Crab cake paired with tropical fruit chutney, mustard sauce, and micro celery." },
      { id: "coastal-eats--seafood-pot-pie", name: "Seafood Pot Pie", price: "$7.49", desc: "Shrimp and scallops in lobster bisque under a puff-pastry topping." },
    ],
  },
  {
    id: "gyozas-of-the-galaxy",
    name: "Gyozas of the Galaxy",
    location: "World Discovery",
    opensAt: null,
    items: [
      { id: "gyozas-of-the-galaxy--basil-pesto-chicken-dumplings", name: "Basil Pesto Chicken Dumplings", price: "$5.99", desc: "Chicken dumplings with basil pesto, creamy fonduta, tomato confit, and balsamic." },
      { id: "gyozas-of-the-galaxy--street-corn-style-dumplings", name: "Street Corn-style Dumplings", price: "$5.99", desc: "Chicken dumplings with tomatillo salsa verde, street-corn salad, cotija, lime crema, and cilantro." },
      { id: "gyozas-of-the-galaxy--edamame-dumplings", name: "Edamame Dumplings", price: "$5.29", desc: "Dumplings served with butternut-squash purée, caramelized onions, sage, and walnut-garlic sauce." },
    ],
  },
  {
    id: "flavors-from-fire",
    name: "Flavors from Fire",
    location: "World Discovery",
    opensAt: null,
    items: [
      { id: "flavors-from-fire--rodizio-style-grilled-beef-skewer", name: "Rodizio-style Grilled Beef Skewer", price: "$6.99", desc: "Grilled beef skewer with marble potatoes, charred shallots, baby peppers, and chimichurri." },
      { id: "flavors-from-fire--smoked-corned-beef", name: "Smoked Corned Beef", price: "$6.49", desc: "Smoked corned beef with house-made potato chips, cheese curds, pickled onions, and beer-cheese fondue." },
      { id: "flavors-from-fire--smoked-chocolate-bread-pudding", name: "Smoked Chocolate Bread Pudding", price: "$4.99", desc: "Chocolate bread pudding with chocolate ganache, vanilla-bean bourbon sauce, and smoked sea salt." },
    ],
  },
  {
    id: "the-fry-basket",
    name: "The Fry Basket",
    location: "World Discovery",
    opensAt: null,
    items: [
      { id: "the-fry-basket--adobo-yuca-fries", name: "Adobo Yuca Fries", price: "$5.79", desc: "Crispy yuca fries with plant-based garlic-cilantro aioli." },
      { id: "the-fry-basket--fry-flight", name: "Fry Flight", price: "$7.99", desc: "Three fry styles: sea-salt malt-vinegar, truffle-Parmesan, and sweet-potato casserole-inspired fries." },
    ],
  },
  {
    id: "earth-eats",
    name: "Earth Eats",
    location: "World Nature",
    opensAt: "2026-10-02",
    items: [
      { id: "earth-eats--red-wine-braised-beef-short-rib", name: "Red Wine-braised Beef Short Rib", price: "$8.49", desc: "Braised beef short rib with goat-cheese polenta, tomato ragù, pecorino, and herbs." },
      { id: "earth-eats--lemon-almond-olive-oil-cake", name: "Lemon-Almond-Olive Oil Cake", price: "$4.49", desc: "Moist lemon, almond, and olive-oil cake served with whipped Greek-yogurt panna cotta." },
    ],
  },
  {
    id: "sunshine-seasons",
    name: "Sunshine Seasons",
    location: "World Nature",
    opensAt: null,
    items: [
      { id: "sunshine-seasons--mickey-shaped-celebration-macaron", name: "Mickey-shaped Celebration Macaron", price: "$6.29", desc: "A Mickey-shaped macaron celebrating the festival anniversary." },
      { id: "sunshine-seasons--remy-milk-shake", name: "Remy Milk Shake", price: "$10.50", desc: "Strawberry-cheesecake milk shake topped with a cookie, mini cheesecake, white-chocolate Eiffel Tower, and strawberry." },
    ],
  },
  {
    id: "australia",
    name: "Australia",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "australia--grilled-bushberry-spiced-shrimp-skewer", name: "Grilled Bushberry-spiced Shrimp Skewer", price: "$6.99", desc: "Grilled shrimp seasoned with bushberry spices, served with sweet-and-sour vegetables and coconut-chili sauce." },
      { id: "australia--roasted-lamb-chop", name: "Roasted Lamb Chop", price: "$8.79", desc: "Roasted lamb chop with mint pesto and crushed salt-and-vinegar potato chips." },
      { id: "australia--mixed-berry-pavlova", name: "Mixed Berry Pavlova", price: "$4.79", desc: "Crisp meringue shell filled with macerated mixed berries and whipped cream." },
    ],
  },
  {
    id: "mexico",
    name: "Mexico",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "mexico--tostada-de-osso-buco", name: "Tostada de Osso Buco", price: "$8.25", desc: "Pork osso buco on a fried corn tortilla with chipotle black beans, salsa verde, queso fresco, and chives." },
      { id: "mexico--taco-de-camaron", name: "Taco de Camaron", price: "$8.50", desc: "Crispy tempura shrimp in a flour tortilla with shredded cabbage and chipotle aioli." },
      { id: "mexico--paleta-de-moras", name: "Paleta de Moras", price: "$7.00", desc: "Berry ice pop filled with sweetened condensed milk and finished with chili-lime seasoning." },
    ],
  },
  {
    id: "norway-cart",
    name: "Norway Cart",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "norway-cart--caramel-cream-and-gjetost-norwegian-brown-cheese-bolle", name: "Caramel Cream and Gjetost Norwegian Brown Cheese Bolle", price: null, desc: "Sweet Norwegian bread roll filled with caramel cream and tangy brown gjetost cheese." },
    ],
  },
  {
    id: "china",
    name: "China",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "china--dumplings-trio", name: "Dumplings Trio", price: "$7.35", desc: "Three pan-fried dumplings—chicken, pork, and vegetable—with sweet-and-spicy sauce." },
      { id: "china--smoked-duck-bao-bun", name: "Smoked Duck Bao Bun", price: "$8.25", desc: "Smoked duck in a steamed bao with pickled cucumber, scallion, and hoisin." },
      { id: "china--beijing-zhajiang-noodles", name: "Beijing Zhajiang Noodles", price: "$8.50", desc: "Stir-fried noodles with minced beef, cucumber, chili, carrots, and savory douban sauce." },
    ],
  },
  {
    id: "india",
    name: "India",
    location: "World Showcase",
    opensAt: "2026-10-02",
    items: [
      { id: "india--potato-pea-samosas", name: "Potato-Pea Samosas", price: "$5.49", desc: "Crisp plant-based samosas filled with potato and peas, served with coriander-lime cream." },
      { id: "india--chicken-tikka-masala", name: "Chicken Tikka Masala", price: "$6.49", desc: "Chicken tikka in a spiced tomato-style sauce with fennel-seasoned yogurt and naan." },
    ],
  },
  {
    id: "refreshment-outpost",
    name: "Refreshment Outpost",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "refreshment-outpost--berbere-spiced-beef-stew", name: "Berbere-spiced Beef Stew", price: "$6.79", desc: "Berbere-seasoned beef stew served with sweet-potato mealie pap and kachumbari slaw." },
      { id: "refreshment-outpost--sweet-potato-mealie-pap", name: "Sweet Potato Mealie Pap", price: "$5.79", desc: "Plant-based stew of beans, peppers, carrots, and tomatoes served with sweet-potato mealie pap." },
      { id: "refreshment-outpost--south-african-cream-liqueur-chocolate-mousse", name: "South African Cream Liqueur Chocolate Mousse", price: "$6.29", desc: "Chocolate mousse made with South African cream liqueur, white-chocolate ganache, and chocolate popping candy." },
      { id: "refreshment-outpost--dole-whip-in-a-cone", name: "DOLE Whip in a Cone", price: "$6.29", desc: "Soft-serve DOLE Whip served in a cone." },
    ],
  },
  {
    id: "the-alps",
    name: "The Alps",
    location: "World Showcase",
    opensAt: "2026-10-02",
    items: [
      { id: "the-alps--warm-raclette-swiss-cheese", name: "Warm Raclette Swiss Cheese", price: "$6.79", desc: "Melted Swiss raclette over a baguette with ham and apple-mustard relish." },
      { id: "the-alps--tartiflette", name: "Tartiflette", price: "$5.49", desc: "French Alpine potato gratin with caramelized onions, bacon, thyme, crème fraîche, and Brie." },
      { id: "the-alps--kirschwasser-torte", name: "Kirschwasser Torte", price: "$5.49", desc: "Cherry-brandy cake with buttercream, fondant, sugared almonds, and cherry compote." },
    ],
  },
  {
    id: "germany",
    name: "Germany",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "germany--schinkennudeln", name: "Schinkennudeln", price: "$5.29", desc: "German baked pasta with ham, onions, and cheese." },
      { id: "germany--wiener-schnitzel", name: "Wiener Schnitzel", price: "$7.29", desc: "Breaded veal cutlet with mustard, warm potato salad, bacon, watercress-radish salad, and lemon." },
      { id: "germany--apple-strudel", name: "Apple Strudel", price: "$4.99", desc: "Classic apple strudel served with vanilla sauce." },
    ],
  },
  {
    id: "sommerfest",
    name: "Sommerfest",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "sommerfest--zwiebelkuchen", name: "Zwiebelkuchen", price: "$9.79", desc: "German savory onion cake with caramelized onions, bacon, herbs, and custard." },
    ],
  },
  {
    id: "spain",
    name: "Spain",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "spain--croquetas-de-jam-n", name: "Croquetas de Jamón", price: "$6.99", desc: "Crispy ham croquettes served with saffron aioli and shaved Jamón Serrano." },
      { id: "spain--paella-caldoso", name: "Paella Caldoso", price: "$7.99", desc: "Brothy saffron rice with chicken, chorizo, and beans." },
      { id: "spain--basque-cheesecake", name: "Basque Cheesecake", price: "$5.29", desc: "Creamy Basque-style cheesecake served with orange sauce." },
    ],
  },
  {
    id: "italy",
    name: "Italy",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "italy--stromboli", name: "Stromboli", price: "$8.00", desc: "Baked roll filled with ham and provolone, served with Parmesan and tomato sauce." },
      { id: "italy--pollo-al-marsala", name: "Pollo al Marsala", price: "$9.00", desc: "Roasted chicken with creamy potato gnocchi, mushrooms, and Marsala sauce." },
      { id: "italy--almond-panna-cotta", name: "Almond Panna Cotta", price: "$6.00", desc: "Panna cotta with almond flavor, orange marmalade, whipped cream, and candied almonds." },
    ],
  },
  {
    id: "block-and-hans-american-adventure",
    name: "Block and Hans (American Adventure)",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "block-and-hans-american-adventure--spicy-strawberry-mango-smoothie", name: "Spicy Strawberry-Mango Smoothie", price: "$6.29", desc: "Strawberry smoothie blended with spicy mango syrup." },
    ],
  },
  {
    id: "regal-eagle-smokehouse-american-adventure",
    name: "Regal Eagle Smokehouse (American Adventure)",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "regal-eagle-smokehouse-american-adventure--blackberry-buckle", name: "Blackberry Buckle", price: "$4.79", desc: "Warm-style blackberry dessert paired with blackberry gelato and streusel." },
      { id: "regal-eagle-smokehouse-american-adventure--pumpkin-pie-milk-shake", name: "Pumpkin Pie Milk Shake", price: "$6.79", desc: "Vanilla ice cream blended with pumpkin-pie filling and caramel, topped with whipped cream and streusel." },
    ],
  },
  {
    id: "hops-barley",
    name: "Hops & Barley",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "hops-barley--gulf-coast-style-seafood-roll", name: "Gulf Coast-style Seafood Roll", price: "$8.99", desc: "Warm-water lobster and rock shrimp with lobster bisque and sherry crème fraîche on toasted brioche." },
      { id: "hops-barley--smoked-brisket-and-cheddar-melt", name: "Smoked Brisket and Cheddar Melt", price: "$6.49", desc: "Chopped smoked brisket with caramelized onions, barbecue sauce, and cheddar on a potato roll." },
      { id: "hops-barley--freshly-baked-chocolate-pudding-cake", name: "Freshly Baked Chocolate Pudding Cake", price: "$4.99", desc: "Chocolate pudding cake finished with Kentucky bourbon caramel." },
    ],
  },
  {
    id: "funnel-cake",
    name: "Funnel Cake",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "funnel-cake--pumpkin-pie-funnel-cake", name: "Pumpkin Pie Funnel Cake", price: "$12.50", desc: "Funnel cake topped with pumpkin-pie ice cream, whipped cream, dark-chocolate sauce, cinnamon streusel, and powdered sugar." },
    ],
  },
  {
    id: "japan",
    name: "Japan",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "japan--spicy-temaki-hand-roll", name: "Spicy Temaki Hand Roll", price: "$9.00", desc: "Temaki hand roll with spicy tuna, cucumber, rice cracker, and spicy mayonnaise." },
      { id: "japan--beef-wagyu-temaki-hand-roll", name: "Beef Wagyu Temaki Hand Roll", price: "$10.25", desc: "Temaki hand roll with savory American Wagyu beef, pickled ginger, and spicy mayonnaise." },
      { id: "japan--teriyaki-chicken-bun", name: "Teriyaki Chicken Bun", price: "$8.00", desc: "Steamed bun filled with minced chicken, vegetables, and teriyaki sauce." },
    ],
  },
  {
    id: "greece",
    name: "Greece",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "greece--spanakopita", name: "Spanakopita", price: "$5.19", desc: "Greek pastry filled with seasoned spinach and cheese." },
      { id: "greece--griddled-cheese", name: "Griddled Cheese", price: "$5.49", desc: "Griddled cheese served with pistachios and honey." },
      { id: "greece--chicken-souvlaki-gyro", name: "Chicken Souvlaki Gyro", price: "$6.99", desc: "Chicken souvlaki with lettuce, tomato-cucumber relish, and tzatziki in warm pita." },
    ],
  },
  {
    id: "tangierine-caf-flavors-of-the-medina",
    name: "Tangierine Café: Flavors of the Medina",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "tangierine-caf-flavors-of-the-medina--plant-based-falafel-wrap", name: "Plant-based Falafel Wrap", price: "$6.29", desc: "Plant-based falafel with tomato-cucumber relish and garlic sauce in Moroccan flatbread." },
      { id: "tangierine-caf-flavors-of-the-medina--chermoula-chicken-hummus-bowl", name: "Chermoula Chicken Hummus Bowl", price: "$6.79", desc: "Hummus bowl topped with chermoula chicken, apricot chutney, shishito peppers, and pita." },
      { id: "tangierine-caf-flavors-of-the-medina--spiced-flank-steak-hummus-bowl", name: "Spiced Flank Steak Hummus Bowl", price: "$7.29", desc: "Hummus bowl with spiced flank steak, harissa yogurt, roasted peppers, and pita." },
      { id: "tangierine-caf-flavors-of-the-medina--ras-el-hanout-cauliflower-bowl", name: "Ras el Hanout Cauliflower Bowl", price: "$6.49", desc: "Roasted cauliflower and chickpea salad with golden-raisin relish and parsley, served with pita." },
      { id: "tangierine-caf-flavors-of-the-medina--chocolate-pistachio-cookie", name: "Chocolate-Pistachio Cookie", price: "$4.29", desc: "Cookie combining rich chocolate and pistachio flavors." },
    ],
  },
  {
    id: "belgium",
    name: "Belgium",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "belgium--beer-braised-beef", name: "Beer-braised Beef", price: "$6.79", desc: "Beef braised in beer and served with smoked Gouda mashed potatoes." },
      { id: "belgium--belgian-waffle", name: "Belgian Waffle", price: "$5.49", desc: "Belgian-style waffle topped with cookie butter, whipped cream, and speculoos pieces." },
    ],
  },
  {
    id: "brazil",
    name: "Brazil",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "brazil--p-o-de-queijo", name: "Pão de Queijo", price: "$5.19", desc: "Brazilian cheese bread with a chewy, cheesy center." },
      { id: "brazil--moqueca-de-camar-o", name: "Moqueca de Camarão", price: "$6.99", desc: "Shrimp, peppers, cilantro, and tomatoes simmered in a rich coconut-milk broth, served with rice." },
    ],
  },
  {
    id: "france",
    name: "France",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "france--brioche-aux-epices-avec-une-garniture-mornay-de-trois-fromages", name: "Brioche aux Epices avec une Garniture Mornay de Trois Fromages", price: "$8.95", desc: "" },
      { id: "france--trio-d-escargots-garniture-a-l-ail-et-au-persil", name: "Trio d'Escargots, Garniture a l'ail et au Persil", price: "$9.25", desc: "Three escargot bites baked in croissant dough with garlic-parsley dip." },
      { id: "france--boeuf-braise-vin-rouge-et-echalottes-g-teau-de-pomes-de-terre", name: "Boeuf Braise vin Rouge et Echalottes, Gâteau de Pomes de Terre", price: "$9.50", desc: "" },
      { id: "france--cr-me-br-l-e-pistache-confiture-de-fruits-rouges", name: "Crème Brûlée Pistache, Confiture de Fruits Rouges", price: "$7.95", desc: "Pistachio crème brûlée served with berry compote." },
    ],
  },
  {
    id: "canada",
    name: "Canada",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "canada--cheddar-and-bacon-soup", name: "Cheddar and Bacon Soup", price: "$6.29", desc: "Rich cheddar-and-bacon soup served with a pretzel roll." },
      { id: "canada--filet-mignon", name: "Filet Mignon", price: "$10.49", desc: "Filet mignon served with mushrooms and mashed potatoes." },
    ],
  },
  {
    id: "la-poutinerie-hosted-by-air-canada",
    name: "La Poutinerie Hosted by Air Canada",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "la-poutinerie-hosted-by-air-canada--seoul-south-korea-bo-ssam-pork-poutine", name: "Seoul, South Korea: Bo Ssam Pork Poutine", price: "$11.99", desc: "French fries topped with cheese curds, bo ssam pork, gochujang gravy, kimchi pickles, aioli, and sesame." },
    ],
  },
  {
    id: "shimmering-sips",
    name: "Shimmering Sips",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "shimmering-sips--strawberry-champagne-trifle", name: "Strawberry Champagne Trifle", price: "$5.79", desc: "Layered strawberry trifle with a light, creamy dessert presentation; plant-based." },
    ],
  },
  {
    id: "hawai-i",
    name: "Hawai'i",
    location: "World Showcase",
    opensAt: null,
    items: [
      { id: "hawai-i--slow-roasted-pork-slider", name: "Slow-roasted Pork Slider", price: "$5.99", desc: "Slow-roasted pork on a Hawaiian roll with pineapple chutney and spicy mayonnaise." },
      { id: "hawai-i--hawaiian-rice-bowl", name: "Hawaiian Rice Bowl", price: "$6.29", desc: "Rice bowl topped with SPAM, egg, eel sauce, spicy mayonnaise, and furikake." },
      { id: "hawai-i--pineapple-cheesecake", name: "Pineapple Cheesecake", price: "$5.49", desc: "Pineapple cheesecake with passion-fruit curd and macadamia nuts." },
    ],
  },
  {
    id: "bramblewood-bites",
    name: "Bramblewood Bites",
    location: "Walkway (Imagination! to World Showcase)",
    opensAt: null,
    items: [
      { id: "bramblewood-bites--grilled-cider-brined-pork-tenderloin", name: "Grilled Cider-brined Pork Tenderloin", price: "$7.19", desc: "Cider-brined pork tenderloin with chili-apple butter, celeriac-apple slaw, and apple-cider gastrique." },
      { id: "bramblewood-bites--cast-iron-seared-river-trout", name: "Cast Iron-seared River Trout", price: "$7.29", desc: "Seared river trout with vanilla-butternut squash purée, Brussels-sprout salad, pecans, pumpkin seeds, cranberries, and maple dressing." },
      { id: "bramblewood-bites--br-l-ed-sweet-potatoes", name: "Brûléed Sweet Potatoes", price: "$4.99", desc: "Sweet potatoes topped with dried cranberries, walnut streusel, and orange goat cheese." },
    ],
  },
  {
    id: "milled-mulled",
    name: "Milled & Mulled",
    location: "Walkway (Imagination! to World Showcase)",
    opensAt: null,
    items: [
      { id: "milled-mulled--butternut-squash-and-ginger-bisque", name: "Butternut Squash and Ginger Bisque", price: "$5.49", desc: "Creamy squash-and-ginger soup with cinnamon cream, toasted pumpkin seeds, and pumpkin-seed oil." },
      { id: "milled-mulled--freshly-baked-carrot-cake", name: "Freshly Baked Carrot Cake", price: "$4.99", desc: "Carrot cake with walnuts and cream-cheese icing." },
      { id: "milled-mulled--fall-fruit-cheesecake-featuring-boursin-fig-balsamic-cheese", name: "Fall Fruit Cheesecake featuring Boursin Fig & Balsamic Cheese", price: "$5.50", desc: "" },
      { id: "milled-mulled--apple-cinnamon-and-caramel-mini-churros-sundae", name: "Apple-Cinnamon and Caramel Mini Churros Sundae", price: "$5.29", desc: "Mini churros with apple-cinnamon and caramel flavors served over vanilla gelato." },
    ],
  },
  {
    id: "forest-field",
    name: "Forest & Field",
    location: "Walkway (Imagination! to World Showcase)",
    opensAt: null,
    items: [
      { id: "forest-field--spicy-black-bean-mushroom-chili", name: "Spicy Black Bean-Mushroom Chili", price: "$5.99", desc: "Plant-based chili made with black beans and mushrooms, topped with plant-based sour cream and cheddar plus cornbread croutons." },
      { id: "forest-field--pumpkin-mascarpone-ravioli", name: "Pumpkin-Mascarpone Ravioli", price: "$5.49", desc: "Pumpkin-mascarpone ravioli with brown-butter vinaigrette, pecorino, pomegranate, and hazelnut praline." },
      { id: "forest-field--schiacciata-sandwich", name: "Schiacciata Sandwich", price: "$6.29", desc: "Warm focaccia filled with mortadella, prosciutto, sun-dried peppers, arugula, stracciatella, squash mostarda, and pistachio pesto." },
    ],
  },
  {
    id: "swirled-showcase",
    name: "Swirled Showcase",
    location: "Walkway (Imagination! to World Showcase)",
    opensAt: null,
    items: [
      { id: "swirled-showcase--liquid-nitrogen-almond-truffle-mousse", name: "Liquid Nitrogen Almond Truffle Mousse", price: "$5.49", desc: "Almond truffle mousse finished with whiskey-caramel sauce." },
    ],
  },
];
