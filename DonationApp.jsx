import { useState, useEffect } from "react";
import { CheckCircle, Sprout, Lock, Menu, X } from "lucide-react";
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
export default function DonationApp() {
  const [selectedAmount, setSelectedAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState("");
  const [donated, setDonated] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [finalAmount, setFinalAmount] = useState(25);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSuccess = (amount, name) => {
    setFinalAmount(amount);
    setDonorName(name);
    setDonated(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400;1,700&family=Source+Sans+3:wght@300;400;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --green: #02331a;
          --green-mid: #1d4a2f;
          --gold: #7d5700;
          --gold-light: #fdc664;
          --gold-pale: #fff8ec;
          --cream: #fcf9f4;
          --cream-mid: #f0ede9;
          --cream-low: #e5e2dd;
          --text: #1c1c19;
          --text-muted: #414942;
          --text-faint: #717971;
          --error: #ba1a1a;
        }

        body { background: var(--cream); color: var(--text); font-family: 'Source Sans 3', sans-serif; }

        /* ── NAV ── */
        .nav {
          position: fixed; top: 0; width: 100%; z-index: 50;
          transition: background 0.3s, box-shadow 0.3s;
          padding: 0 2rem;
        }
        .nav.scrolled { background: rgba(252,249,244,0.92); backdrop-filter: blur(16px); box-shadow: 0 1px 0 var(--cream-low); }
        .nav-inner { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; height: 72px; }
        .nav-logo { font-family: 'Playfair Display', serif; font-weight: 600; font-size: 1.25rem; color: var(--green); letter-spacing: -0.02em; }
        .nav-links { display: flex; gap: 2rem; align-items: center; }
        .nav-links a { color: var(--text-muted); text-decoration: none; font-size: 0.9rem; transition: color 0.2s; }
        .nav-links a:hover { color: var(--green); }
        .nav-cta { background: var(--green); color: var(--gold-light); padding: 0.5rem 1.25rem; border-radius: 2px; font-weight: 600; font-size: 0.875rem; border: none; cursor: pointer; transition: opacity 0.2s; }
        .nav-cta:hover { opacity: 0.88; }
        
        .mobile-menu-btn { display: none; background: transparent; border: none; color: var(--green); cursor: pointer; }
        .mobile-nav { display: none; position: absolute; top: 72px; left: 0; width: 100%; background: var(--cream); flex-direction: column; padding: 2rem 1.25rem; gap: 1.5rem; box-shadow: 0 10px 20px rgba(0,0,0,0.05); border-top: 1px solid var(--cream-low); }
        .mobile-nav.open { display: flex; animation: fadeDown 0.3s ease; }
        .mobile-nav a { font-size: 1.1rem; color: var(--text); text-decoration: none; font-weight: 600; }
        .mobile-nav .nav-cta { margin-top: 1rem; width: 100%; padding: 1rem; }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .mobile-menu-btn { display: block; }
          .nav { padding: 0 1.25rem; }
          .hero, .stats { padding-left: 1.25rem; padding-right: 1.25rem; }
          .donation-section { padding: 4rem 1.25rem; gap: 3rem; }
          .form-card { padding: 1.5rem; }
          .stats-inner { gap: 2.5rem; }
        }
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

        /* ── HERO ── */
        .hero {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: 
            linear-gradient(180deg, rgba(252,249,244,0.2) 0%, rgba(252,249,244,0.85) 60%, var(--cream) 100%),
            radial-gradient(ellipse at 60% 40%, rgba(253,198,100,0.18) 0%, transparent 65%),
            radial-gradient(ellipse at 20% 70%, rgba(2,51,26,0.07) 0%, transparent 50%);
          padding: 6rem 2rem 4rem;
          text-align: center;
        }
        .hero-content { max-width: 800px; animation: fadeUp 1s ease both; }
        .hero-eyebrow { font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); font-weight: 600; margin-bottom: 1.5rem; }
        .hero-title { font-family: 'Playfair Display', serif; font-size: clamp(3rem, 8vw, 6rem); font-style: italic; color: var(--green); line-height: 1.05; margin-bottom: 1.5rem; }
        .hero-sub { font-size: 1.2rem; color: var(--text-muted); font-weight: 300; line-height: 1.7; max-width: 540px; margin: 0 auto 3rem; }
        .hero-scroll { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
        .hero-scroll span { font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gold); font-weight: 600; }
        .scroll-line { width: 1px; height: 60px; background: linear-gradient(to bottom, var(--gold), transparent); animation: scrollPulse 2s ease-in-out infinite; }

        /* ── STATS ── */
        .stats { background: var(--cream-mid); padding: 4rem 2rem; }
        .stats-inner { max-width: 900px; margin: 0 auto; display: flex; justify-content: center; gap: 5rem; flex-wrap: wrap; }
        .stat-item { text-align: center; }
        .stat-num { font-family: 'Playfair Display', serif; font-size: 2.75rem; color: var(--gold); line-height: 1; }
        .stat-label { font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text-faint); margin-top: 0.4rem; }

        /* ── MAIN SECTION ── */
        .donation-section { max-width: 1200px; margin: 0 auto; padding: 6rem 2rem; display: grid; grid-template-columns: 1fr 1fr; gap: 6rem; align-items: start; }
        @media (max-width: 960px) { .donation-section { grid-template-columns: 1fr; gap: 3rem; } }

        /* ── EDITORIAL COLUMN ── */
        .editorial { position: sticky; top: 7rem; }
        .section-eyebrow { font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); font-weight: 600; margin-bottom: 1rem; }
        .editorial h2 { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 4vw, 3rem); color: var(--green); line-height: 1.15; margin-bottom: 1.25rem; }
        .editorial p { color: var(--text-muted); line-height: 1.8; font-weight: 300; max-width: 440px; margin-bottom: 2.5rem; }
        .trust-items { background: var(--cream-low); border-radius: 8px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
        .trust-item { display: flex; gap: 1rem; align-items: flex-start; }
        .trust-item-icon { color: var(--gold); margin-top: 2px; flex-shrink: 0; }
        .trust-item h4 { font-size: 0.9rem; font-weight: 600; color: var(--green); margin-bottom: 0.2rem; }
        .trust-item p { font-size: 0.8rem; color: var(--text-faint); margin: 0; line-height: 1.5; }

        /* ── FORM CARD ── */
        .form-card {
          background: #fff;
          border-radius: 12px;
          padding: 2.5rem;
          box-shadow: 0 4px 6px rgba(28,28,25,0.04), 0 20px 40px rgba(28,28,25,0.06);
        }

        /* Amount Selector */
        .amount-section { margin-bottom: 2rem; }
        .amount-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 1rem; }
        @media (max-width: 480px) { .amount-grid { grid-template-columns: repeat(2, 1fr); } }
        .amount-btn {
          padding: 1rem 0.5rem;
          border: 1.5px solid var(--cream-low);
          background: var(--cream);
          border-radius: 4px;
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          color: var(--green);
          cursor: pointer;
          transition: all 0.18s;
        }
        .amount-btn:hover { border-color: var(--gold); color: var(--gold); transform: translateY(-1px); }
        .amount-btn.active { background: var(--gold-pale); border-color: var(--gold); color: var(--gold); box-shadow: 0 2px 8px rgba(125,87,0,0.12); }
        .custom-input-wrap { position: relative; }
        .custom-input-wrap span { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-faint); }
        .custom-input {
          width: 100%; padding: 0.9rem 1rem 0.9rem 1.75rem;
          background: var(--cream); border: 1.5px solid var(--cream-low);
          border-radius: 4px; font-size: 1rem; color: var(--text);
          outline: none; transition: border-color 0.18s, background 0.18s;
        }
        .custom-input:focus { border-color: var(--gold); background: #fff; }
        .custom-input::placeholder { color: var(--text-faint); }

        /* Form fields */
        .form-label { display: block; font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; color: var(--text-faint); margin-bottom: 0.4rem; }
        .form-input {
          width: 100%; padding: 0.9rem 1rem;
          background: var(--cream); border: 1.5px solid var(--cream-low);
          border-radius: 4px; font-family: 'Source Sans 3', sans-serif; font-size: 1rem; color: var(--text);
          outline: none; transition: border-color 0.18s, background 0.18s;
        }
        .form-input:focus { border-color: var(--gold); background: #fff; }
        .form-input::placeholder { color: var(--text-faint); }

        /* Stripe Card */
        .card-element-wrapper {
          background: var(--cream); border: 1.5px solid var(--cream-low);
          border-radius: 4px; padding: 1rem;
          transition: border-color 0.18s;
        }
        .card-element-wrapper:focus-within { border-color: var(--gold); background: #fff; }

        /* Divider */
        .form-divider { border: none; border-top: 1px solid var(--cream-low); margin: 1.5rem 0; }

        /* Trust Badge */
        .trust-badge { display: flex; align-items: center; justify-content: center; gap: 0.4rem; color: var(--text-faint); font-size: 0.75rem; }

        /* Error */
        .error-msg { background: #fff0f0; border: 1px solid #ffcdd2; color: var(--error); padding: 0.75rem 1rem; border-radius: 4px; font-size: 0.875rem; }

        /* Donate Button */
        .donate-btn {
          width: 100%; padding: 1.1rem;
          background: var(--green); color: var(--gold-light);
          border: none; border-radius: 4px;
          font-family: 'Source Sans 3', sans-serif; font-size: 1.05rem; font-weight: 600;
          cursor: pointer; transition: opacity 0.2s, transform 0.15s;
          box-shadow: 0 4px 14px rgba(2,51,26,0.2);
        }
        .donate-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .donate-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .btn-inner { display: flex; align-items: center; justify-content: center; gap: 0.6rem; }
        .spinner { width: 18px; height: 18px; animation: spin 0.8s linear infinite; }

        /* Legal */
        .legal-text { font-size: 0.7rem; color: var(--text-faint); text-align: center; line-height: 1.6; padding: 0 1rem; }

        /* Success */
        .success-state { text-align: center; padding: 2rem 1rem; animation: fadeUp 0.6s ease both; }
        .success-icon { width: 64px; height: 64px; margin: 0 auto 1.5rem; }
        .success-icon svg { width: 100%; height: 100%; }
        .success-title { font-family: 'Playfair Display', serif; font-size: 2rem; font-style: italic; color: var(--green); margin-bottom: 1rem; }
        .success-sub { color: var(--text-muted); line-height: 1.7; margin-bottom: 2rem; }
        .success-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .btn-primary { background: var(--green); color: var(--gold-light); padding: 0.7rem 1.5rem; border-radius: 4px; border: none; font-weight: 600; cursor: pointer; font-size: 0.9rem; }
        .btn-secondary { background: transparent; color: var(--green); padding: 0.7rem 1.5rem; border-radius: 4px; border: 1.5px solid var(--cream-low); font-weight: 600; cursor: pointer; font-size: 0.9rem; }

        /* Footer */
        .footer { background: var(--cream-mid); padding: 3rem 2rem; }
        .footer-inner { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem; }
        .footer-logo { font-family: 'Playfair Display', serif; font-weight: 600; color: var(--green); font-size: 1.1rem; }
        .footer-copy { font-size: 0.8rem; color: var(--text-faint); margin-top: 0.25rem; }
        .footer-links { display: flex; gap: 2rem; flex-wrap: wrap; }
        .footer-links a { font-size: 0.8rem; color: var(--text-faint); text-decoration: none; transition: color 0.2s; }
        .footer-links a:hover { color: var(--gold); }

        /* Animations */
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scrollPulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
      `}</style>

      {/* NAV */}
      <header className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-inner">
          <div className="nav-logo">The Curated Legacy</div>
          <nav className="nav-links">
            <a href="#">Our Mission</a>
            <a href="#">Impact</a>
            <a href="#">Stories</a>
            <a href="#">Transparency</a>
            <button className="nav-cta" onClick={() => document.getElementById("donate").scrollIntoView({ behavior: "smooth" })}>
              Donate Now
            </button>
          </nav>
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <nav className="mobile-nav open">
            <a href="#" onClick={() => setMobileMenuOpen(false)}>Our Mission</a>
            <a href="#" onClick={() => setMobileMenuOpen(false)}>Impact</a>
            <a href="#" onClick={() => setMobileMenuOpen(false)}>Stories</a>
            <a href="#" onClick={() => setMobileMenuOpen(false)}>Transparency</a>
            <button className="nav-cta" onClick={() => { setMobileMenuOpen(false); document.getElementById("donate").scrollIntoView({ behavior: "smooth" }); }}>
              Donate Now
            </button>
          </nav>
        )}
      </header>

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
        <div className="form-card">
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

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <div className="footer-logo">The Curated Legacy</div>
            <div className="footer-copy">© 2025 The Curated Legacy Foundation. All rights reserved.</div>
          </div>
          <nav className="footer-links">
            {["Privacy Policy", "Terms of Service", "Financial Reports", "Contact Us"].map((l) => (
              <a key={l} href="#">{l}</a>
            ))}
          </nav>
        </div>
      </footer>
    </>
  );
}
