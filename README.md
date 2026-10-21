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
| `account.html` | Sign up / sign in, profile and delivery details, order history, style preferences, recently viewed, password change and account deletion |
| `admin.html` | Catalogue dashboard: add, edit and delete products, load test catalogues, import / export JSON |

Shared features on every page: announcement ticker, full-screen menu, live search overlay, slide-out shopping bag and account drawers, KSh / USD currency switch, light / dark theme, cookie consent and back-to-top.

## Structure

```
assets/css/style.css   design system and layout
assets/js/products.js  catalogue and universe data — edit this to add products
assets/js/app.js       shared header/footer, cart, wishlist and UI behaviour
assets/js/demo-catalogs.js  sample catalogues used by the admin dashboard
archive/               earlier prototype pages, kept for reference
```

Cart, wishlist and accounts are stored in the browser's `localStorage`.

## Cookies

Visitors choose with **Accept all**, **Reject optional** or **Manage** (and can change their mind later via *Cookie settings* in the footer):

- **Essential** — bag, wishlist and sign-in. Always on.
- **Preferences** — theme, currency and recently viewed pieces are remembered between visits. When off, they last only for the current tab session.
- **Analytics** — anonymous page-view counts, shown in the admin dashboard. When off, nothing is recorded and existing counts are deleted.

## Accounts

Accounts are a front-end stand-in until the store has a backend: they live in the visitor's own browser, and passwords are kept as salted SHA-256 hashes rather than plain text. Signed-in shoppers get checkout filled in from their profile, and their orders are saved to *My account → Orders*. Moving to real accounts (shared across devices, with proper security) needs a server and database.

## Admin dashboard

Open `admin.html` (also linked in the footer). Changes are saved in the current browser only, so other visitors still see the catalogue in `products.js`. To make your edits permanent for everyone, use **Export JSON** and paste the result into `DEFAULT_PRODUCTS` in `assets/js/products.js`.

Test catalogues:

- **Full store** — 40 pieces across every universe and category
- **Small boutique** — 4 pieces, to see how sparse pages look
- **Stress test** — very long names, extreme prices, broken images and many sizes

**Restore original catalogue** puts everything back.

The dashboard has no login. This is a static site, so anyone who opens `admin.html` can edit the catalogue in their own browser, though only theirs. Real access control needs a backend.
