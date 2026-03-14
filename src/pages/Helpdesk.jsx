import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, ListFilter, Send, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const Helpdesk = ({ session }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newTicket, setNewTicket] = useState({ title: '', description: '', category: 'General' });

  useEffect(() => {
    if (session) fetchTickets();
  }, [session]);

  const fetchTickets = async () => {
    const { data } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
    if (data) setTickets(data);
    setLoading(false);
  };

  const createTicket = async (e) => {
    e.preventDefault();
    const { data: profile } = await supabase.from('profiles').select('preferred_language').eq('id', session.user.id).single();

    const { error } = await supabase.from('tickets').insert([
      { 
        user_id: session.user.id, 
        title: newTicket.title, 
        description: newTicket.description, 
        category: newTicket.category,
        language_code: profile?.preferred_language || 'en'
      }
    ]);
    if (!error) {
      setShowNew(false);
      setNewTicket({ title: '', description: '', category: 'General' });
      fetchTickets();
    }
  };

  if (!session) return <div style={{ padding: '2rem', textAlign: 'center' }}>Please login to access the helpdesk.</div>;

  return (
    <div className="container" style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Your Help Requests</h1>
        <button onClick={() => setShowNew(!showNew)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> New Request
        </button>
      </div>

      {showNew && (
        <form onSubmit={createTicket} className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Submit New Request</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="text" placeholder="Title" required className="input-field" 
               value={newTicket.title} onChange={e => setNewTicket({...newTicket, title: e.target.value})} />
            <select className="input-field" value={newTicket.category} onChange={e => setNewTicket({...newTicket, category: e.target.value})}>
              <option value="General">General Support</option>
              <option value="Government Services">Government Services</option>
              <option value="Document Translation">Document Translation</option>
              <option value="Emergency">Emergency Assist</option>
            </select>
            <textarea placeholder="Describe your issue..." required className="input-field" rows="4"
              value={newTicket.description} onChange={e => setNewTicket({...newTicket, description: e.target.value})}></textarea>
            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={18} /> Submit Ticket
            </button>
          </div>
        </form>
      )}

      {loading ? <p>Loading tickets...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tickets.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No tickets found. Submit a request to get help.</p> : null}
          {tickets.map(ticket => (
            <div key={ticket.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{ticket.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{ticket.description}</p>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14}/> {format(new Date(ticket.created_at), 'PPP')}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'capitalize' }}>
                    <ListFilter size={14}/> {ticket.category}
                  </span>
                </div>
              </div>
              <div>
                <span style={{ 
                  padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase',
                  background: ticket.status === 'open' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: ticket.status === 'open' ? 'var(--warning)' : 'var(--success)'
                }}>
                  {ticket.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Helpdesk;
