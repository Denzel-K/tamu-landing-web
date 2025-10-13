# TAMU Nexus Gateway — Mobile-Style Authentication Plan

This document outlines a layered/phased plan to bring the mobile app authentication experience to the web gateway, and to gate order/reservation flows until a user is authenticated.

## Goals
- Conditionally show/redirect checkout and reservation actions based on authentication.
- Replicate mobile authentication screens (Sign in, Sign up, Verify OTP, Forgot/Reset Password) in a modal.
- Use the same backend as the mobile app (TAMU-MOBILE-BACKEND on localhost:5000) with a similar API config and service layer.
- Keep modal state when closed/reopened.
- Gate `src/pages/OrderNew.tsx` and `src/pages/ReservationNew.tsx` so they require an authenticated user.

## Architecture Overview
- `src/lib/auth/mobileApiConfig.ts`: Resolve API base (default `http://localhost:5000/api`) similar to mobile `lib/api/config.ts`.
- `src/lib/auth/mobileAuthService.ts`: Minimal port of mobile `authService.ts` for web (localStorage instead of AsyncStorage).
- `src/lib/auth/authLocal.ts`: Storage helpers and a tiny auth event bus to notify the app when auth changes.
- `src/components/auth/AuthModalWeb.tsx`: Modal with tabbed/toggling forms replicating the mobile flows. State is preserved between open/close.
- Update buttons in:
  - `src/components/web/OrderReserveBarWeb.tsx`
  - `src/components/web/orders/FloatingCartWeb.tsx`
- Gate pages:
  - `src/pages/OrderNew.tsx`
  - `src/pages/ReservationNew.tsx`

## Phases & Checkpoints

### Phase 1 — Foundations (Config + Service)
- Create `mobileApiConfig.ts` for backend base URL resolution.
- Create `mobileAuthService.ts` with: register, login, verifyOTP, resendOTP, forgotPassword, resetPassword, getProfile, refresh, logout.
- Create `authLocal.ts` for token/user persistence and an `authBus` with subscribe/emit.

Checkpoint A: Local build compiles; can call `mobileAuthService.testConnection()` from console (manually) if needed.

### Phase 2 — Auth Modal UI
- Implement `AuthModalWeb.tsx`:
  - Tabs or toggles: Sign In, Sign Up, Verify OTP, Forgot/Reset.
  - Calls corresponding service methods; on success, stores tokens & user and emits auth change.
  - Keeps internal state when closed.

Checkpoint B: Modal renders via a demo trigger and preserves form state.

### Phase 3 — Conditional Buttons
- Update `OrderReserveBarWeb.tsx` and `FloatingCartWeb.tsx`:
  - Compute `isAuthed` via `authLocal.getAccessToken()` and listen for `authBus` events.
  - If unauthenticated:
    - For order: show `Signup to checkout`; clicking opens modal.
    - For reservation: show `Signup to reserve`; clicking opens modal.
  - If authenticated, behave as before.

Checkpoint C: Buttons change label/behavior based on auth state.

### Phase 4 — Gate Pages
- Update `OrderNew.tsx` and `ReservationNew.tsx` to require auth:
  - On mount, if unauthenticated, open `AuthModalWeb` and block actions until login is done.
  - After successful login, proceed as normal without clearing page state.

Checkpoint D: Navigating directly to new order/reservation when logged out prompts the modal and proceeds after login.

### Phase 5 — QA & DX
- Smoke test all flows.
- Ensure environment overrides work (e.g., `VITE_MOBILE_API_BASE`).
- Add helpful console messages in dev.

## Rollback Strategy
- Keep existing `AuthGateModal.tsx` intact. New modal is additive.
- Revert button and page gating changes if issues arise. The core data/API layers remain unaffected.

## Open Questions (Future Enhancements)
- Central `AuthProvider` to hold user state and token refresh timers.
- Social login buttons parity with mobile.
- Deep-link back to the exact action that triggered auth (e.g., auto-continue to checkout).
