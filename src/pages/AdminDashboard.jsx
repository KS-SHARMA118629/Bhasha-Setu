import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Users, ShieldCheck, Ban, CheckCircle, RotateCcw, 
  Edit3, Search, Key, User as UserIcon, Send, Bell
} from 'lucide-react';

const AdminDashboard = ({ session }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showKeyGate, setShowKeyGate] = useState(true);
  const [inputKey, setInputKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // track which user is being updated
  
  // Notification State
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('info');
  const [sendingNotif, setSendingNotif] = useState(false);
  const [notifStatus, setNotifStatus] = useState('');
  
  // Edit Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    role: 'citizen',
    bio: '',
    age: '',
    is_admin: false,
    verified: false
  });

  useEffect(() => {
    if (session) {
      const savedKey = sessionStorage.getItem('admin_session_key');
      if (savedKey) {
        verifyKey(savedKey);
      }
      checkAdminStatus();
    }
  }, [session]);

  const checkAdminStatus = async () => {
    try {
      const { data } = await supabase.from('profiles').select('is_admin, role').eq('id', session.user.id).single();
      if (data?.is_admin || data?.role === 'admin') {
        setIsAdmin(true);
      }
    } catch (err) {
      console.error('Admin check failed:', err);
    }
  };

  const verifyKey = async (key) => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'admin_access_key')
        .single();

      if (data && data.value === key) {
        setShowKeyGate(false);
        sessionStorage.setItem('admin_session_key', key);
        fetchUsers();
      } else {
        setErrorMsg('Invalid Access Key');
        sessionStorage.removeItem('admin_session_key');
      }
    } catch (err) {
      setErrorMsg('Error connecting to security server');
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      alert('Failed to fetch users: ' + err.message);
    }
    setLoading(false);
  };

  const handleKeySubmit = (e) => {
    e.preventDefault();
    verifyKey(inputKey);
  };

  const toggleBan = async (id, currentStatus) => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      await fetchUsers();
    } catch (err) {
      alert('Error updating ban status: ' + err.message);
    }
    setActionLoading(null);
  };

  const verifyUser = async (id) => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          verification_status: 'verified', 
          verified: true 
        })
        .eq('id', id);
      
      if (error) throw error;
      await fetchUsers();
    } catch (err) {
      alert('Error verifying user: ' + err.message);
    }
    setActionLoading(null);
  };

  const startEditing = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name || '',
      role: user.role || 'citizen',
      bio: user.bio || '',
      age: user.age || '',
      is_admin: user.is_admin || false,
      verified: user.verified || false
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setActionLoading(editingUser.id);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editFormData.name,
          role: editFormData.role,
          bio: editFormData.bio,
          age: editFormData.age ? parseInt(editFormData.age) : null,
          is_admin: editFormData.is_admin,
          verified: editFormData.verified,
          verification_status: editFormData.verified ? 'verified' : 'not_verified'
        })
        .eq('id', editingUser.id);

      if (error) throw error;
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      alert('Error saving user: ' + err.message);
    }
    setActionLoading(null);
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage) return;
    setSendingNotif(true);
    setNotifStatus('');
    try {
      const { error } = await supabase.from('system_notifications').insert({
        title: notifTitle,
        message: notifMessage,
        type: notifType,
        sender_id: session.user.id
      });
      if (error) throw error;
      setNotifStatus('Notification sent successfully!');
      setNotifTitle('');
      setNotifMessage('');
    } catch (err) {
      console.warn('Notification failed (check if table exists):', err.message);
      setNotifStatus('Failed to send (Does system_notifications table exist?)');
    }
    setSendingNotif(false);
    setTimeout(() => setNotifStatus(''), 5000);
  };

  const filteredUsers = users.filter(u => 
    (u.name?.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (u.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!session) return <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}><h2>Please Log In</h2></div>;
  if (!isAdmin && !loading) return <div className="container" style={{ textAlign: 'center', marginTop: '5rem', color: 'var(--danger)' }}><h2>403: Admin Only Access</h2></div>;

  if (showKeyGate) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <Key size={48} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ marginBottom: '1rem' }}>Admin Access Locked</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Please enter the secret master key to proceed.</p>
          <form onSubmit={handleKeySubmit}>
            <input 
              type="password" 
              className="input-field" 
              placeholder="Enter Access Key..." 
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              style={{ marginBottom: '1rem', textAlign: 'center' }}
              autoFocus
            />
            {errorMsg && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>{errorMsg}</p>}
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Unlock Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={36} color="var(--primary)" /> Admin Control Center
        </h1>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input-field" 
            style={{ paddingLeft: '40px' }} 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Broadcast System Notification Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <Bell size={24} color="var(--primary)" /> Send System Notification
        </h2>
        <form onSubmit={handleSendNotification} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '1rem', alignItems: 'flex-start' }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Notification Title" 
              value={notifTitle}
              onChange={(e) => setNotifTitle(e.target.value)}
              required
            />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Message description..." 
              value={notifMessage}
              onChange={(e) => setNotifMessage(e.target.value)}
              required
            />
            <select 
              className="input-field" 
              value={notifType} 
              onChange={(e) => setNotifType(e.target.value)}
            >
              <option value="info">Info</option>
              <option value="alert">Alert</option>
              <option value="message">Message</option>
              <option value="security">Security</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
            {notifStatus && <span style={{ color: notifStatus.includes('Failed') ? 'var(--danger)' : 'var(--success)', fontSize: '0.9rem' }}>{notifStatus}</span>}
            <button type="submit" className="btn-primary" disabled={sendingNotif}>
              {sendingNotif ? 'Sending...' : <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Send size={16} /> Broadcast</span>}
            </button>
          </div>
        </form>
      </div>

      {loading && users.length === 0 ? (
        <div style={{ textAlign: 'center', py: '5rem' }}>Loading users...</div>
      ) : (
        <div className="responsive-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
          {filteredUsers.map(user => (
            <div key={user.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', opacity: actionLoading === user.id ? 0.6 : 1 }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'var(--bg-color-alt)', overflow: 'hidden' }}>
                  <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{user.name || 'Anonymous User'}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{user.id.slice(0, 8)}...</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: user.role === 'admin' ? 'rgba(192, 132, 252, 0.15)' : 'rgba(255, 255, 255, 0.05)', color: user.role === 'admin' ? '#c084fc' : 'var(--text-muted)' }}>
                      {user.role}
                    </span>
                    {user.verified && <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>Verified</span>}
                    {user.is_banned && <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' }}>Banned</span>}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.9rem' }}>
                <p style={{ margin: '0.25rem 0' }}><strong>Age:</strong> {user.age || 'N/A'}</p>
                <p style={{ opacity: 0.8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  <strong>Bio:</strong> {user.bio || 'No bio provided.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <button 
                  onClick={() => startEditing(user)} 
                  className="btn-secondary" 
                  disabled={actionLoading === user.id}
                  style={{ flex: 1, padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Edit3 size={16} /> Edit
                </button>
                <button 
                  onClick={() => verifyUser(user.id)} 
                  className="btn-secondary" 
                  disabled={user.verified || actionLoading === user.id}
                  style={{ 
                    flex: 1, 
                    padding: '0.5rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '6px', 
                    borderColor: 'var(--success)', 
                    color: 'var(--success)',
                    opacity: user.verified ? 0.5 : 1
                  }}
                >
                  <CheckCircle size={16} /> {user.verified ? 'Verified' : 'Verify'}
                </button>
                <button 
                  onClick={() => toggleBan(user.id, user.is_banned)} 
                  className="btn-secondary" 
                  disabled={actionLoading === user.id}
                  style={{ 
                    padding: '0.5rem', 
                    borderColor: user.is_banned ? 'var(--success)' : 'var(--danger)', 
                    color: user.is_banned ? 'var(--success)' : 'var(--danger)' 
                  }}
                  title={user.is_banned ? "Unban User" : "Ban User"}
                >
                  {user.is_banned ? <RotateCcw size={16} /> : <Ban size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', animation: 'fadeIn 0.2s' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Edit User Details</h2>
            <form onSubmit={saveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--text-muted)' }}>Name</label>
                <input type="text" className="input-field" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} placeholder="User Name" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--text-muted)' }}>Role</label>
                  <select className="input-field" value={editFormData.role} onChange={e => setEditFormData({...editFormData, role: e.target.value})}>
                    <option value="citizen">Citizen</option>
                    <option value="official">Official</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--text-muted)' }}>Age</label>
                  <input type="number" className="input-field" value={editFormData.age} onChange={e => setEditFormData({...editFormData, age: e.target.value})} placeholder="Age" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--text-muted)' }}>Bio</label>
                <textarea className="input-field" style={{ minHeight: '100px' }} value={editFormData.bio} onChange={e => setEditFormData({...editFormData, bio: e.target.value})} placeholder="Short bio..." />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" id="is_admin" checked={editFormData.is_admin} onChange={e => setEditFormData({...editFormData, is_admin: e.target.checked})} />
                  <label htmlFor="is_admin">Is System Admin</label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" id="verified_user" checked={editFormData.verified} onChange={e => setEditFormData({...editFormData, verified: e.target.checked})} />
                  <label htmlFor="verified_user">Verified Profile</label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setEditingUser(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={actionLoading !== null}>
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
