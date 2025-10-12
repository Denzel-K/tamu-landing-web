# In-Restaurant Mode: Web Experience Plan

## Objectives
- Replicate mobile app discovery, restaurant details, orders, and reservations flows on the web (`tamu-nexus-gateway`).
- Support QR deep links to enter a specific restaurant directly (bypassing discovery).
- Reuse TAMU-WEB-APP APIs as the single source of truth.
- Gate order/reservation actions behind authentication with a modal prompting sign-in/up.
- Provide a CTA in the website’s mobile experience section to try in-restaurant mode and navigate to discovery.

## Scope and Parity Targets
- Discovery: parity with `TAMU-MOBILE-APP/app/drawer/(tabs)/discover.tsx` (initially simplified UI on web).
- Restaurant details: parity with `app/(modals)/restaurant/[id].tsx` core sections (Menu, Reviews, Info). Start with Menu and Info; Reviews is follow-up.
- Order placement: parity with `app/(modals)/orders/new.tsx` essentials: order type selection, dine-in fields, delivery address, create order, then payment step (Phase 2).
- Reservation placement: parity with `app/(modals)/reservations/new.tsx` essentials: reservation type, party size, date/time, policy, optional pre-order notice; payment fee step (Phase 2).
- Realtime order tracking (Phase 3): leverage existing Socket.IO infra.

## Architecture Overview
- Web app: React + Vite (`tamu-nexus-gateway`) with React Router.
- Data: TAMU-WEB-APP Next.js API routes. New web API helpers mirroring mobile’s `lib/api`:
  - `src/lib/api/webApiConfig.ts` – base URL and auth cookie handling.
  - `src/lib/api/restaurants.ts` – list, get by id/email.
  - `src/lib/api/orders.ts` – create order, fetch order by id.
  - `src/lib/api/reservations.ts` – create reservation, fetch policy.
  - `src/lib/api/auth.ts` – lightweight auth helpers (get token, status); integrate with existing Next Auth endpoints.
- Routes:
  - `/discover` – restaurant discovery.
  - `/restaurant/:id` – restaurant details page.
  - `/orders/new` – new order form (requires restaurantId in query or cart context; initial: use query).
  - `/reservations/new` – new reservation form (requires restaurantId in query or cart context; initial: use query).
  - `/r/:id` and `/enter` – QR deep-link entry points; normalize to `/restaurant/:id`.

## QR Code Schema
- URL: `https://gateway.tamu.co/r/<restaurantId>?e=<email>&n=<name>&t=<ts>`
- Minimum field: `restaurantId` (ObjectId or slug). Optional `email` for fallback resolution.
- Mobile app can embed the same link; web will route to Restaurant details.
- For advanced use, `/enter?rid=<id>&email=<email>` supported and redirects to `/restaurant/:id`.

## Auth Gating Strategy
- Orders/Reservations actions open an `AuthGateModal` if user is not authenticated.
- Modal CTA: “Create account” and “Sign in” – link to TAMU-WEB-APP auth pages or embedded webview flow.
- After successful auth (cookie/session present), the modal closes and action continues.

## UI/UX Considerations
- Reuse shadcn UI components under `src/components/ui/` for inputs, dialogs, toasts, tabs.
- Maintain theme awareness and clean spacing.
- CTA placement: in `CTASection` under the mobile view, add “Try In‑Restaurant Mode” which links to `/discover`.

## Phased Implementation
- Phase 1 (This PR):
  - API helpers: `webApiConfig`, `restaurants`, `orders`, `reservations`, `auth`.
  - Routes: `/discover`, `/restaurant/:id`, `/orders/new`, `/reservations/new`, `/r/:id`, `/enter`.
  - Pages: simplified discovery and restaurant details; basic order/reservation forms; `AuthGateModal` gating.
  - CTA: Add in-restaurant CTA in `CTASection`.
- Phase 2:
  - Payment Sheet integration mirroring `PaymentMethodSheet` with TAMU-WEB-APP payment-configs and methods.
  - Reviews tab and posting.
  - Better menu UI and cart context.
- Phase 3:
  - Realtime order tracking via Socket.IO with JWT (follow `useOrderTracking` from mobile/web app).
  - QR code generator docs and admin tooling.

## Data Contracts (TAMU-WEB-APP endpoints)
- Restaurants:
  - `GET /api/restaurants` – list (with optional query params for search/filter).
  - `GET /api/restaurants/[id]` – details incl. menu.
  - Optional: `GET /api/restaurants/by-email?email=...` for fallback resolution.
- Orders:
  - `POST /api/orders` – create order { restaurantId, items[], type, partySize?, tableNumber?, deliveryAddress? }.
  - `GET /api/orders/[id]` – fetch order.
  - `GET /api/payment-methods?businessId=...` – payment availability.
  - `GET /api/payment-configs?businessId=...` – payment config.
- Reservations:
  - `POST /api/reservations` – create reservation { restaurantId, type, partySize, date, time, specialRequests?, occasion? }.
  - `GET /api/reservations/policy?businessId=...` – policy.

## Auth Integration
- Detect auth via HTTP-only cookie/session from TAMU-WEB-APP domain or token endpoint.
- If unauthenticated, show `AuthGateModal` with links to `/auth/signin` and `/auth/signup` on TAMU-WEB-APP.
- After redirect back, proceed with action.

## Testing Plan
- QR deep link: `/r/:id` and `/enter?rid=<id>&email=<email>` should land on Restaurant details.
- Discovery list loads and links to Restaurant details.
- From Restaurant page, trying to Order/Reserve opens auth modal if not signed in; after mock sign-in, proceeds.

## Deployment/Config
- Env: `VITE_WEB_API_BASE` pointing to TAMU-WEB-APP base URL.
- CORS/cookies: ensure `credentials: 'include'` on fetch where session needed.

## Follow-ups
- Payment flows, cart context, reviews, realtime tracking, UI polish to match mobile.
