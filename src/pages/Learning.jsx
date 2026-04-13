import { useState, useEffect } from 'react';
import { BookOpen, Search, ShieldCheck, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Learning = ({ session }) => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSchemes();
  }, []);

  // Fetch schemes from mock or real database
  const fetchSchemes = async () => {
    try {
      setLoading(true);
      // Ensure there's a 'schemes' table or fallback to empty array
      const { data, error } = await supabase
        .from('schemes')
        .select(`
          id, title, description, language, 
          profiles:uploader_id (name, avatar_url, verified)
        `);
      
      if (error && error.code !== '42P01') throw error; // Ignore table not found initially

      if (data) {
        setSchemes(data);
      } else {
        // Sample data if table is empty or doesn't exist
        setSchemes([
          {
            id: 1,
            title: "Pradhan Mantri Jan Dhan Yojana (PMJDY)",
            description: "A national mission for financial inclusion to ensure access to financial services.",
            language: "English",
            profiles: { name: "Admin_Govt", verified: true, avatar_url: "" }
          },
          {
            id: 2,
            title: "आयुष्मान भारत योजना (Ayushman Bharat)",
            description: "कम आय वाले लोगों को स्वास्थ्य बीमा कवरेज प्रदान करने वाली योजना।",
            language: "Hindi",
            profiles: { name: "HealthDept", verified: true, avatar_url: "" }
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchemes = schemes.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
        <BookOpen size={32} color="var(--primary)" />
        <h2>Learning & Government Schemes</h2>
      </div>

      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <Search size={20} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          className="input-field" 
          placeholder="Search schemes or benefits..." 
          style={{ paddingLeft: '40px' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading schemes...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredSchemes.map((scheme) => (
            <div key={scheme.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.4rem' }}>{scheme.title}</h3>
                <span className="badge" style={{ background: 'var(--bg-color-alt)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <Globe size={14} /> {scheme.language}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>{scheme.description}</p>
              
              {/* Uploader Profile */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                {scheme.profiles?.avatar_url ? (
                  <img src={scheme.profiles.avatar_url} alt="Profile" style={{ width: 30, height: 30, borderRadius: '50%' }} />
                ) : (
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                    {scheme.profiles?.name?.charAt(0) || 'A'}
                  </div>
                )}
                <div style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Uploaded by: <strong style={{ color: 'var(--text-main)' }}>{scheme.profiles?.name || 'Unknown'}</strong>
                  {scheme.profiles?.verified && <ShieldCheck size={16} color="var(--primary)" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Learning;
