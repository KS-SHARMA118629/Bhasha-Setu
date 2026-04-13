import { Facebook, Instagram, Youtube, MessageCircle, ChevronRight, MapPin, Mail, Phone, Clock, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand Section */}
        <div className="footer-brand">
          <div className="footer-logo">
            <img src="bs.png" alt="BhashaSetu Logo" onError={(e) => e.target.src = "https://via.placeholder.com/80?text=BS"} />
          </div>
          <div className="brand-desc">
            <p>Bhasha Setu language translator different languages ko easily translate karta hai aur logon ko connect karta hai | Bhasha Setu translates languages easily and helps people connect.</p>
            <p style={{ marginTop: '0.5rem' }}>(भाषा सेतु भाषा अनुवादक विभिन्न भाषाओं को आसानी से अनुवाद करता है और लोगों को जोड़ता है।)</p>
          </div>
          <div className="footer-socials">
            <a href="#" className="social-icon"><Facebook size={20} /></a>
            <a href="#" className="social-icon"><Instagram size={20} /></a>
            <a href="#" className="social-icon"><MessageCircle size={20} /></a>
            <a href="#" className="social-icon"><Youtube size={20} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <nav className="footer-links">
            <Link to="/home" className="footer-link"><ChevronRight size={16} /> Home</Link>
            <Link to="/helpdesk" className="footer-link"><ChevronRight size={16} /> About Us</Link>
            <Link to="/learning" className="footer-link"><ChevronRight size={16} /> Programs</Link>
            <Link to="/community" className="footer-link"><ChevronRight size={16} /> Blog</Link>
          </nav>
        </div>

        {/* Our Programs */}
        <div className="footer-section">
          <h3>Our Programs</h3>
          <nav className="footer-links">
            <div className="footer-link"><ChevronRight size={16} /> Hindi Learning</div>
            <div className="footer-link"><ChevronRight size={16} /> Cultural Activities</div>
            <div className="footer-link"><ChevronRight size={16} /> Parenting Workshops</div>
            <div className="footer-link"><ChevronRight size={16} /> Online Courses</div>
          </nav>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h3>Contact Info</h3>
          <div className="contact-info">
            <div className="contact-item">
              <MapPin size={20} />
              <span>you need a leave</span>
            </div>
            <div className="contact-item">
              <Mail size={20} />
              <span>kartiksharma20081186@gmail.com</span>
            </div>
            <div className="contact-item">
              <Phone size={20} />
              <span>+91 8219602196</span>
            </div>
            <div className="contact-item">
              <Clock size={20} />
              <span>Mon - Sat: 9AM - 6PM</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>© 2025 Bhasha Setu. All Rights Reserved.</p>
          <div className="bottom-links">
            <Link to="/terms">Terms & Conditions</Link>
            <span style={{ color: 'white' }}>|</span>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
          <div className="designer-info">
            <span>Designed with ❤️ by</span>
            <div className="webookweb-tag">
              <span className="webook-text">KS</span>
              <span className="web-text">MODS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Buttons */}
      <div className="floating-buttons">
        <button className="float-btn bg-up" onClick={scrollToTop}>
          <ArrowUp size={24} />
        </button>
        <a href="https://wa.me/918219602196" target="_blank" rel="noopener noreferrer" className="float-btn bg-whatsapp">
          <MessageCircle size={24} />
        </a>
        <a href="tel:+918219602196" className="float-btn bg-phone">
          <Phone size={24} />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
