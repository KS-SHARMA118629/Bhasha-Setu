import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Globe } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [preferredLang, setPreferredLang] = useState('en');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { name, preferred_language: preferredLang }
      }
    });

    if (error) setError(error.message);
    else setSuccess(true);
  };

  if (success) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="glass-panel" style={{ padding: '3rem', maxWidth: '400px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--success)' }}>Success!</h2>
          <p>Registration successful. Please check your email to verify your account before logging in.</p>
          <Link to="/login" className="btn-primary" style={{ display: 'inline-block', marginTop: '1.5rem', width: '100%' }}>Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem' }}>
      <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          Create Account <UserPlus size={28} style={{ verticalAlign: 'middle', color: 'var(--primary)' }} />
        </h2>
        
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--danger)' }}>{error}</div>}
        
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <User size={20} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Full Name" required
              className="input-field" style={{ paddingLeft: '40px' }}
              value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div style={{ position: 'relative' }}>
            <Mail size={20} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
            <input type="email" placeholder="Email Address" required
              className="input-field" style={{ paddingLeft: '40px' }}
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          
          <div style={{ position: 'relative' }}>
            <Lock size={20} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
            <input type="password" placeholder="Password" required minLength="6"
              className="input-field" style={{ paddingLeft: '40px' }}
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div style={{ position: 'relative' }}>
            <Globe size={20} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
            <select className="input-field" style={{ paddingLeft: '40px', appearance: 'none', background: 'rgba(15, 23, 42, 0.5)' }}
              value={preferredLang} onChange={(e) => setPreferredLang(e.target.value)}>
              <option value="en">English</option>
              <option value="hi">Hindi (हिन्दी)</option>
              <option value="ta">Tamil (தமிழ்)</option>
              <option value="te">Telugu (తెలుగు)</option>
              {/* Add more per PRD if needed */}
            </select>
          </div>
          
          <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '1rem' }}>Register</button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
