import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate('/dashboard');
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          Welcome Back <LogIn size={28} style={{ verticalAlign: 'middle', color: 'var(--primary)' }} />
        </h2>
        
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--danger)' }}>{error}</div>}
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={20} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
            <input type="email" placeholder="Email Address" required
              className="input-field" style={{ paddingLeft: '40px' }}
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          
          <div style={{ position: 'relative' }}>
            <Lock size={20} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
            <input type="password" placeholder="Password" required
              className="input-field" style={{ paddingLeft: '40px' }}
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          
          <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '1rem' }}>Login to BhashaSetu</button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
