// Catalogue data shared by every page. Prices are in Kenyan shillings.
const UNIVERSES = {
  noir:    { name: "Noir",      tagline: "Midnight tailoring, sharp leather, absolute black.", accent: "#c9a86a" },
  savanna: { name: "Savanna",   tagline: "Earth tones and heritage craft from the highlands.",  accent: "#b5652b" },
  neon:    { name: "Neon Edge", tagline: "Streetwear wired for the city after dark.",          accent: "#7cff6b" },
  riviera: { name: "Riviera",   tagline: "Resort silhouettes for sun, salt and slow days.",    accent: "#3d8fd1" }
};

// The original catalogue. The admin dashboard can replace it with a saved
// catalogue in localStorage; see loadCatalog() below.
const DEFAULT_PRODUCTS = [
  {
    id: "treq-leather-bag", name: "Treq Leather Bag", price: 1500,
    gender: "unisex", category: "bags", universe: "noir", isNew: true,
    image: "https://5.imimg.com/data5/SELLER/Default/2023/11/363761195/FK/YL/MC/188692646/881d463b-d215-44c2-b975-61da4b959f4a-1000x1000.webp",
    sizes: ["One size"], colors: ["Black", "Cognac"],
    description: "Structured full-grain leather carryall with a hand-stitched handle and brushed hardware."
  },
  {
    id: "timberland-boots", name: "Timberland Boots", price: 75500,
    gender: "men", category: "shoes", universe: "savanna",
    image: "https://www.timberland.com.sg/wp-content/uploads/product/f23/A5RJD231-HERO-768x768.jpg",
    sizes: ["40", "41", "42", "43", "44", "45"], colors: ["Wheat"],
    description: "Waterproof nubuck boot with padded collar and lug sole, built for the long road."
  },
  {
    id: "mea-culpa-beanie", name: "Mea Culpa Beanie", price: 500,
    gender: "men", category: "accessories", universe: "neon", isNew: true,
    image: "https://y2k-wave.com/cdn/shop/files/4_1091c7fe-e3e9-4ab7-aa5b-e8f3c927a999.png?v=1699029177",
    sizes: ["One size"], colors: ["Black", "Grey"],
    description: "Rib-knit beanie with an embroidered patch. Soft, warm, a little rebellious."
  },
  {
    id: "treq-sneakers", name: "Treq Sneakers", price: 10200,
    gender: "unisex", category: "shoes", universe: "neon",
    image: "https://www.zaqq.com/cdn/shop/files/2_4b49ffdd-de3c-43c6-8312-0ef8aa1ce427.jpg?v=1731746721&width=1445",
    sizes: ["38", "39", "40", "41", "42", "43", "44"], colors: ["White", "Black"],
    description: "Low-top sneaker with a cushioned sole and minimalist upper for all-day wear."
  },
  {
    id: "okala", name: "Okala", price: 150,
    gender: "women", category: "accessories", universe: "savanna",
    image: "https://static.wixstatic.com/media/29e227_3c0017babead4168acfbf4e6fb5a7ee4~mv2.jpg/v1/fill/w_480,h_452,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/29e227_3c0017babead4168acfbf4e6fb5a7ee4~mv2.jpg",
    sizes: ["One size"], colors: ["Multi"],
    description: "Handmade accent piece in vivid colour, crafted by local artisans."
  },
  {
    id: "elegant-dress", name: "Elegant Dress", price: 3500,
    gender: "women", category: "ready-to-wear", universe: "noir", isNew: true,
    image: "https://i.ebayimg.com/images/g/4QcAAOSwo6Vk70Mq/s-l1600.webp",
    sizes: ["XS", "S", "M", "L", "XL"], colors: ["Black"],
    description: "Fluid evening dress with a sculpted waist and floor-sweeping hem."
  },
  {
    id: "swimming-suit", name: "Swimming Suit", price: 300,
    gender: "women", category: "swimwear", universe: "riviera",
    image: "https://image.kilimall.com/kenya/shop/store/goods/1842/2017/05/1842_05495489084265546.jpg",
    sizes: ["S", "M", "L"], colors: ["Azure"],
    description: "Quick-dry one-piece with a clean neckline, made for the coast."
  },
  {
    id: "luxury-handbag", name: "Luxury Handbag", price: 5500,
    gender: "women", category: "bags", universe: "noir",
    image: "https://5.imimg.com/data5/SELLER/Default/2023/11/363761195/FK/YL/MC/188692646/881d463b-d215-44c2-b975-61da4b959f4a-1000x1000.webp",
    sizes: ["One size"], colors: ["Black", "Ivory"],
    description: "Top-handle bag with a detachable strap and suede-lined interior."
  },
  {
    id: "wool-overcoat", name: "Tailored Wool Overcoat", price: 18900,
    gender: "men", category: "ready-to-wear", universe: "noir", isNew: true,
    image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=900",
    sizes: ["S", "M", "L", "XL"], colors: ["Charcoal", "Camel"],
    description: "Double-faced wool overcoat with a relaxed shoulder and horn buttons."
  },
  {
    id: "silk-shirt", name: "Printed Silk Shirt", price: 7800,
    gender: "unisex", category: "ready-to-wear", universe: "riviera",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900",
    sizes: ["S", "M", "L", "XL"], colors: ["Azure print"],
    description: "Pure silk camp-collar shirt with an all-over coastal print."
  },
  {
    id: "kikoi-scarf", name: "Kikoi Fringe Scarf", price: 1200,
    gender: "unisex", category: "accessories", universe: "savanna",
    image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=900",
    sizes: ["One size"], colors: ["Rust stripe"],
    description: "Hand-loomed cotton scarf with knotted fringe, inspired by coastal kikoi weaves."
  },
  {
    id: "tech-hoodie", name: "Reflective Tech Hoodie", price: 4600,
    gender: "unisex", category: "ready-to-wear", universe: "neon",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900",
    sizes: ["S", "M", "L", "XL"], colors: ["Black"],
    description: "Heavyweight hoodie with reflective piping that lights up under headlights."
  }
];

const CATEGORIES = {
  "ready-to-wear": "Ready-to-Wear",
  bags: "Handbags",
  shoes: "Shoes",
  accessories: "Accessories",
  swimwear: "Swimwear"
};

// Fill gaps so hand-edited or imported products can't break the pages.
function normalizeProduct(p) {
  return {
    ...p,
    price: Number(p.price) || 0,
    gender: ["women", "men", "unisex"].includes(p.gender) ? p.gender : "unisex",
    category: CATEGORIES[p.category] ? p.category : "accessories",
    universe: UNIVERSES[p.universe] ? p.universe : "noir",
    image: p.image || "",
    sizes: Array.isArray(p.sizes) && p.sizes.length ? p.sizes : ["One size"],
    colors: Array.isArray(p.colors) && p.colors.length ? p.colors : ["—"],
    description: p.description || ""
  };
}

function loadCatalog() {
  try {
    const saved = JSON.parse(localStorage.getItem("catalog"));
    if (Array.isArray(saved)) return saved.filter(p => p && p.id && p.name).map(normalizeProduct);
  } catch (e) { /* fall back to the default catalogue */ }
  return DEFAULT_PRODUCTS.map(p => ({ ...p }));
}

const PRODUCTS = loadCatalog();

function findProduct(id) {
  return PRODUCTS.find(p => p.id === id);
}
