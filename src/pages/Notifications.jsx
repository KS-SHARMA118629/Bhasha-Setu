import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Bell, Info, AlertCircle, MessageSquare, ShieldCheck, Mail, BadgeCheck, User } from 'lucide-react';

const Notifications = ({ session }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchNotifications();
    }
  }, [session]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // We assume a 'system_notifications' table exists. If not, it falls back to mock data.
      const { data, error } = await supabase
        .from('system_notifications')
        .select(`
          *,
          sender:profiles(name, avatar_url, verified)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.warn('Could not fetch from system_notifications, falling back to mock UI:', err.message);
      // Fallback UI
      setNotifications([
        { id: 1, title: 'Welcome to BhashaSetu!', message: 'Your language journey begins here.', type: 'info', created_at: new Date().toISOString() },
        { id: 2, title: 'New Feature Available', message: 'You can now view trending community groups.', type: 'alert', created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: 3, title: 'Profile Secure', message: 'Your profile has been secured via Supabase.', type: 'security', created_at: new Date(Date.now() - 172800000).toISOString() }
      ]);
    }
    setLoading(false);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'info': return <Info size={24} color="var(--primary)" />;
      case 'alert': return <AlertCircle size={24} color="var(--warning)" />;
      case 'message': return <MessageSquare size={24} color="var(--success)" />;
      case 'security': return <ShieldCheck size={24} color="var(--danger)" />;
      default: return <Bell size={24} color="var(--primary)" />;
    }
  };

  if (!session) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2>Please Login to View Notifications</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Bell size={36} color="var(--primary)" /> Notifications
      </h1>

      <div className="glass-panel" style={{ padding: '2rem', minHeight: '50vh' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '3rem' }}>
            <Mail size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <p>You have no new notifications.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notifications.map((notif) => (
              <div key={notif.id} style={{ 
                display: 'flex', gap: '1rem', padding: '1rem', 
                background: 'var(--input-bg)', borderRadius: '12px', 
                border: '1px solid var(--border-color)',
                alignItems: 'flex-start'
              }}>
                <div style={{ marginTop: '4px' }}>
                  {getIcon(notif.type)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', margin: '0 0 4px 0', color: 'var(--text-main)' }}>{notif.title}</h3>
                  {notif.sender && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <img 
                        src={notif.sender.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.sender.name}`} 
                        alt={notif.sender.name} 
                        style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} 
                      />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>{notif.sender.name}</span>
                      {notif.sender.verified && <BadgeCheck size={14} fill="#1DA1F2" color="#fff" title="Verified" />}
                    </div>
                  )}
                  <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>{notif.message}</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.8 }}>
                    {new Date(notif.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
