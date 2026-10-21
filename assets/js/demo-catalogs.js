// Sample catalogues for trying out the storefront from the admin dashboard.
// Images are generated SVG artwork, so they load even without internet access.

const DEMO_SHAPES = {
  bags: '<path d="M60 95h80l-8 70H68z" /><path d="M80 95V80a20 20 0 0 1 40 0v15" fill="none" stroke-width="5"/>',
  shoes: '<path d="M45 140c0-15 10-30 25-30l25 10 40 5c15 2 22 10 22 20v5H45z" />',
  "ready-to-wear": '<path d="M78 55l22 10 22-10 28 22-12 18-12-8v80H74V87l-12 8-12-18z" />',
  accessories: '<path d="M55 115a45 45 0 0 1 90 0z" /><rect x="50" y="113" width="100" height="12" rx="4"/>',
  swimwear: '<path d="M75 60h12l13 30 13-30h12l-5 50 15 45H65l15-45z" />'
};

function demoImage(name, universe, category, variant) {
  const accent = UNIVERSES[universe].accent;
  const tones = ["#151515", "#2a2622", "#f1ece4", "#e4ddd2"];
  const bg = tones[variant % tones.length];
  const ink = variant % tones.length < 2 ? "#f2efe9" : "#151515";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 250">
    <defs><radialGradient id="g" cx="70%" cy="25%" r="80%"><stop offset="0" stop-color="${accent}" stop-opacity=".75"/><stop offset="1" stop-color="${bg}"/></radialGradient></defs>
    <rect width="200" height="250" fill="url(#g)"/>
    <g fill="${ink}" stroke="${ink}" opacity=".9" transform="translate(0 10)">${DEMO_SHAPES[category]}</g>
    <text x="100" y="228" fill="${ink}" font-family="Georgia, serif" font-size="11" letter-spacing="3" text-anchor="middle">${name.length > 20 ? name.toUpperCase().slice(0, 19) + "…" : name.toUpperCase()}</text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

const DEMO_WORDS = {
  noir: ["Obsidian", "Midnight", "Onyx", "Shadow", "Velvet", "Eclipse"],
  savanna: ["Maasai", "Amber", "Acacia", "Dune", "Ochre", "Serengeti"],
  neon: ["Volt", "Pulse", "Circuit", "Glitch", "Static", "Laser"],
  riviera: ["Azure", "Coral", "Lagoon", "Malindi", "Tide", "Lamu"]
};

const DEMO_ITEMS = {
  "ready-to-wear": [["Blazer", 14500], ["Trench Coat", 22000], ["Slip Dress", 8900], ["Knit Sweater", 6400], ["Pleated Trousers", 7200]],
  bags: [["Tote", 9800], ["Shoulder Bag", 12500], ["Mini Clutch", 4300], ["Crossbody", 7600]],
  shoes: [["Loafers", 11800], ["Ankle Boots", 16900], ["Runners", 9400], ["Slides", 3200]],
  accessories: [["Cap", 1800], ["Silk Scarf", 3600], ["Leather Belt", 4100], ["Sunglasses", 5200]],
  swimwear: [["Swimsuit", 4200], ["Swim Shorts", 3100]]
};

const DEMO_SIZES = {
  "ready-to-wear": ["XS", "S", "M", "L", "XL"],
  bags: ["One size"],
  shoes: ["38", "39", "40", "41", "42", "43", "44"],
  accessories: ["One size"],
  swimwear: ["S", "M", "L"]
};

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function makeDemoProduct(word, item, price, universe, category, gender, variant, extra = {}) {
  const name = `${word} ${item}`;
  return {
    id: slugify(name) + "-" + variant,
    name,
    price,
    gender,
    category,
    universe,
    isNew: variant % 3 === 0,
    image: demoImage(name, universe, category, variant),
    sizes: DEMO_SIZES[category],
    colors: ["Black", "Ivory", "Sand"].slice(0, 1 + (variant % 3)),
    description: `${name} from the ${UNIVERSES[universe].name} universe. ${UNIVERSES[universe].tagline}`,
    ...extra
  };
}

// A full store: every universe x category combination, with varied prices.
function fullDemoCatalog() {
  const genders = ["women", "men", "unisex"];
  const items = [];
  let variant = 0;
  Object.keys(UNIVERSES).forEach(universe => {
    Object.entries(DEMO_ITEMS).forEach(([category, list]) => {
      list.slice(0, category === "ready-to-wear" ? 3 : category === "swimwear" ? 1 : 2).forEach(([item, price]) => {
        const word = DEMO_WORDS[universe][variant % DEMO_WORDS[universe].length];
        const gender = category === "swimwear" ? (variant % 2 ? "women" : "men") : genders[variant % 3];
        items.push(makeDemoProduct(word, item, price + (variant % 5) * 350, universe, category, gender, variant));
        variant++;
      });
    });
  });
  return items;
}

// A small boutique: just a few pieces, to see how sparse pages look.
function boutiqueDemoCatalog() {
  return [
    makeDemoProduct("Onyx", "Tote", 9800, "noir", "bags", "women", 0),
    makeDemoProduct("Amber", "Loafers", 11800, "savanna", "shoes", "men", 1),
    makeDemoProduct("Azure", "Silk Scarf", 3600, "riviera", "accessories", "unisex", 2),
    makeDemoProduct("Volt", "Blazer", 14500, "neon", "ready-to-wear", "unisex", 3)
  ];
}

// Awkward data that tends to break layouts: long names, huge prices,
// broken images, empty descriptions and a universe with only one piece.
function stressDemoCatalog() {
  return [
    makeDemoProduct("Obsidian", "Hand-Stitched Double-Faced Cashmere Overcoat With Detachable Collar", 1250000, "noir", "ready-to-wear", "men", 0),
    makeDemoProduct("Pulse", "Cap", 1, "neon", "accessories", "unisex", 1),
    makeDemoProduct("Coral", "Swimsuit", 4200, "riviera", "swimwear", "women", 2, { image: "https://invalid.example/broken.jpg", description: "" }),
    makeDemoProduct("Dune", "Runners", 9400, "savanna", "shoes", "unisex", 3, { sizes: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47"] }),
    makeDemoProduct("Eclipse", "Mini Clutch", 4300, "noir", "bags", "women", 4, { colors: ["Black", "Ivory", "Sand", "Oxblood", "Forest", "Navy"] }),
    makeDemoProduct("Shadow", "Tote", 9800, "noir", "bags", "women", 5, { image: "" })
  ];
}

const DEMO_CATALOGS = {
  full: { label: "Full store (40 pieces)", build: fullDemoCatalog },
  boutique: { label: "Small boutique (4 pieces)", build: boutiqueDemoCatalog },
  stress: { label: "Stress test (awkward data)", build: stressDemoCatalog }
};
