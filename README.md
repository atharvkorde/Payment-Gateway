# TezGateway UPI Intent Tester

A production-ready **UPI Intent Testing Platform** built with React, Vite, and Tailwind CSS. This is **not** a real payment gateway — it tests UPI app launching on Android devices.

## Features

- **Home Page** — Create test orders with merchant name, UPI ID, amount, and customer name
- **Payment Page** — Launch Google Pay, PhonePe, Paytm, BHIM, or generic UPI chooser
- **QR Page** — Dynamic QR code generation with download, copy, and share
- **Status Page** — Manual pending/success/failed selection (no auto-verification)
- **Admin Dashboard** — Order stats from localStorage
- **Debug Panel** — Device info, UPI URL, intent launch status
- **Mobile-first** — Optimized for Android UPI Intent testing

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` on your Android device (same network) or use a tunnel.

## Deployment

### Vercel

```bash
npm run build
# Deploy via Vercel CLI or connect GitHub repo
```

### Netlify

```bash
npm run build
# Deploy dist/ folder or connect GitHub repo
```

Both platforms are pre-configured with SPA redirect rules.

## UPI Intent URL Format

```
upi://pay?pa={UPI_ID}&pn={MERCHANT_NAME}&am={AMOUNT}&cu=INR&tn={TRANSACTION_NOTE}&tr={ORDER_ID}
```

## Android Intent Packages

| App       | Package                                      |
|-----------|----------------------------------------------|
| Google Pay| `com.google.android.apps.nbu.paisa.user`       |
| PhonePe   | `com.phonepe.app`                            |
| Paytm     | `net.one97.paytm`                            |
| BHIM      | `in.org.npci.upiapp`                         |

## Important

- No banking APIs
- No payment verification
- No backend or database
- localStorage only
- For testing UPI Intent app launching only

## Default Configuration

- Merchant Name: **Atharv Recharge**
- UPI ID: **YOUR_UPI_ID_HERE**
- Currency: **INR**

## License

MIT — For testing purposes only.
