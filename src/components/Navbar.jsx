import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, Globe2, User, Home, LayoutDashboard, Menu, X, Settings as SettingsIcon, Users } from 'lucide-react';

const Navbar = ({ session }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <Globe2 size={28} color="var(--primary)" />
          <span className="text-gradient">BhashaSetu</span>
        </Link>
        
        <div className="mobile-menu-btn" onClick={toggleMenu}>
          {isOpen ? <X size={28} color="var(--text-main)" /> : <Menu size={28} color="var(--text-main)" />}
        </div>

        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          <Link to="/" onClick={closeMenu} className="nav-item"><Home size={18}/> Home</Link>
          {session ? (
            <>
              <Link to="/dashboard" onClick={closeMenu} className="nav-item"><LayoutDashboard size={18}/> Dashboard</Link>
              <Link to="/community" onClick={closeMenu} className="nav-item"><Users size={18}/> Community</Link>
              <Link to="/helpdesk" onClick={closeMenu} className="nav-item">Helpdesk</Link>
              <Link to="/profile" onClick={closeMenu} className="nav-item"><User size={18}/> Profile</Link>
              <Link to="/settings" onClick={closeMenu} className="nav-item"><SettingsIcon size={18}/> Settings</Link>
              <button onClick={() => { handleLogout(); closeMenu(); }} className="btn-secondary logout-btn">
                <LogOut size={16}/> Logout
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
