# Deployment and Security Checklist

## 1) Required Environment Variables

Add these in your hosting platform (not in git):

- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
- NEXT_PUBLIC_IMGBB_KEY
- NEXT_PUBLIC_PAYSTACK_KEY
- PAYSTACK_SECRET_KEY
- FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY
- NEXT_PUBLIC_SLOT_PRICE_NGN (optional, default: 100)
- NEXT_PUBLIC_MIN_WALLET_FUND_NGN (optional, default: 500)

Notes:
- `FIREBASE_PRIVATE_KEY` must preserve line breaks. Use `\n` escaped newlines if needed.
- Do not expose `PAYSTACK_SECRET_KEY`, `FIREBASE_CLIENT_EMAIL`, or `FIREBASE_PRIVATE_KEY` to the browser.

## 2) Firestore Rules and Indexes

Deploy these files:

- `firestore.rules`
- `firestore.indexes.json`

This setup enforces owner-based access and keeps team submissions private until published.

## 3) Coupon Data Model

Create coupon docs in collection `coupons` using `CODE` as document id (uppercased), for example:

```json
{
  "active": true,
  "balanceCredit": 1000,
  "slotCredit": 5,
  "maxUses": 200,
  "usedCount": 0,
  "expiresAt": "<Firestore Timestamp>",
  "createdAt": "<Firestore Timestamp>",
  "updatedAt": "<Firestore Timestamp>"
}
```

## 4) Payment Safety

- The frontend only sends Paystack `reference`.
- The backend verifies with Paystack secret key and credits wallet exactly once per reference.
- Wallet, slot purchase, coupon redeem, and team submission are all authenticated with Firebase ID token.

## 5) Publish Workflow

- New team entries are saved with `status: "pending"`.
- Public team directory shows only `status: "published"`.
- Add an admin publish action later to update pending entries.