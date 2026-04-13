import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, ShieldCheck, Mail, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminComplaints = ({ session }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (session) {
      checkAdminStatus();
    }
  }, [session]);

  const checkAdminStatus = async () => {
    try {
      const { data } = await supabase.from('profiles').select('is_admin, role').eq('id', session.user.id).single();
      if (data?.is_admin || data?.role === 'admin') {
        setIsAdmin(true);
        fetchComplaints();
      }
    } catch (err) {
      console.error('Admin check failed:', err);
    }
  };

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error && error.code !== '42P01') throw error;
      if (data) setComplaints(data);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsResolved = async (id) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ status: 'resolved' })
        .eq('id', id);
        
      if (error) throw error;
      await fetchComplaints(); // Refresh list
    } catch (err) {
      alert('Error updating complaint status');
    }
  };

  if (!session) return <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}><h2>Please Log In</h2></div>;
  if (!isAdmin && !loading) return <div className="container" style={{ textAlign: 'center', marginTop: '5rem', color: 'var(--danger)' }}><h2>403: Admin Only Access</h2></div>;

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MessageSquare size={36} color="var(--primary)" /> User Complaints
        </h1>
        <Link to="/admin" className="btn-secondary">Back to Dashboard</Link>
      </div>

      {loading ? (
        <p>Loading complaints...</p>
      ) : complaints.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <CheckCircle size={48} color="var(--success)" style={{ marginBottom: '1rem' }} />
          <h3>All caught up!</h3>
          <p style={{ color: 'var(--text-muted)' }}>There are no user complaints at the moment.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {complaints.map(complaint => (
            <div key={complaint.id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: complaint.status === 'resolved' ? '4px solid var(--success)' : '4px solid var(--warning)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {complaint.name}
                  {complaint.status === 'resolved' ? (
                    <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14}/> Resolved</span>
                  ) : (
                    <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> Pending</span>
                  )}
                </h3>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {new Date(complaint.created_at).toLocaleString()}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                <Mail size={16} /> <a href={`mailto:${complaint.email}`}>{complaint.email}</a>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', color: 'var(--text-main)', marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>
                {complaint.message}
              </div>

              {complaint.status !== 'resolved' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => markAsResolved(complaint.id)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={16} /> Mark as Resolved
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
