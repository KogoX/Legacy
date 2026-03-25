import { CheckCircle } from "lucide-react";

export default function Transparency() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Financial Transparency</h1>
        <p>Every dollar tracked. Every outcome measured.</p>
      </div>
      <div className="page-content">
        <div className="form-card">
          <h3 style={{ fontSize: '1.5rem', color: 'var(--green)', marginBottom: '1.5rem', fontFamily: 'Playfair Display, serif' }}>Our Commitment to You</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[
              "92% of all donations go directly to community programs.",
              "Quarterly independent audits available to all active donors.",
              "Real-time tracking of infrastructure projects via satellite imaging.",
              "Rigorous anti-corruption frameworks embedded in all partner contracts."
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <CheckCircle size={24} color="var(--gold)" />
                <span style={{ color: 'var(--text)', fontSize: '1.05rem' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
