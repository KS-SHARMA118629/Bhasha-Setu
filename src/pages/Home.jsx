import { Link } from 'react-router-dom';
import { ShieldCheck, MessageSquare, Mic, FileText } from 'lucide-react';

const Home = () => {
  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div style={{ animation: 'fade-in 1s' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
          Bridge the Language Barrier with<br/>
          <span className="text-gradient">BhashaSetu Helpdesk</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem auto' }}>
          Instantly connect with government services and community support in your preferred language.
          Fast, secure, and built for everyone.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '4rem' }}>
          <Link to="/register" className="btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
            Get Started Now
          </Link>
          <Link to="/helpdesk" className="btn-secondary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
            Open Helpdesk
          </Link>
        </div>
      </div>

      <div className="responsive-grid">
        {[
          { icon: <MessageSquare size={32} color="#60a5fa" />, title: 'Instant Translation', desc: 'Real-time text translation across 10+ Indian languages.' },
          { icon: <ShieldCheck size={32} color="#10b981" />, title: 'Verified Profiles', desc: 'Secure and verified interactions for safe citizen helpdesk support.' },
          { icon: <Mic size={32} color="#c084fc" />, title: 'Voice Support', desc: 'Upcoming features include voice-to-text assistance.' },
          { icon: <FileText size={32} color="#f59e0b" />, title: 'Ticket System', desc: 'Raise, manage, and track your help requests easily.' }
        ].map((feature, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '2rem', textAlign: 'left', transition: 'transform 0.3s' }}>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', display: 'inline-block', borderRadius: '12px', marginBottom: '1rem' }}>
              {feature.icon}
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: '600' }}>{feature.title}</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
