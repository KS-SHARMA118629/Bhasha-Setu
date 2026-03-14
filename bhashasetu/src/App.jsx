import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { usePresence } from './hooks/usePresence';

// Pages
import Home          from './pages/Home';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Dashboard     from './pages/Dashboard';
import Profile       from './pages/Profile';
import Helpdesk      from './pages/Helpdesk';
import AdminDashboard from './pages/AdminDashboard';
import Settings      from './pages/Settings';
import Community     from './pages/Community';
import Chat          from './pages/Chat';
import Navbar        from './components/Navbar';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('bhashasetu-theme');
    if (savedTheme === 'light') document.body.classList.add('light-mode');

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Keep user presence updated globally
  usePresence(session?.user?.id);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--primary)' }}>
      Loading…
    </div>
  );

  return (
    <>
      <Navbar session={session} />
      <Routes>
        <Route path="/"            element={<Home session={session} />} />
        <Route path="/login"       element={<Login session={session} />} />
        <Route path="/register"    element={<Register session={session} />} />
        <Route path="/dashboard"   element={<Dashboard session={session} />} />
        <Route path="/profile"     element={<Profile session={session} />} />
        <Route path="/helpdesk"    element={<Helpdesk session={session} />} />
        <Route path="/admin"       element={<AdminDashboard session={session} />} />
        <Route path="/settings"    element={<Settings session={session} />} />
        <Route path="/community"   element={<Community session={session} />} />
        <Route path="/community/chat/:conversationId" element={<Chat session={session} />} />
      </Routes>
    </>
  );
}

export default App;
