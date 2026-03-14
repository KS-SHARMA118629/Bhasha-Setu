import { useState } from 'react';
import { Search, FileText, CheckCircle, MapPin, Globe } from 'lucide-react';

const GovtSchemes = ({ language = 'en' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Simulated DB / AI response
  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setResults([
        {
          id: 1,
          title: "PM Kisan Samman Nidhi",
          translatedTitle: language !== 'en' ? "PM Kisan Samman Nidhi (Translated)" : "PM Kisan Samman Nidhi",
          description: "An initiative by the Government providing minimum income support up to ₹6,000 to all farmers.",
          eligibility: "Farmers with cultivable land up to 2 hectares.",
          docs: "Aadhaar Card, Bank Passbook, Land Ownership documents."
        },
        {
          id: 2,
          title: "Ayushman Bharat scheme",
          translatedTitle: language !== 'en' ? "Ayushman Bharat scheme (Translated)" : "Ayushman Bharat scheme",
          description: "National public health insurance fund aiming to provide free access to health insurance coverage for low income earners.",
          eligibility: "Based on the deprivation and occupational criteria of the Socio-Economic Caste Census.",
          docs: "Aadhaar Card, Ration Card."
        }
      ]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        <FileText size={24} color="var(--primary)" />
        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Government Schemes Directory</h3>
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Search for government schemes and get AI-translated explanations in {language.toUpperCase()}.
      </p>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text" className="input-field" style={{ paddingLeft: '40px' }}
            placeholder="E.g. Healthcare, Farmers, Students..." 
            value={query} onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {results.map((scheme) => (
          <div key={scheme.id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', borderLeft: '4px solid var(--success)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{scheme.translatedTitle}</h4>
               {language !== 'en' && <span style={{ fontSize: '0.8rem', background: 'var(--bg-color-alt)', padding: '2px 8px', borderRadius: '12px' }}><Globe size={12}/> Translated</span>}
            </div>
            
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{scheme.description}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
              <div>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--warning)', marginBottom: '4px' }}>
                  <CheckCircle size={16} /> Eligibility
                </strong>
                <span style={{ color: 'var(--text-muted)' }}>{scheme.eligibility}</span>
              </div>
              <div>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', marginBottom: '4px' }}>
                  <FileText size={16} /> Required Documents
                </strong>
                <span style={{ color: 'var(--text-muted)' }}>{scheme.docs}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GovtSchemes;
