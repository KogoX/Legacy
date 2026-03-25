export default function Stories() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Community Stories</h1>
        <p>Voices from the individuals whose lives have been transformed.</p>
      </div>
      <div className="page-content">
        {[ 
          { name: "Elena R.", quote: "The new community well changed everything. My daughter can now attend school instead of walking miles for water.", region: "South America" },
          { name: "David M.", quote: "The scholarship fund allowed me to become the first doctor in my village. I'm now returning to open our first clinic.", region: "East Africa" }
        ].map((story, i) => (
          <div key={i} className="form-card" style={{ borderLeft: '4px solid var(--gold)' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--green)', marginBottom: '0.5rem', fontFamily: 'Playfair Display, serif' }}>{story.name}</h3>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', marginBottom: '1rem' }}>{story.region}</div>
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '1.1rem', lineHeight: '1.8' }}>
              "{story.quote}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
