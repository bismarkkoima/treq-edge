// Shared layout, storage and UI behaviour for every Treq Edge page.

const store = {
  get(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* storage unavailable: keep state in memory only */ }
  }
};

/* ---------- Cookie consent ---------- */

// Essential storage (bag, wishlist, sign-in) is always on. The optional
// categories below only keep data between visits once the visitor agrees.
const CONSENT_CATEGORIES = {
  preferences: {
    label: "Preferences",
    text: "Remember your theme, currency and recently viewed pieces between visits."
  },
  analytics: {
    label: "Analytics",
    text: "Count page visits anonymously in this browser so we can see which pages people enjoy."
  }
};
const PREFERENCE_KEYS = ["theme", "currency", "recent"];

function getConsent() {
  return store.get("consent", null);
}

function allowed(category) {
  const consent = getConsent();
  return Boolean(consent && consent[category]);
}

function setConsent(choices) {
  const wasAllowed = allowed("preferences");
  store.set("consent", { ...choices, decidedAt: new Date().toISOString() });
  try {
    // Move preference data to wherever it now belongs.
    PREFERENCE_KEYS.forEach(key => {
      const from = wasAllowed ? localStorage : sessionStorage;
      const to = choices.preferences ? localStorage : sessionStorage;
      const value = from.getItem(key);
      if (from !== to && value !== null) {
        to.setItem(key, value);
        from.removeItem(key);
      }
    });
    if (!choices.analytics) localStorage.removeItem("analytics");
  } catch (e) { /* storage unavailable */ }
  document.querySelector(".cookie")?.remove();
}

// Preferences persist across visits only with consent; otherwise they last
// for this browser tab session.
const prefs = {
  area() {
    return allowed("preferences") ? localStorage : sessionStorage;
  },
  get(key, fallback) {
    try {
      const value = JSON.parse(this.area().getItem(key));
      return value ?? fallback;
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      this.area().setItem(key, JSON.stringify(value));
    } catch (e) { /* storage unavailable */ }
  }
};

function trackPageView() {
  if (!allowed("analytics")) return;
  const stats = store.get("analytics", { total: 0, pages: {} });
  const page = location.pathname.split("/").pop() || "index.html";
  stats.total += 1;
  stats.pages[page] = (stats.pages[page] || 0) + 1;
  store.set("analytics", stats);
}

function rememberViewed(id) {
  const recent = prefs.get("recent", []).filter(x => x !== id);
  recent.unshift(id);
  prefs.set("recent", recent.slice(0, 8));
}

/* ---------- Accounts ---------- */

// Accounts are kept in this browser only — a stand-in until the store has a
// backend. Passwords are stored as salted SHA-256 hashes, never as plain text.
async function hashPassword(email, password) {
  const data = new TextEncoder().encode(email + ":" + password);
  if (window.crypto && crypto.subtle) {
    const digest = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
  }
  let h = 0;
  for (const b of data) h = (h * 31 + b) >>> 0;
  return "x" + h.toString(16);
}

const auth = {
  users() {
    return store.get("users", {});
  },
  current() {
    const email = store.get("session", null);
    return email ? this.users()[email] || null : null;
  },
  save(user) {
    const users = this.users();
    users[user.email] = user;
    store.set("users", users);
  },
  async register({ name, email, password }) {
    email = email.trim().toLowerCase();
    if (this.users()[email]) throw new Error("An account with this email already exists.");
    if (password.length < 8) throw new Error("Your password needs at least 8 characters.");
    const user = {
      name: name.trim(), email,
      passHash: await hashPassword(email, password),
      phone: "", address: "", city: "", size: "", universe: "",
      newsletter: false, orders: [], createdAt: new Date().toISOString()
    };
    this.save(user);
    store.set("session", email);
    return user;
  },
  async signIn(email, password) {
    email = email.trim().toLowerCase();
    const user = this.users()[email];
    if (!user || user.passHash !== await hashPassword(email, password)) {
      throw new Error("That email and password don't match an account.");
    }
    store.set("session", email);
    return user;
  },
  signOut() {
    store.set("session", null);
  },
  update(changes) {
    const user = { ...this.current(), ...changes };
    this.save(user);
    return user;
  },
  async changePassword(currentPassword, nextPassword) {
    const user = this.current();
    if (user.passHash !== await hashPassword(user.email, currentPassword)) throw new Error("Your current password is incorrect.");
    if (nextPassword.length < 8) throw new Error("Your new password needs at least 8 characters.");
    this.update({ passHash: await hashPassword(user.email, nextPassword) });
  },
  remove() {
    const users = this.users();
    delete users[store.get("session", null)];
    store.set("users", users);
    this.signOut();
  }
};

const USD_RATE = 129; // KES per USD, indicative only

const ICONS = {
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
  bag: '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1 13H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  phone: '<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg>',
  moon: '<svg viewBox="0 0 24 24"><path d="M20 14A8 8 0 1 1 10 4a7 7 0 0 0 10 10z"/></svg>',
  pin: '<svg viewBox="0 0 24 24"><path d="M12 21s-7-6-7-12a7 7 0 0 1 14 0c0 6-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>'
};

/* ---------- State ---------- */

let cart = store.get("cart", []);
let wishlist = store.get("wishlist", []);

function saveCart() {
  store.set("cart", cart);
  updateCounts();
  renderBagDrawer();
}

function saveWishlist() {
  store.set("wishlist", wishlist);
  updateCounts();
}

function cartQuantity() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function cartSubtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function addToCart(id, size, quantity = 1) {
  const product = findProduct(id);
  if (!product) return;
  const chosenSize = size || product.sizes[0];
  const existing = cart.find(item => item.id === id && item.size === chosenSize);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ id, name: product.name, price: product.price, image: product.image, size: chosenSize, quantity });
  }
  saveCart();
  openDrawer("bag-drawer");
}

function setCartQuantity(index, quantity) {
  if (quantity < 1) {
    cart.splice(index, 1);
  } else {
    cart[index].quantity = quantity;
  }
  saveCart();
  document.dispatchEvent(new CustomEvent("cart:change"));
}

function toggleWishlist(id) {
  const product = findProduct(id);
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(x => x !== id);
    toast(`${product.name} removed from your wishlist`);
  } else {
    wishlist.push(id);
    toast(`${product.name} saved to your wishlist`);
  }
  saveWishlist();
  document.querySelectorAll(`[data-wish="${id}"]`).forEach(btn => {
    btn.classList.toggle("active", wishlist.includes(id));
  });
  document.dispatchEvent(new CustomEvent("wishlist:change"));
}

/* ---------- Formatting ---------- */

function formatPrice(kes) {
  if (prefs.get("currency", "KES") === "USD") {
    return "$" + (kes / USD_RATE).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return "KSh " + kes.toLocaleString("en-KE");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Remote product photos can disappear; show a typographic placeholder instead.
function imageFallback(img) {
  img.onerror = null;
  const holder = document.createElement("div");
  holder.className = "img-fallback";
  holder.textContent = (img.alt || "Treq").split(" ").map(w => w[0]).join("").slice(0, 3);
  img.replaceWith(holder);
}

function productCard(product) {
  const saved = wishlist.includes(product.id);
  const universe = UNIVERSES[product.universe];
  return `
    <article class="card">
      <a class="card-media" href="product.html?id=${product.id}">
        <img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy" onerror="imageFallback(this)">
        ${product.isNew ? '<span class="badge">New</span>' : ""}
      </a>
      <button class="wish ${saved ? "active" : ""}" data-wish="${product.id}" aria-label="Save ${escapeHtml(product.name)}" onclick="toggleWishlist('${product.id}')">${ICONS.heart}</button>
      <div class="card-body">
        <span class="eyebrow">${universe.name} universe</span>
        <a href="product.html?id=${product.id}"><h3>${escapeHtml(product.name)}</h3></a>
        <p class="price">${formatPrice(product.price)}</p>
        <button class="btn-line" onclick="addToCart('${product.id}')">Add to bag</button>
      </div>
    </article>`;
}

/* ---------- Layout ---------- */

function renderLayout() {
  const announce = document.createElement("div");
  announce.className = "announce";
  announce.innerHTML = `<div class="announce-track">
      <span>Complimentary delivery within Nairobi on orders over KSh 5,000</span>
      <span>Pay securely with M-Pesa &amp; Airtel Money</span>
      <span>Free returns within 7 days</span>
      <span>Enter the multiverse — four worlds, one wardrobe</span>
    </div>`;

  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <div class="header-left">
      <button class="menu-btn" onclick="openOverlay('menu-overlay')" aria-label="Open menu"><span class="burger"></span><span class="label">Menu</span></button>
      <button class="icon-btn" onclick="openOverlay('search-overlay')" aria-label="Search">${ICONS.search}</button>
    </div>
    <a class="wordmark" href="index.html">TREQ&nbsp;EDGE</a>
    <div class="header-right">
      <a class="icon-btn hide-sm" href="contact.html" aria-label="Contact us">${ICONS.phone}</a>
      <a class="icon-btn" href="wishlist.html" aria-label="Wishlist">${ICONS.heart}<span class="count" id="wish-count"></span></a>
      <button class="icon-btn" onclick="openDrawer('account-drawer')" aria-label="Account">${ICONS.user}</button>
      <button class="icon-btn" onclick="openDrawer('bag-drawer')" aria-label="Shopping bag">${ICONS.bag}<span class="count" id="cart-count"></span></button>
    </div>`;

  const menu = document.createElement("div");
  menu.className = "overlay menu-overlay";
  menu.id = "menu-overlay";
  menu.innerHTML = `
    <button class="icon-btn overlay-close" onclick="closeOverlays()" aria-label="Close menu">${ICONS.close}</button>
    <nav class="menu-grid">
      <div>
        <p class="eyebrow">Shop</p>
        <a href="shop.html?new=1">New In</a>
        <a href="shop.html?gender=women">Women</a>
        <a href="shop.html?gender=men">Men</a>
        <a href="shop.html?category=bags">Handbags</a>
        <a href="shop.html?category=shoes">Shoes</a>
        <a href="shop.html?category=accessories">Accessories</a>
      </div>
      <div>
        <p class="eyebrow">The Multiverse</p>
        ${Object.entries(UNIVERSES).map(([key, u]) => `<a href="collections.html#${key}">${u.name}</a>`).join("")}
        <a href="collections.html">All universes</a>
      </div>
      <div class="menu-small">
        <p class="eyebrow">Services</p>
        <a href="stores.html">Store locator</a>
        <a href="contact.html">Contact an advisor</a>
        <a href="help.html">Help &amp; FAQs</a>
        <a href="account.html">My account</a>
        <a href="wishlist.html">My wishlist</a>
        <a href="cart.html">Shopping bag</a>
      </div>
    </nav>`;

  const search = document.createElement("div");
  search.className = "overlay search-overlay";
  search.id = "search-overlay";
  search.innerHTML = `
    <button class="icon-btn overlay-close" onclick="closeOverlays()" aria-label="Close search">${ICONS.close}</button>
    <form class="search-form" action="shop.html">
      <input name="q" type="search" placeholder="What are you looking for?" autocomplete="off" id="search-input">
    </form>
    <div class="search-suggest">
      <p class="eyebrow">Trending</p>
      <a href="shop.html?q=bag">Bags</a><a href="shop.html?q=sneakers">Sneakers</a><a href="shop.html?q=dress">Dresses</a><a href="shop.html?q=silk">Silk</a>
    </div>
    <div class="search-results grid" id="search-results"></div>`;

  const bag = document.createElement("aside");
  bag.className = "drawer";
  bag.id = "bag-drawer";
  bag.innerHTML = `
    <div class="drawer-head"><h2>Shopping bag</h2><button class="icon-btn" onclick="closeOverlays()" aria-label="Close bag">${ICONS.close}</button></div>
    <div class="drawer-body" id="bag-items"></div>
    <div class="drawer-foot">
      <div class="row"><span>Subtotal</span><strong id="bag-subtotal"></strong></div>
      <a class="btn" href="cart.html">View bag &amp; checkout</a>
    </div>`;

  const account = document.createElement("aside");
  account.className = "drawer";
  account.id = "account-drawer";
  account.innerHTML = `
    <div class="drawer-head"><h2>My account</h2><button class="icon-btn" onclick="closeOverlays()" aria-label="Close account">${ICONS.close}</button></div>
    <div class="drawer-body" id="account-body"></div>`;

  const cookieDrawer = document.createElement("aside");
  cookieDrawer.className = "drawer";
  cookieDrawer.id = "cookie-drawer";
  cookieDrawer.innerHTML = `
    <div class="drawer-head"><h2>Cookie settings</h2><button class="icon-btn" onclick="closeOverlays()" aria-label="Close cookie settings">${ICONS.close}</button></div>
    <form class="drawer-body" id="cookie-form"></form>
    <div class="drawer-foot">
      <button class="btn" type="submit" form="cookie-form">Save my choices</button>
      <button class="btn-line" type="button" onclick="setConsent({ preferences: true, analytics: true }); closeOverlays(); toast('All cookies accepted');">Accept all</button>
    </div>`;

  const scrim = document.createElement("div");
  scrim.className = "scrim";
  scrim.onclick = closeOverlays;

  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="footer-grid">
      <div>
        <p class="eyebrow">May we help you?</p>
        <a href="contact.html">Contact us</a>
        <a href="help.html">FAQs</a>
        <a href="help.html#shipping">Shipping &amp; returns</a>
        <a href="stores.html">Store locator</a>
        <a href="account.html">My account</a>
        <button class="link-btn footer-link" onclick="openCookieSettings()">Cookie settings</button>
      </div>
      <div>
        <p class="eyebrow">The company</p>
        <a href="collections.html">The multiverse</a>
        <a href="index.html#craft">Craft &amp; sustainability</a>
        <a href="contact.html">Careers</a>
        <a href="admin.html">Admin dashboard</a>
      </div>
      <div class="newsletter">
        <p class="eyebrow">Sign up for updates</p>
        <p>First access to new universes, drops and private events.</p>
        <form onsubmit="event.preventDefault(); this.reset(); toast('Welcome to the Treq Edge universe');">
          <input type="email" required placeholder="Email address" aria-label="Email address">
          <button class="btn" type="submit">Sign up</button>
        </form>
      </div>
      <div>
        <p class="eyebrow">Settings</p>
        <label class="select-label">Currency
          <select id="currency-select">
            <option value="KES">Kenya — KSh</option>
            <option value="USD">International — USD</option>
          </select>
        </label>
        <button class="link-btn" onclick="toggleTheme()">${ICONS.moon} Toggle light / dark</button>
      </div>
    </div>
    <div class="footer-mark">TREQ EDGE</div>
    <p class="legal">&copy; ${new Date().getFullYear()} Treq Edge. All rights reserved.</p>`;

  const toTop = document.createElement("button");
  toTop.className = "to-top";
  toTop.setAttribute("aria-label", "Back to top");
  toTop.innerHTML = "&uarr;";
  toTop.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const toastEl = document.createElement("div");
  toastEl.className = "toast";
  toastEl.id = "toast";

  document.body.prepend(announce, header);
  document.body.append(footer, menu, search, bag, account, cookieDrawer, scrim, toTop, toastEl);

  if (!getConsent()) {
    const cookie = document.createElement("div");
    cookie.className = "cookie";
    cookie.innerHTML = `
      <p>We use essential cookies to run your bag and account. Optional cookies are only used if you agree.
        <button class="link-btn" data-cookie="manage">Manage</button></p>
      <div class="cookie-actions">
        <button class="btn-line" data-cookie="reject">Reject optional</button>
        <button class="btn" data-cookie="accept">Accept all</button>
      </div>`;
    cookie.addEventListener("click", e => {
      const action = e.target.closest("[data-cookie]")?.dataset.cookie;
      if (action === "accept") setConsent({ preferences: true, analytics: true });
      if (action === "reject") setConsent({ preferences: false, analytics: false });
      if (action === "manage") openCookieSettings();
    });
    document.body.append(cookie);
  }
}

function openCookieSettings() {
  const consent = getConsent() || {};
  const form = document.getElementById("cookie-form");
  form.innerHTML = `
    <p class="muted">Choose which optional cookies we may use. You can change this at any time from the footer.</p>
    <label class="consent-row">
      <div><strong>Essential</strong><p class="muted">Keep your shopping bag, wishlist and sign-in working. Always on.</p></div>
      <input type="checkbox" checked disabled>
    </label>
    ${Object.entries(CONSENT_CATEGORIES).map(([key, c]) => `
      <label class="consent-row">
        <div><strong>${c.label}</strong><p class="muted">${c.text}</p></div>
        <input type="checkbox" name="${key}" ${consent[key] ? "checked" : ""}>
      </label>`).join("")}`;
  form.onsubmit = e => {
    e.preventDefault();
    setConsent(Object.fromEntries(Object.keys(CONSENT_CATEGORIES).map(key => [key, form.elements[key].checked])));
    closeOverlays();
    toast("Your cookie choices have been saved");
  };
  openDrawer("cookie-drawer");
}

function renderBagDrawer() {
  const list = document.getElementById("bag-items");
  if (!list) return;
  if (!cart.length) {
    list.innerHTML = `<p class="muted">Your shopping bag is empty.</p><a class="btn-line" href="shop.html">Continue shopping</a>`;
  } else {
    list.innerHTML = cart.map((item, i) => `
      <div class="line-item">
        <img src="${item.image}" alt="${escapeHtml(item.name)}" onerror="imageFallback(this)">
        <div>
          <p class="name">${escapeHtml(item.name)}</p>
          <p class="muted">Size ${escapeHtml(item.size)} · Qty ${item.quantity}</p>
          <p>${formatPrice(item.price * item.quantity)}</p>
        </div>
        <button class="link-btn" onclick="setCartQuantity(${i}, 0); renderBagDrawer();">Remove</button>
      </div>`).join("");
  }
  document.getElementById("bag-subtotal").textContent = formatPrice(cartSubtotal());
}

function renderAccount() {
  const body = document.getElementById("account-body");
  const user = auth.current();
  if (user) {
    body.innerHTML = `<p>Welcome back, <strong>${escapeHtml(user.name)}</strong>.</p>
      <p class="muted">${escapeHtml(user.email)}</p>
      <a class="btn" href="account.html">My account</a>
      <a class="btn-line" href="account.html#orders">My orders (${user.orders.length})</a>
      <a class="btn-line" href="wishlist.html">My wishlist (${wishlist.length})</a>
      <a class="btn-line" href="account.html#profile">Profile &amp; addresses</a>
      <button class="link-btn" id="sign-out">Sign out</button>`;
    body.querySelector("#sign-out").onclick = () => {
      auth.signOut();
      updateCounts();
      renderAccount();
      toast("You have been signed out");
      document.dispatchEvent(new CustomEvent("auth:change"));
    };
  } else {
    body.innerHTML = `<p class="muted">Sign in for faster checkout, order history and saved details.</p>
      <form class="stack" id="sign-in">
        <input name="email" type="email" required placeholder="Email address" autocomplete="email">
        <input name="password" type="password" required placeholder="Password" autocomplete="current-password">
        <p class="form-error" id="sign-in-error"></p>
        <button class="btn" type="submit">Sign in</button>
      </form>
      <p class="muted">New to Treq Edge?</p>
      <a class="btn-line" href="account.html#register">Create an account</a>`;
    body.querySelector("#sign-in").onsubmit = async e => {
      e.preventDefault();
      const data = new FormData(e.target);
      try {
        const user = await auth.signIn(data.get("email"), data.get("password"));
        updateCounts();
        renderAccount();
        toast(`Welcome back, ${user.name}`);
        document.dispatchEvent(new CustomEvent("auth:change"));
      } catch (err) {
        document.getElementById("sign-in-error").textContent = err.message;
      }
    };
  }
}

function updateCounts() {
  const c = document.getElementById("cart-count");
  const w = document.getElementById("wish-count");
  if (c) c.textContent = cartQuantity() || "";
  if (w) w.textContent = wishlist.length || "";
  const accountBtn = document.querySelector('[aria-label="Account"]');
  if (accountBtn) accountBtn.classList.toggle("signed-in", Boolean(auth.current()));
}

/* ---------- Overlays ---------- */

function openOverlay(id) {
  closeOverlays();
  document.getElementById(id).classList.add("open");
  document.body.classList.add("locked");
  if (id === "search-overlay") setTimeout(() => document.getElementById("search-input").focus(), 50);
}

function openDrawer(id) {
  closeOverlays();
  if (id === "account-drawer") renderAccount();
  document.getElementById(id).classList.add("open");
  document.querySelector(".scrim").classList.add("open");
  document.body.classList.add("locked");
}

function closeOverlays() {
  document.querySelectorAll(".overlay.open, .drawer.open, .scrim.open").forEach(el => el.classList.remove("open"));
  document.body.classList.remove("locked");
}

let toastTimer;
function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}

/* ---------- Theme & universe ---------- */

function applyTheme() {
  document.documentElement.dataset.theme = prefs.get("theme", "light");
}

function toggleTheme() {
  prefs.set("theme", prefs.get("theme", "light") === "dark" ? "light" : "dark");
  applyTheme();
}

function setUniverse(key) {
  if (UNIVERSES[key]) {
    document.documentElement.style.setProperty("--accent", UNIVERSES[key].accent);
    document.documentElement.dataset.universe = key;
  }
}

/* ---------- Boot ---------- */

applyTheme();

document.addEventListener("DOMContentLoaded", () => {
  renderLayout();
  updateCounts();
  trackPageView();
  renderBagDrawer();

  const currency = document.getElementById("currency-select");
  currency.value = prefs.get("currency", "KES");
  currency.onchange = () => { prefs.set("currency", currency.value); location.reload(); };

  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    const results = q ? PRODUCTS.filter(p => (p.name + " " + p.category + " " + p.universe).toLowerCase().includes(q)).slice(0, 4) : [];
    document.getElementById("search-results").innerHTML = results.map(productCard).join("");
  });

  document.addEventListener("keydown", e => { if (e.key === "Escape") closeOverlays(); });

  const header = document.querySelector(".site-header");
  const toTop = document.querySelector(".to-top");
  const onScroll = () => {
    header.classList.toggle("solid", window.scrollY > 40);
    toTop.classList.toggle("show", window.scrollY > 600);
    // Keep the cookie notice from covering content while the visitor reads.
    document.querySelector(".cookie")?.classList.toggle("tucked", window.scrollY > 120);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
});
