# CampusCore – what was fixed & what YOU must do (5 steps)

## Why your product was invisible
1. **Marketplace**: the "Publish" button saved to Supabase but ignored failures, then always saved a copy in *your own browser* and said "live". When Supabase rejected the insert (expired session, not a seller in DB, bad image) only your browser had it. Edits/deletes/"sold" never reached the server at all.
2. **Hostels/lodges had no database table** – every hostel post existed only in the poster's browser.
3. Photos fell back to giant base64 text that overflowed browser storage (worse on phones).

Now the **server is the single source of truth**. A post only shows "live" after Supabase confirms it; every PC/Android/iOS device loads the same data on open, via realtime push, on tab focus, and every 45s.

## Do these steps (in order)
1. **Supabase → SQL Editor**: run `supabase/schema.sql` (if fresh), then **`supabase/production_fixes.sql`** (safe to re-run).
2. **Supabase → Auth → Providers → Email**: turn ON **Confirm email** (admin accounts rely on it).
3. **Vercel env vars** (see `.env.example`): `SUPABASE_SERVICE_ROLE_KEY`, `PAYSTACK_SECRET_KEY` (sk_live…), `PAYSTACK_PUBLIC_KEY`, `APP_URL` (your https domain), `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Never put the service key in a `VITE_` variable.
4. **Paystack dashboard → Settings → API Keys & Webhooks**: webhook URL `https://YOUR-DOMAIN/api/payment/paystack/webhook`.
5. Redeploy. Test with a Paystack **test key** first (card 4084 0840 8408 4081) before going live.

## Checkout (Paystack)
Buyer taps Pay → server reads the real price from the DB → creates an escrow order → redirects to Paystack → returns to the site where the server verifies amount/currency/reference → order becomes "escrow funded" (webhook also does this if the buyer closes the tab). Two buyers paying for one item: first wins, second is auto-refunded. Money is released only when the buyer confirms (or admin resolves a dispute).

## Security issues found & fixed
| Severity | Issue | Fix |
|---|---|---|
| Critical | `/api/admin/users` returned every user's email/phone to **anyone** | Requires admin session |
| Critical | Anyone could sign up with `role: SUPER_ADMIN` in metadata; users could edit their own `role` | Trigger ignores metadata role; DB trigger locks role/status/ratings |
| Critical | Orders could be created/edited by buyers directly (fake "paid", change amounts) | Orders are server-written only |
| Critical | "Wallet deposit" credited money in the browser | Disabled in production |
| High | `profiles` table publicly readable (emails, phones) | Owner/admin only + safe `public_profiles` view |
| High | Fake "logged in" via localStorage when Supabase configured | Removed |
| Medium | Storage: any user could write anywhere; accommodations bucket had no rules | Own-folder-only, image types, 5 MB cap |
| Medium | No CSP / API rewritten to SPA | CSP, no-store API, tightened body limit |
| Medium | Paystack amount trusted from the browser | Server-side price only |

## Still NOT server-backed (device-local, same pattern needed next)
Messages/chat, jobs, services, events/tickets, communities, businesses, roommates, reviews, notifications, wallet/withdrawals. Contact buyers/sellers via the WhatsApp/phone on listings meanwhile. **Seller payouts are manual**: completed orders have `payout_status='pending'` in the `orders` table.

## Verification honestly stated
No network in my sandbox, so I could **not** run `npm install`, build, or the live app. What I did run: 5 passing unit tests on the payment/escrow/signature logic (`npm test`) and a TypeScript check of all files (clean apart from stubbed third-party types). Please run `npm install && npm run lint && npm run build` and one test purchase before launch. The CSP is strict – if a feature breaks, check the browser console for "Refused to…" and add the host.

---
## Profile update (login → profile → listings)
- **One shared profile loader** (`AuthContext.loadSessionProfile`) now pulls name, phone, WhatsApp, avatar, seller status from the database on page load, login, token events and when you return to the tab. Exposed globally via `useAuth()`: `currentUser`, `contactPhone`, `contactWhatsapp`, `hasContactNumber`, `isProfileLoading`, `refreshProfile()`.
- **Bug fixed:** a failed profile read could overwrite saved phone/bio/avatar with blanks (`ensureProfile` upserted defaults). It now only creates a profile when the database confirms none exists, and never overwrites.
- **Edit Profile** button: Navbar menu + dashboard header (`openEditProfile()` from `useProfileEditor()` works anywhere). Change photo (compressed), name, phone, WhatsApp, Telegram, bio, privacy toggle.
- **Listing forms** (product, hostel, service) show the saved number, or let users add one inline; the number is saved to their profile and validated/normalised (`+234…`) so WhatsApp links work.
- Changing phone/name/photo also updates the contact details on the user's existing listings and hostels.
- Security: saved-account switching no longer bypasses the password when Supabase is on; `/api/admin/users` call now sends the admin token.

---
## Services are now server-backed
Run `supabase/services_migration.sql` in the Supabase SQL editor (after `production_fixes.sql`).
- **Service listings** are stored in Supabase → visible to every user on every device.
- **Requests → quote → pay → deliver → approve** run through `/api/services/request` (server state machine, 12 unit tests). The client pays the provider's quote with **Paystack** (same webhook URL as orders); funds are held until the client approves; disputes freeze the escrow; admins can refund/release. Stale/declined payments are auto-refunded.
- **Bookings** are stored in Supabase; the database itself blocks double-booking a time slot.
- New UI: providers can **Send Quote / Decline**; both sides can **Report a problem**.
- Fixed: the old flow charged a local "wallet" (impossible once wallet top-ups were disabled), and the bookings tab crashed on `totalAmount`.
- Payouts to providers are manual for now (`payout_status = 'pending'` on `service_requests`).

---
## Payment "Could not start payment" fix
Cause: `package.json` has `"type": "module"`, and the API files imported each other without file extensions. Vercel's ES-module runtime then crashed every payment/order/service function on load (error `ERR_MODULE_NOT_FOUND`). All 24 imports in `api/` now end in `.js` (also revives `/api/studygen`).
Check readiness any time: open `https://YOUR-DOMAIN/api/health?check=payments` – every value should be `true` / `ok` / `accepted by Paystack`.
The app now also shows "The server had a problem (error 500)" instead of a vague message when a server function fails.
