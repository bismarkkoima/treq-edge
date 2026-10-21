# Treq Edge

A luxury fashion storefront built with plain HTML, CSS and JavaScript — no build step. Open `index.html` in a browser or serve the folder with any static host (GitHub Pages works out of the box).

## Pages

| Page | What it does |
| --- | --- |
| `index.html` | Campaign hero, New In rail, multiverse tiles, craft story, services |
| `shop.html` | Full catalogue with gender, category and universe filters, sorting and search (`?q=`) |
| `product.html?id=…` | Product detail with size selector, hover zoom, wishlist and related pieces |
| `collections.html` | The four universes — the site accent shifts as each one scrolls into view |
| `cart.html` | Bag with quantities, promo codes (`EDGE10`, `MULTIVERSE`), delivery and M-Pesa / Airtel / card checkout |
| `wishlist.html` | Saved pieces |
| `stores.html` | Store locator that sorts boutiques by distance from your location |
| `contact.html` / `help.html` | Client services and searchable FAQs |

Shared features on every page: announcement ticker, full-screen menu, live search overlay, slide-out shopping bag and account drawers, KSh / USD currency switch, light / dark theme, cookie notice and back-to-top.

## Structure

```
assets/css/style.css   design system and layout
assets/js/products.js  catalogue and universe data — edit this to add products
assets/js/app.js       shared header/footer, cart, wishlist and UI behaviour
archive/               earlier prototype pages, kept for reference
```

Cart, wishlist, theme and currency are stored in the browser's `localStorage`.
