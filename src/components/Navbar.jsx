import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, Globe2, User, Home, LayoutDashboard, Menu, X, Settings as SettingsIcon, Users, ShieldCheck, Bell, BookOpen } from 'lucide-react';

const Navbar = ({ session }) => {
  const [isOpen, setIsOpen] = useState(false);
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

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/home" className="navbar-logo" onClick={closeMenu}>
          <Globe2 size={28} color="var(--primary)" />
          <span className="text-gradient">BhashaSetu</span>
        </Link>

        <div className="mobile-menu-btn" onClick={toggleMenu}>
          {isOpen ? <X size={28} color="var(--text-main)" /> : <Menu size={28} color="var(--text-main)" />}
        </div>

        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          <Link to="/home" onClick={closeMenu} className="nav-item"><Home size={18} /> Home</Link>
          {session ? (
            <>
              <Link to="/community" onClick={closeMenu} className="nav-item"><Users size={18} /> Community</Link>
              <Link to="/profile" onClick={closeMenu} className="nav-item"><User size={18} /> Profile</Link>
              <Link to="/settings" onClick={closeMenu} className="nav-item"><SettingsIcon size={18} /> Settings</Link>
              <Link to="/learning" onClick={closeMenu} className="nav-item"><BookOpen size={18} /> Learning</Link>
              {isAdmin && (
                <Link to="/admin" onClick={closeMenu} className="nav-item"><ShieldCheck size={18} /> Admin</Link>
              )}
              
              <Link to="/notifications" onClick={closeMenu} className="nav-item" style={{ position: 'relative' }}>
                <Bell size={18} /> Notifications
                <span className="notification-badge">3</span>
              </Link>

              <button onClick={() => { handleLogout(); closeMenu(); }} className="btn-secondary logout-btn">
                <LogOut size={16} /> Logout
              </button>

            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" onClick={closeMenu} className="btn-secondary">Login</Link>
              <Link to="/register" onClick={closeMenu} className="btn-primary">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
