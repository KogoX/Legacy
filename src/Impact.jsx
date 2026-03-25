export default function Impact() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Our Impact</h1>
        <p>Measurable change across 18 global regions.</p>
      </div>
      <div className="page-content">
        <div className="stats-inner" style={{ padding: '2rem 0', background: 'transparent' }}>
          {[
            [ "124k+", "Lives Impacted" ], 
            [ "$8.2M", "Funds Deployed" ], 
            [ "45", "Schools Built" ], 
            [ "18", "Global Regions" ]
          ].map(([n, l]) => (
            <div key={l} className="stat-item">
              <div className="stat-num">{n}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>
        <div className="form-card">
          <h3 style={{ fontSize: '1.5rem', color: 'var(--green)', marginBottom: '1rem', fontFamily: 'Playfair Display, serif' }}>2025 Year in Review</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
            This year, thanks to the immense generosity of our donors, we achieved an incredible milestone: deploying over $8 million 
            toward educational infrastructure and clean water initiatives. By focusing on root causes rather than temporary symptoms, 
            we've seen a 300% increase in regional self-sufficiency metrics.
          </p>
        </div>
      </div>
    </div>
  );
}
