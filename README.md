## 🚀 Setup Guide

### 1. Install Dependencies

Install the required Node.js packages:

```bash
npm install
```

### 2. Configure Your Keys

Open `src/DonationApp.jsx` and replace the placeholders at the top of the file:

```javascript
const STRIPE_PUBLISHABLE_KEY = "pk_test_YOUR_STRIPE_PUBLISHABLE_KEY";
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
```

Where to find your keys:

- **Stripe**: [Dashboard > API Keys](https://dashboard.stripe.com/apikeys) (Use
  the "Publishable key")
- **Supabase**: [Project Settings > API](https://supabase.com/dashboard) (URL
  and `anon` public key)

### 3. Set Up the Supabase Database

1. Go to your Supabase Dashboard
2. Open the **SQL Editor**
3. Run the SQL script located at:

```text
supabase/migrations/001_create_donations.sql
```

> **Note:** This automatically sets up the `donations` table and enables Row
> Level Security (RLS).

### 4. Deploy the Edge Function

Install the Supabase CLI globally if you haven't already:

```bash
npm install -g supabase
```

Link your local project to your remote Supabase instance and deploy the
function:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy create-payment-intent
```

Finally, set your Stripe secret key securely as an environment variable in the
Edge Function:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY
```

### 5. Run Locally

Start the Vite development server:

```bash
npm run dev
```

### 6. Build for Production

Compile the application for deployment:

```bash
npm run build
```

> You can then deploy the resulting `dist/` folder to Vercel, Netlify, or any
> static hosting provider.

---

## ⚙️ How It Works

1. **User interaction:** The user fills out the donation form on the frontend.
2. **Backend initialization:** React calls the Supabase Edge Function
   (`create-payment-intent`).
3. **Stripe configuration:** The Edge Function creates a Stripe `PaymentIntent`
   and securely returns the `client_secret`.
4. **Client confirmation:** React calls
   `stripe.confirmCardPayment(clientSecret, cardElement)`.
5. **Processing:** Stripe charges the credit card.
6. **Database recording:** React inserts a record of the donation into the
   Supabase `donations` table.
7. **Completion:** A success screen is shown to the user, and an email receipt
   is dispatched by Stripe.

---

## 💳 Stripe Test Cards

Use the following test credit card numbers to simulate payments in your local
environment without using real money. Provide any future expiration date and any
3-digit CVC code.

| Scenario               | Card Number           |
| ---------------------- | --------------------- |
| **Successful Payment** | `4242 4242 4242 4242` |
| **Card Declined**      | `4000 0000 0000 0002` |
| **Insufficient Funds** | `4000 0000 0000 9995` |

---

## 🚢 Going Live

When you are ready to process real transactions:

1. Replace your `pk_test_...` key with your **Live** Publishable Key
   (`pk_live_...`) in `src/DonationApp.jsx`.
2. Update your Supabase secret from your test secret key to your **Live** Secret
   Key (`sk_live_...`):
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_SECRET_KEY
   ```
3. _(Highly Recommended)_ Set up a Stripe webhook endpoint to handle
   `payment_intent.succeeded` events to ensure database finality regardless of
   client-side disconnects.

---

## 📚 Resources & Help

- [Stripe Payments Documentation](https://stripe.com/docs/payments/accept-a-payment)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript)
