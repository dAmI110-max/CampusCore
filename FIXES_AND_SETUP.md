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
