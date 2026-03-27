import { useState } from "react";
import { CheckCircle, Sprout, Lock } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { createClient } from "@supabase/supabase-js";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// Replace with your actual keys
const STRIPE_PUBLISHABLE_KEY = "pk_test_51TEsgRHURbq4tjPMPHPkxXaSju1byRPh7ytWKUS0FvOzfn7Fz6DGOBsa4PyCDyNJzMfx2ELaNQwClUpIZJBSIhYU00I6vxMCfB";
const SUPABASE_URL = "https://uhtmutxncageypcxjbqx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVodG11dHhuY2FnZXlwY3hqYnF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NTM2MzcsImV4cCI6MjA5MDAyOTYzN30.XWosWlq_zQxLLQ4Tg8gPvlDyOC_xwiRk4F9QqQcdgSg";
// ─────────────────────────────────────────────────────────────────────────────

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PRESET_AMOUNTS = [10, 25, 50, 100];

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#02331a",
      fontFamily: "'Source Sans 3', sans-serif",
      "::placeholder": { color: "#a0a8a1" },
      iconColor: "#7d5700",
    },
    invalid: { color: "#ba1a1a" },
  },
  hidePostalCode: true,
};

// ─── CHECKOUT FORM ───────────────────────────────────────────────────────────
function CheckoutForm({ amount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (!name.trim() || !email.trim()) {
      setError("Please fill in your name and email.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // 1. Call Supabase Edge Function to create PaymentIntent
      const { data, error: fnError } = await supabase.functions.invoke(
        "create-payment-intent",
        { body: { amount: amount * 100, currency: "usd", email, name } }
      );

      if (fnError || !data?.clientSecret) {
        throw new Error(fnError?.message || "Failed to create payment intent.");
      }

      // 2. Confirm card payment with Stripe
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(data.clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: { name, email },
          },
        });

      if (stripeError) throw new Error(stripeError.message);

      // 3. Log donation to Supabase
      await supabase.from("donations").insert({
        name,
        email,
        amount_usd: amount,
        payment_intent_id: paymentIntent.id,
        status: paymentIntent.status,
      });

      onSuccess(amount, name);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Cardholder Name */}
      <div>
        <label className="form-label">Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          className="form-input"
          required
        />
      </div>

      {/* Email */}
      <div>
        <label className="form-label">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@example.com"
          className="form-input"
          required
        />
      </div>

      {/* Stripe Card Element */}
      <div>
        <label className="form-label">Card Details</label>
        <div className="card-element-wrapper">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {/* Trust Badge */}
      <div className="trust-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>Secured by Stripe · 256-bit TLS encryption</span>
      </div>

      {/* Error */}
      {error && <div className="error-msg">{error}</div>}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !stripe}
        className="donate-btn"
      >
        {loading ? (
          <span className="btn-inner">
            <svg className="spinner" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="3" fill="none" stroke="currentColor" strokeDasharray="40" strokeDashoffset="10" />
            </svg>
            Processing…
          </span>
        ) : (
          <span className="btn-inner">
            Donate ${amount.toFixed(2)} Now
          </span>
        )}
      </button>

      <p className="legal-text">
        By donating you agree to our Terms of Service & Privacy Policy.
        All donations are tax-deductible to the extent permitted by law.
      </p>
    </form>
  );
}

// ─── SUCCESS STATE ────────────────────────────────────────────────────────────
function SuccessState({ amount, name, onReset }) {
  return (
    <div className="success-state">
      <div className="success-icon">
        <svg viewBox="0 0 52 52" fill="none">
          <circle cx="26" cy="26" r="25" stroke="#02331a" strokeWidth="2" />
          <path d="M14 26l9 9 15-15" stroke="#02331a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="success-title">Thank you, {name.split(" ")[0]}.</h2>
      <p className="success-sub">
        Your gift of <strong>${amount.toFixed(2)}</strong> has been received with gratitude.
        A receipt has been sent to your email.
      </p>
      <div className="success-actions">
        <button onClick={onReset} className="btn-secondary">Make Another Gift</button>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: "I just donated!", text: `I donated $${amount} to The Curated Legacy. Join me!`, url: window.location.href });
            }
          }}
          className="btn-primary"
        >
          Share Impact
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [selectedAmount, setSelectedAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState("");
  const [donated, setDonated] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [finalAmount, setFinalAmount] = useState(25);

  const displayAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleSuccess = (amount, name) => {
    setFinalAmount(amount);
    setDonorName(name);
    setDonated(true);
    document.getElementById("donate")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-eyebrow">The Curated Legacy Foundation</p>
          <h1 className="hero-title">Give Hope.<br />Change Lives.</h1>
          <p className="hero-sub">
            Preserving dignity through intentional philanthropy. Your contribution builds a lasting heritage of wellness and education for generations to come.
          </p>
          <div className="hero-scroll">
            <span>Scroll to Begin</span>
            <div className="scroll-line" />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats">
        <div className="stats-inner">
          {[["124k+", "Lives Impacted"], ["$8.2M", "Funds Deployed"], ["18", "Global Regions"]].map(([n, l]) => (
            <div key={l} className="stat-item">
              <div className="stat-num">{n}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DONATION SECTION */}
      <section id="donate" className="donation-section">
        {/* Editorial */}
        <div className="editorial">
          <p className="section-eyebrow">Your Contribution</p>
          <h2>Invest in the<br />Human Spirit.</h2>
          <p>
            We believe that true legacy isn't measured in what we leave behind, but in who we lift up. Choose an amount that reflects your commitment to a brighter, more equitable future.
          </p>
          <div className="trust-items">
            {[
              { icon: CheckCircle, title: "100% Transparency", desc: "Every dollar is tracked and reported in our annual financial monographs." },
              { icon: Sprout, title: "Sustainable Growth", desc: "We partner with local leaders to ensure long-term community autonomy." },
              { icon: Lock, title: "Secure Payments", desc: "All transactions are encrypted and processed securely through Stripe." },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.title} className="trust-item">
                  <span className="trust-item-icon"><Icon size={20} strokeWidth={2.5} /></span>
                  <div>
                    <h4>{t.title}</h4>
                    <p>{t.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Form Card */}
        <div className="form-card donation-form-sticky">
          {donated ? (
            <SuccessState
              amount={finalAmount}
              name={donorName}
              onReset={() => { setDonated(false); setSelectedAmount(25); setCustomAmount(""); }}
            />
          ) : (
            <>
              {/* Amount Selector */}
              <div className="amount-section">
                <label className="form-label">Select Amount</label>
                <div className="amount-grid">
                  {PRESET_AMOUNTS.map((a) => (
                    <button
                      key={a}
                      className={`amount-btn ${selectedAmount === a && !customAmount ? "active" : ""}`}
                      onClick={() => { setSelectedAmount(a); setCustomAmount(""); }}
                    >
                      ${a}
                    </button>
                  ))}
                </div>
                <div className="custom-input-wrap">
                  <span>$</span>
                  <input
                    className="custom-input"
                    type="number"
                    min="1"
                    placeholder="Other Amount"
                    value={customAmount}
                    onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                  />
                </div>
              </div>

              <hr className="form-divider" />

              {/* Payment Form */}
              <Elements stripe={stripePromise}>
                <CheckoutForm amount={displayAmount} onSuccess={handleSuccess} />
              </Elements>
            </>
          )}
        </div>
      </section>
    </>
  );
}
