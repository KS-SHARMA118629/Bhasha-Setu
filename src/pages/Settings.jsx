import { useState, useEffect } from 'react';
import { Moon, Sun, Bell, Globe, Shield, Save } from 'lucide-react';
import UserProfile from '../components/UserProfile';
import { supabase } from '../lib/supabase';

const Settings = ({ session }) => {
  // Pull from local storage or default to dark
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('bhashasetu-theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (session) {
      const getProfile = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(data);
      };
      getProfile();
    }
  }, [session]);

  useEffect(() => {
    // Apply class to body for global CSS var changes
    if (isDarkMode) {
      document.body.classList.remove('light-mode');
      localStorage.setItem('bhashasetu-theme', 'dark');
    } else {
      document.body.classList.add('light-mode');
      localStorage.setItem('bhashasetu-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleSaveSimulate = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 800);
  };

  if (!session) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Please Login to view settings</p>;

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem', letterSpacing: '-0.03em' }}>Settings</h1>

      <div style={{ marginBottom: '2rem' }}>
        <UserProfile profile={profile} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Appearance Settings */}
        <section className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            {isDarkMode ? <Moon size={24} color="var(--primary)" /> : <Sun size={24} color="var(--warning)" />}
            <h3 style={{ fontSize: '1.25rem' }}>Appearance</h3>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--input-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div>
              <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>Dark Theme</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Switch between Light and Dark mode globally.</p>
            </div>

            {/* Custom Toggle Switch */}
            <div
              onClick={toggleTheme}
              style={{
                width: '56px', height: '30px',
                background: isDarkMode ? 'var(--primary)' : 'var(--text-muted)',
                borderRadius: '30px', position: 'relative', cursor: 'pointer',
                transition: 'background 0.3s'
              }}
            >
              <div style={{
                width: '24px', height: '24px', background: '#fff', borderRadius: '50%',
                position: 'absolute', top: '3px',
                left: isDarkMode ? '29px' : '3px',
                transition: 'left 0.3s ease-in-out',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </div>
          </div>
        </section>

        {/* Placeholder: Notifications */}
        <section className="glass-panel" style={{ padding: '2rem', opacity: 0.7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <Bell size={24} color="var(--success)" />
            <h3 style={{ fontSize: '1.25rem' }}>Notifications (Coming Soon)</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Manage email alerts and SMS notifications for new tickets and replies.
          </p>
          <button disabled className="btn-secondary" style={{ opacity: 0.5 }}>Configure Preferences</button>
        </section>

        {/* Placeholder: Language Default */}
        <section className="glass-panel" style={{ padding: '2rem', opacity: 0.7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <Globe size={24} color="var(--primary)" />
            <h3 style={{ fontSize: '1.25rem' }}>App Region (Coming Soon)</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            The UI language is currently inherited from your Profile settings.
          </p>
        </section>

        {/* Placeholder: Privacy Options */}
        <section className="glass-panel" style={{ padding: '2rem', opacity: 0.7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <Shield size={24} color="var(--danger)" />
            <h3 style={{ fontSize: '1.25rem' }}>Privacy options (Coming Soon)</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Manage data sharing, cookies, and linked government IDs.
          </p>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button onClick={handleSaveSimulate} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;
