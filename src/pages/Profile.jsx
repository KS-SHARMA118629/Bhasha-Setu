import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Phone, MapPin, Globe, Loader2, Link2 } from 'lucide-react';

const Profile = ({ session }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // local states for form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [lang, setLang] = useState('en');
  const [govIdUrl, setGovIdUrl] = useState('');

  useEffect(() => {
    if (session) fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (data) {
      setProfile(data);
      setName(data.name || '');
      setPhone(data.phone_number || '');
      setAddress(data.address || '');
      setLang(data.preferred_language || 'en');
      setGovIdUrl(data.government_id_url || '');
    }
    setLoading(false);
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      name,
      phone_number: phone,
      address,
      preferred_language: lang,
      government_id_url: govIdUrl
    }).eq('id', session.user.id);
    setSaving(false);
    if (!error) fetchProfile();
  };

  const requestVerification = async () => {
    setSaving(true);
    await supabase.from('profiles').update({ verification_status: 'pending' }).eq('id', session.user.id);
    fetchProfile();
    setSaving(false);
  };

  if (!session) return <p style={{ textAlign: 'center' }}>Please Login</p>;
  if (loading) return <p style={{ textAlign: 'center' }}>Loading...</p>;

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem' }}>User Profile</h1>
          <span style={{ 
            padding: '6px 12px', borderRadius: '8px', 
            background: profile?.verification_status === 'verified' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            color: profile?.verification_status === 'verified' ? 'var(--success)' : 'var(--warning)',
            fontWeight: 600, textTransform: 'uppercase'
          }}>
            {profile?.verification_status.replace('_', ' ')}
          </span>
        </div>

        <form onSubmit={updateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Full Name</label>
            <User size={20} style={{ position: 'absolute', top: '40px', left: '12px', color: 'var(--text-muted)' }} />
            <input type="text" className="input-field" style={{ paddingLeft: '40px' }} value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Phone Number</label>
            <Phone size={20} style={{ position: 'absolute', top: '40px', left: '12px', color: 'var(--text-muted)' }} />
            <input type="tel" className="input-field" style={{ paddingLeft: '40px' }} value={phone} onChange={e => setPhone(e.target.value)} />
          </div>

          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Address</label>
            <MapPin size={20} style={{ position: 'absolute', top: '40px', left: '12px', color: 'var(--text-muted)' }} />
            <input type="text" className="input-field" style={{ paddingLeft: '40px' }} value={address} onChange={e => setAddress(e.target.value)} />
          </div>

          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Preferred Language</label>
            <Globe size={20} style={{ position: 'absolute', top: '40px', left: '12px', color: 'var(--text-muted)' }} />
            <select className="input-field" style={{ paddingLeft: '40px', appearance: 'none' }} value={lang} onChange={e => setLang(e.target.value)}>
              <option value="en">English</option>
              <option value="hi">Hindi (हिन्दी)</option>
              <option value="ta">Tamil (தமிழ்)</option>
            </select>
          </div>

          <hr style={{ borderColor: 'var(--border-color)', margin: '1rem 0' }} />

          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Government ID URL (Optional)</label>
            <Link2 size={20} style={{ position: 'absolute', top: '40px', left: '12px', color: 'var(--text-muted)' }} />
            <input type="url" className="input-field" style={{ paddingLeft: '40px' }} placeholder="Link to ID proof image/document" value={govIdUrl} onChange={e => setGovIdUrl(e.target.value)} />
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
             {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </form>

        {profile?.verification_status === 'not_verified' && (
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--warning)', marginBottom: '0.5rem' }}>Want faster support?</h4>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Verify your identity by providing a Government ID and clicking the button below.</p>
            <button onClick={requestVerification} disabled={saving} className="btn-secondary" style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }}>
              Request Verification
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
