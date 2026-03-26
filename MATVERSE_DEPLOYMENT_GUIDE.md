# MATVerse Deployment Guide

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Zustand
- Better Auth
- Drizzle ORM
- Neon/Postgres

## Recommended Environment Variables

```env
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
NEXT_PUBLIC_APP_URL=

# Optional payment integration settings
BKASH_BASE_URL=
BKASH_USERNAME=
BKASH_PASSWORD=
BKASH_APP_KEY=
BKASH_APP_SECRET=

NAGAD_BASE_URL=
NAGAD_MERCHANT_ID=
NAGAD_MERCHANT_PRIVATE_KEY=
NAGAD_PUBLIC_KEY=
```

## Local Development

1. Create `.env.local` and fill in the variables above.
2. Run database migrations for your Neon/Postgres instance.
3. Seed the catalog from `POST /api/seed` after logging in as admin.
4. Start the app with `npm run dev`.

## Production Notes

### bKash

- Replace the checkout sandbox copy and form-only OTP fields with actual merchant session creation.
- Typical flow:
  1. Create payment session from your server
  2. Redirect or open payment prompt
  3. Verify callback/reference
  4. Mark payment verified before final order commit

### Nagad

- Implement merchant order creation server-side.
- Verify transaction tokens and OTP flow through the official merchant endpoints.
- Persist the final reference and verification result with the order record.

### Stock Locking

- Keep order creation inside a transaction.
- Lock product rows before checking stock.
- Decrement stock only after payment validation passes for prepaid methods.
- Restore stock automatically if an order is cancelled.

## Suggested Next Production Tasks

- Add real payment provider adapters for bKash and Nagad
- Add persistent offers table and `/admin/offers`
- Add customer account features and saved addresses
- Add image upload storage for admin product media
- Add automated tests for checkout, stock locking, admin CRUD, and auth
- Add database migrations for richer content tables such as categories, offers, and reviews
