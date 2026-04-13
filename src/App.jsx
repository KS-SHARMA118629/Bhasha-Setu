import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Helpdesk from './pages/Helpdesk';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Community from './pages/Community';
import DownloadApp from './pages/DownloadApp';
import Notifications from './pages/Notifications';
import Learning from './pages/Learning';
import Contact from './pages/Contact';
import AdminComplaints from './pages/AdminComplaints';
import './components/chat/chat.css';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Determine Dark/Light Mode on global mount
    const savedTheme = localStorage.getItem('bhashasetu-theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--primary)' }}>Loading...</div>;
  }

  // Define routes where footer should be hidden
  const hideFooterRoutes = [
    '/',
    '/download',
    '/community',
    '/profile',
    '/login',
    '/register',
    '/helpdesk',
    '/learning',
    '/contact',
    '/admin/complaints',
    '/settings'
  ];

  const showNavbar = location.pathname !== '/';
  // Check if current path starts with any of the hide routes (useful for nested routes like /chat/:id later if needed)
  const showFooter = !hideFooterRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar session={session} />}
      <main style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<DownloadApp />} />
          <Route path="/home" element={<Home session={session} />} />
          <Route path="/login" element={<Login session={session} />} />
          <Route path="/register" element={<Register session={session} />} />

          <Route path="/dashboard" element={<ProtectedRoute session={session}><Dashboard session={session} /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute session={session}><Profile session={session} /></ProtectedRoute>} />
          <Route path="/helpdesk" element={<Helpdesk session={session} />} />
          <Route path="/admin" element={<AdminDashboard session={session} />} />
          <Route path="/admin/complaints" element={<AdminComplaints session={session} />} />
          <Route path="/settings" element={<Settings session={session} />} />
          <Route path="/community" element={<Community session={session} />} />
          <Route path="/notifications" element={<Notifications session={session} />} />
          <Route path="/learning" element={<Learning session={session} />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/download" element={<DownloadApp />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
    </>
  );
}

export default App;
