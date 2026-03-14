import { useState } from 'react';
import { supabase } from '../lib/supabase';
import AssistantChatbot from '../components/AssistantChatbot';
import GovtSchemes from '../components/GovtSchemes';
import VoiceComplaint from '../components/VoiceComplaint';
import { Send, User, Bot, Ticket, Loader2, Sparkles, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = ({ session }) => {
  const [profile, setProfile] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // When session mounts, immediately fetch Data
  useState(() => {
    if (session) {
      const fetchData = async () => {
         const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
         if(profileData) setProfile(profileData);
         const { data: ticketData } = await supabase.from('tickets').select('*').eq('user_id', session.user.id).limit(5).order('created_at', { ascending: false });
         if(ticketData) setTickets(ticketData);
         setLoading(false);
      }
      fetchData();
    }
  }, [session]);

  if (!session) return <p style={{ textAlign: 'center' }}>Please Login</p>;
  if (loading) return <p style={{ textAlign: 'center' }}>Loading...</p>;

  // Simulate updating tickets remotely immediately after Voice Complaint registers.
  const handleVoiceSubmit = async (ticketData) => {
      await supabase.from('tickets').insert([{ user_id: session.user.id, ...ticketData }]);
      const { data } = await supabase.from('tickets').select('*').eq('user_id', session.user.id).limit(5).order('created_at', { ascending: false });
      setTickets(data);
  };

  return (
    <div className="container">
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
        Welcome back, {profile?.name} <span style={{ fontSize: '1rem', padding: '4px 12px', background: 'var(--bg-color-alt)', borderRadius: '20px' }}>{profile?.preferred_language?.toUpperCase()} Enabled</span>
      </h1>
      
      {profile?.is_banned && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', gap: '8px', color: 'var(--danger)' }}>
          <AlertTriangle size={24} />
          Your account is currently suspended. Please contact support.
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="responsive-grid" style={{ marginBottom: '2rem' }}>

         {/* 1. Voice Complaint + AI Translation */}
         <VoiceComplaint onSubmit={handleVoiceSubmit} language={profile?.preferred_language} />

         {/* 2. Multilingual Assistant Chatbot */}
         <AssistantChatbot language={profile?.preferred_language} />
         
      </div>

      <div className="responsive-grid" style={{ marginBottom: '3rem' }}>
         {/* 3. Govt Schemes Search Engine (AI Explained) */}
         <GovtSchemes language={profile?.preferred_language} />
         
         <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <Ticket size={24} color="var(--primary)" />
            <h3 style={{ fontSize: '1.25rem' }}>Auto-Translated Tickets</h3>
          </div>
          {tickets.length > 0 ? (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {tickets.map(t => (
                <li key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <strong style={{ fontSize: '1.1rem' }}>{t.title}</strong>
                     <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '12px', background: t.status === 'open' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: t.status === 'open' ? 'var(--warning)' : 'var(--success)', textTransform: 'uppercase' }}>{t.status}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t.description}</div>
                  
                  {/* View for Auto Ticket Translations */}
                  <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--primary)' }}>
                    <Sparkles size={14} /> Official Translate View:
                    <span style={{ color: 'var(--text-main)' }}>{t.translated_description || 'Translation in progress...'}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p style={{ color: 'var(--text-muted)' }}>No requests found. Use voice or chat to submit one.</p>}
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <Link to="/helpdesk" className="btn-secondary" style={{ flex: 1, textAlign: 'center' }}>View All Request</Link>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
