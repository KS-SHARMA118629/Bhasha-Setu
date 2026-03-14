import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, ShieldCheck, Ban, CheckCircle, RotateCcw } from 'lucide-react';

const AdminDashboard = ({ session }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    if (session) checkAdmin();
  }, [session]);

  const checkAdmin = async () => {
    const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    if (data?.role === 'admin') {
      setIsAdmin(true);
      fetchUsers();
    }
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  };

  const toggleBan = async (id, currentStatus) => {
    await supabase.from('profiles').update({ is_banned: !currentStatus }).eq('id', id);
    fetchUsers();
  };

  const verifyUser = async (id) => {
    await supabase.from('profiles').update({ verification_status: 'verified' }).eq('id', id);
    fetchUsers();
  };

  if (!session) return <p style={{ textAlign: 'center' }}>Please Login</p>;
  if (!isAdmin && !loading) return <p style={{ textAlign: 'center', color: 'var(--danger)', marginTop: '2rem' }}>Error 403: Admin access required.</p>;

  return (
    <div className="container">
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShieldCheck size={32} color="var(--primary)" /> Admin Control Panel
      </h1>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'btn-primary' : 'btn-secondary'} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} /> Manage Users
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Role</th>
                <th style={{ padding: '1rem' }}>Verification</th>
                <th style={{ padding: '1rem' }}>Suspended</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>{u.name}</td>
                  <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{u.role}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ color: u.verification_status === 'verified' ? 'var(--success)' : u.verification_status === 'pending' ? 'var(--warning)' : 'var(--text-muted)' }}>
                      {u.verification_status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: u.is_banned ? 'var(--danger)' : 'var(--success)' }}>
                    {u.is_banned ? 'Yes' : 'No'}
                  </td>
                  <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                    {u.verification_status === 'pending' && (
                      <button onClick={() => verifyUser(u.id)} className="btn-secondary" style={{ padding: '0.4rem', borderColor: 'var(--success)', color: 'var(--success)' }} title="Verify User">
                        <CheckCircle size={16} />
                      </button>
                    )}
                    <button onClick={() => toggleBan(u.id, u.is_banned)} className="btn-secondary" style={{ padding: '0.4rem', borderColor: u.is_banned ? 'var(--success)' : 'var(--danger)', color: u.is_banned ? 'var(--success)' : 'var(--danger)' }} title={u.is_banned ? 'Unban User' : 'Ban User'}>
                      {u.is_banned ? <RotateCcw size={16} /> : <Ban size={16} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
