import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Pages that start with a dark hero background at the top
  const isDarkHeroPage = location.pathname === '/' || location.pathname === '/evenements' || location.pathname === '/evenements/' || location.pathname === '/description' || location.pathname === '/annonces' || location.pathname === '/annonces/' || location.pathname === '/calendrier' || location.pathname === '/calendrier/' || location.pathname === '/contact' || location.pathname === '/contact/';

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setScrolled(scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // check immediately on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Description',  href: '/description' },
    { name: 'Annonces',     href: '/annonces' },
    { name: 'Événements',   href: '/evenements' },
    { name: 'Calendrier',   href: '/calendrier' },
    { name: 'Contact',      href: '/contact' },
  ];

  // Force 'scrolled' styling (dark text, white background) if we are not on a dark hero page
  const isScrolledStyle = scrolled || !isDarkHeroPage;

  return (
    <nav className={`navbar ${isScrolledStyle ? 'scrolled' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="nav-container">

        {/* ── Logo ── */}
        <Link to="/" className="nav-logo">
          <img src="/logo_ajcm.svg" alt="Logo AJCM" className="nav-logo-img" />
          <div className="nav-logo-text">
            <span className="nav-logo-title">A.J.C.M</span>
            <span className="nav-logo-sub">
              ASSOCIATION JEUNESSE <br />DE LA CITOYENNETÉ MAROCAINE<br />MOHAMMEDIA IBN KHALDOUN
            </span>
          </div>
        </Link>

        {/* ── Links ── */}
        <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <ul className="nav-links">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href || (link.href !== '/' && location.pathname.startsWith(link.href));
              return (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className={isActive ? 'active' : ''}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="nav-actions">
            <Link to="/inscription" className="btn-enroll">S'inscrire</Link>
          </div>
        </div>

        {/* ── Mobile burger ── */}
        <button
          className="nav-toggle"
          aria-label="Toggle menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
