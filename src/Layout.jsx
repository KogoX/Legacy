import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Layout() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Handle jump links
  useEffect(() => {
    if (location.hash === '#donate') {
      const el = document.getElementById('donate');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, location.hash]);

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
          --nav-height: 72px;
        }

        body { background: var(--cream); color: var(--text); font-family: 'Source Sans 3', sans-serif; }
        img, svg { max-width: 100%; height: auto; }

        /* ── NAV ── */
        .nav {
          position: fixed; top: 0; width: 100%; z-index: 50;
          transition: background 0.3s, box-shadow 0.3s;
          padding: 0 2rem;
        }
        .nav.scrolled { background: rgba(252,249,244,0.92); backdrop-filter: blur(16px); box-shadow: 0 1px 0 var(--cream-low); }
        .nav-inner { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; height: var(--nav-height); gap: 1rem; }
        .nav-logo { font-family: 'Playfair Display', serif; font-weight: 600; font-size: 1.25rem; color: var(--green); letter-spacing: -0.02em; text-decoration: none; }
        .nav-links { display: flex; gap: 2rem; align-items: center; }
        .nav-links a { color: var(--text-muted); text-decoration: none; font-size: 0.9rem; transition: color 0.2s; }
        .nav-links a:hover { color: var(--green); }
        .nav-cta { background: var(--green); color: var(--gold-light) !important; padding: 0.5rem 1.25rem; border-radius: 2px; font-weight: 600; font-size: 0.875rem; border: none; cursor: pointer; transition: opacity 0.2s; display: inline-block; text-align: center; }
        .nav-cta:hover { opacity: 0.88; }
        
        .mobile-menu-btn { display: none; background: transparent; border: none; color: var(--green); cursor: pointer; }
        .mobile-nav { display: none; position: absolute; top: var(--nav-height); left: 0; width: 100%; background: var(--cream); flex-direction: column; padding: 2rem 1.25rem; gap: 1.5rem; box-shadow: 0 10px 20px rgba(0,0,0,0.05); border-top: 1px solid var(--cream-low); max-height: calc(100vh - var(--nav-height)); overflow-y: auto; }
        .mobile-nav.open { display: flex; animation: fadeDown 0.3s ease; }
        .mobile-nav a { font-size: 1.1rem; color: var(--text); text-decoration: none; font-weight: 600; }
        .mobile-nav .nav-cta { margin-top: 1rem; width: 100%; padding: 1rem; z-index: 100; }

        @media (max-width: 768px) {
          :root { --nav-height: 64px; }
          .nav-links { display: none; }
          .mobile-menu-btn { display: block; }
          .nav { padding: 0 1.25rem; }
          .nav-logo { font-size: 1.1rem; }
          .hero, .stats { padding-left: 1.25rem; padding-right: 1.25rem; }
          .donation-section { padding: 4rem 1.25rem; gap: 3rem; }
          .form-card { padding: 1.5rem; }
          .stats-inner { gap: 2.5rem; }
          .editorial { position: static; }
        }
        @media (max-width: 520px) {
          .nav { padding: 0 1rem; }
          .hero { min-height: auto; padding: 5.5rem 1rem 3.5rem; }
          .hero-title { font-size: clamp(2.2rem, 9vw, 3.4rem); }
          .hero-sub { font-size: 1rem; margin-bottom: 2rem; }
          .hero-scroll { display: none; }
          .stats { padding: 3rem 1rem; }
          .stat-num { font-size: 2.2rem; }
          .donation-section { padding: 3.5rem 1rem; gap: 2.5rem; }
          .trust-items { padding: 1.2rem; }
          .trust-item { gap: 0.75rem; }
          .form-card { padding: 1.25rem; }
          .amount-btn { padding: 0.85rem 0.5rem; font-size: 1.05rem; }
          .success-actions { flex-direction: column; align-items: stretch; }
          .btn-primary, .btn-secondary { width: 100%; }
          .page-container { padding: 4.5rem 1rem; }
          .page-header { margin-bottom: 2.5rem; }
          .page-header h1 { font-size: clamp(2.1rem, 8vw, 2.8rem); }
          .page-header p { font-size: 1rem; }
          .page-content { gap: 1.5rem; }
          .footer { padding: 2.5rem 1rem; }
          .footer-inner { flex-direction: column; align-items: flex-start; }
          .footer-links { gap: 1rem; }
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

        /* ── ADMIN/PAGE LAYOUT ── */
        .page-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 6rem 2rem;
          min-height: 60vh;
        }
        .page-header { margin-bottom: 4rem; text-align: center; }
        .page-header h1 { font-family: 'Playfair Display', serif; font-size: 3.5rem; color: var(--green); margin-bottom: 1rem; }
        .page-header p { font-size: 1.2rem; color: var(--text-muted); max-width: 600px; margin: 0 auto; }
        .page-content { display: flex; flex-direction: column; gap: 2.5rem; }

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
          <Link to="/" className="nav-logo">The Curated Legacy</Link>
          <nav className="nav-links">
            <Link to="/mission">Our Mission</Link>
            <Link to="/impact">Impact</Link>
            <Link to="/stories">Stories</Link>
            <Link to="/transparency">Transparency</Link>
            <Link to="/#donate" className="nav-cta">
              Donate Now
            </Link>
          </nav>
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <nav className="mobile-nav open">
            <Link to="/mission" onClick={() => setMobileMenuOpen(false)}>Our Mission</Link>
            <Link to="/impact" onClick={() => setMobileMenuOpen(false)}>Impact</Link>
            <Link to="/stories" onClick={() => setMobileMenuOpen(false)}>Stories</Link>
            <Link to="/transparency" onClick={() => setMobileMenuOpen(false)}>Transparency</Link>
            <Link to="/#donate" className="nav-cta" onClick={() => setMobileMenuOpen(false)}>
              Donate Now
            </Link>
          </nav>
        )}
      </header>

      <main style={{ minHeight: '100vh', paddingTop: 'var(--nav-height)' }}>
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <div className="footer-logo">The Curated Legacy</div>
            <div className="footer-copy">© 2025 The Curated Legacy Foundation. All rights reserved.</div>
          </div>
          <nav className="footer-links">
            <Link to="/transparency">Financial Reports</Link>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact Us</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
