export default function OurMission() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Our Mission</h1>
        <p>Preserving human dignity through intentional philanthropy.</p>
      </div>
      <div className="page-content">
        <div className="form-card">
          <h3 style={{ fontSize: '1.5rem', color: 'var(--green)', marginBottom: '1rem', fontFamily: 'Playfair Display, serif' }}>A Foundation Built on Hope</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
            The Curated Legacy Foundation was established to bridge the gap between resources and those who need them most. 
            We believe that wellness and education are not privileges, but fundamental human rights. Through our targeted global programs, 
            we empower communities to build sustainable futures.
          </p>
          <br />
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
            Our approach goes beyond traditional charity. We partner directly with local leaders to understand the unique challenges 
            of each region, ensuring that every dollar spent creates a genuine, lasting impact.
          </p>
        </div>
      </div>
    </div>
  );
}
