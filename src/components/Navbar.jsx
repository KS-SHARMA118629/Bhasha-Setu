import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, Globe2, User, Home, LayoutDashboard, Menu, X, Settings as SettingsIcon, Users, ShieldCheck, Bell, BookOpen } from 'lucide-react';
import SidebarMenu from './SidebarMenu';

const Navbar = ({ session }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (session) {
      checkAdmin();
    } else {
      setIsAdmin(false);
    }
  }, [session]);

  const checkAdmin = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role, is_admin')
        .eq('id', session.user.id)
        .single();

      if (data?.role === 'admin' || data?.is_admin === true) {
        setIsAdmin(true);
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <nav className="navbar">
      <SidebarMenu isOpen={isSidebarOpen} onClose={closeSidebar} session={session} />
      
      <div className="navbar-container">
        <Link to="/home" className="navbar-logo">
          <Globe2 size={28} color="var(--primary)" />
          <span className="text-gradient">BhashaSetu</span>
        </Link>

        {/* Desktop Links */}
        <div className="nav-links desktop-only">
          <Link to="/home" className="nav-item"><Home size={18} /> Home</Link>
          {session ? (
            <>
              <Link to="/community" className="nav-item"><Users size={18} /> Community</Link>
              <Link to="/profile" className="nav-item"><User size={18} /> Profile</Link>
              <Link to="/settings" className="nav-item"><SettingsIcon size={18} /> Settings</Link>
              {isAdmin && (
                <Link to="/admin" className="nav-item"><ShieldCheck size={18} /> Admin</Link>
              )}
              <Link to="/notifications" className="nav-item" style={{ position: 'relative' }}>
                <Bell size={18} />
                <span className="notification-badge">3</span>
              </Link>
              <button onClick={handleLogout} className="btn-secondary logout-btn">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button - Triggers Sidebar */}
        <div className="mobile-menu-btn" onClick={toggleSidebar}>
          <Menu size={28} color="var(--text-main)" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
