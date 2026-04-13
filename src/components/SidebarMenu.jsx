import { Home, Info, Book, Layout, Phone, X, BookOpen, User, LogIn, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import './SidebarMenu.css';

const SidebarMenu = ({ isOpen, onClose, session }) => {
  const location = useLocation();

  const allMenuItems = [
    { title: 'Home', path: '/home', icon: <Home size={22} />, requiresAuth: false, hideWhenAuth: false },
    { title: 'Profile', path: '/profile', icon: <User size={22} />, requiresAuth: true, hideWhenAuth: false },
    { title: 'Helpdesk', path: '/helpdesk', icon: <Info size={22} />, requiresAuth: true, hideWhenAuth: false },
    { title: 'Learning', path: '/learning', icon: <BookOpen size={22} />, requiresAuth: true, hideWhenAuth: false },
    { title: 'Notifications', path: '/notifications', icon: <Bell size={22} />, requiresAuth: true, hideWhenAuth: false },
    { title: 'Community', path: '/community', icon: <Layout size={22} />, requiresAuth: true, hideWhenAuth: false },
    { title: 'Contact', path: '/contact', icon: <Phone size={22} />, requiresAuth: false, hideWhenAuth: false },
    { title: 'Login', path: '/login', icon: <LogIn size={22} />, requiresAuth: false, hideWhenAuth: true },
    { title: 'Settings', path: '/settings', icon: <LogIn size={22} />, requiresAuth: true, hideWhenAuth: false },
  ];

  const menuItems = allMenuItems.filter((item) => {
    if (item.requiresAuth && !session) return false;
    if (item.hideWhenAuth && session) return false;
    return true;
  });

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
      <div className={`sidebar-menu ${isOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">
            <Book size={28} />
            <span>Menu</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-links">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={onClose}
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

export default SidebarMenu;
