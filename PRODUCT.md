# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Hungry customers in Chajarí, Entre Ríos (Argentina), almost always on a phone. They arrive from a link shared on Instagram or WhatsApp, or by searching Google for burgers in Chajarí. Their job: see today's menu and whether the place is open, pick and customize items, and send the order by WhatsApp in under a minute.

Secondary user: the owner, who edits menu, prices, hours, address, alias and social links from `/dashboard`.

## Product Purpose
Pintó la Gula's online menu and order builder. It turns a browse into a ready-to-send WhatsApp order (items, meat count, bread type, notes, delivery or pickup, payment method, total). Success: more complete orders arriving on WhatsApp, and the site being found on Google and shared with a proper preview.

## Positioning
A local burger place in Chajarí with its own menu that the owner updates daily, ordering straight to the owner's WhatsApp with no marketplace in between.

## Operating Context
- Orders go out through `wa.me` with a prebuilt message; there is no payment or order backend.
- Delivery to home or pickup at the shop. Payment in cash or bank transfer (alias shown at checkout).
- Opening hours are per-day time ranges edited in the dashboard; the site shows open/closed status.
- The site is shared as a link in WhatsApp and Instagram, so the link preview (Open Graph) matters.

## Capabilities and Constraints
- Next.js 14 App Router (JavaScript), Bootstrap + CSS Modules, Firebase Realtime Database via `/api/locales/*`.
- Categories: hamburguesas, sandwich, papas, bebidas, otros. Burgers allow 1 to 5 meats; burgers and sandwiches allow bread choice (Berly, papa, parmesano) with an extra price from the dashboard.
- Real address, WhatsApp, alias and social links come from the dashboard (`/api/locales/datos`). Never hardcode them.
- Product photos are the owner's real photos (URLs loaded in the dashboard, often Google Drive).

## Brand Commitments
- Name: "Pintó la Gula". Logo: `public/logo.png`.
- Keep the incumbent palette: space blue `#101336` / `#0B0E29` and bread orange `#F4A44E`. Poppins typeface.
- Voice: Argentine Spanish, voseo, informal and warm ("Pedí", "Agregá").

## Evidence on Hand
- Logo `public/logo.png`, product photos from the database.
- No testimonials, ratings, delivery times or prices beyond what the database holds. Do not invent them.

## Product Principles
1. Phone first: every decision is judged at 360-430px wide, one thumb.
2. The order must reach WhatsApp intact and correct.
3. Data from the owner is the source of truth; the site never contradicts the dashboard.
4. Shareable and findable: every share and search shows the real brand.
