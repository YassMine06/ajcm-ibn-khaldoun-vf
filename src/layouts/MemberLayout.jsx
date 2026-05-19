import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  User, ClipboardList, History,
  LogOut, ChevronRight, Menu, X
} from 'lucide-react';
import logoAjcm from '../assets/logo_ajcm.svg';
import './MemberLayout.css';

/* ── Helper URL média ── */
const mediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `http://localhost:8000${path}`;
};

export default function MemberLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* Lire l'utilisateur depuis localStorage à chaque render */
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')) || {}; }
    catch { return {}; }
  })();

  const fullName   = user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Membre';
  const initial    = fullName.charAt(0).toUpperCase();
  const avatarUrl  = mediaUrl(user.photo) || mediaUrl(user.avatar);
  const roleLabel  = user.role === 'MEMBER_BUREAU' ? 'Membre du Bureau' : 'Membre Actif';

  /* Fermer sidebar au changement de route (mobile) */
  useEffect(() => {
    setSidebarOpen(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    navigate('/membre/login', { replace: true });
  };

  /* ── Item de navigation ── */
  const NavItem = ({ to, icon, label }) => (
    <NavLink
      to={to}
      onClick={() => setSidebarOpen(false)}
      className={({ isActive }) => `member-nav-item${isActive ? ' active' : ''}`}
    >
      {icon}
      <span>{label}</span>
      <ChevronRight size={15} className="nav-arrow" />
    </NavLink>
  );

  return (
    <div className="member-layout">

      {/* ─── Overlay mobile ─── */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ════════════════ SIDEBAR ════════════════ */}
      <aside className={`member-sidebar${sidebarOpen ? ' open' : ''}`}>

        {/* Logo + marque */}
        <div className="member-sidebar-header">
          <div className="member-sidebar-logo">
            <img src={logoAjcm} alt="Logo AJCM" />
            <div className="member-brand">
              <span className="brand-title">AJCM</span>
              <span className="brand-subtitle">Espace Membre</span>
            </div>
          </div>
          {/* Bouton fermeture mobile */}
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fermer le menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="member-nav">
          <span className="member-nav-label">Mon Compte</span>
          <NavItem to="/membre/profile"      icon={<User size={20} />}          label="Mon Profil" />

          <span className="member-nav-label">Activités</span>
          <NavItem to="/membre/registrations" icon={<ClipboardList size={20} />} label="Mes inscriptions" />
          <NavItem to="/membre/history"       icon={<History size={20} />}       label="Historique" />
        </nav>

        {/* Pied de sidebar : info utilisateur + déconnexion */}
        <div className="member-sidebar-footer">
          <div className="member-user-card">
            <div className="member-user-avatar">
              {avatarUrl
                ? <img src={avatarUrl} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initial
              }
            </div>
            <div className="member-user-info">
              <div className="member-user-name" title={fullName}>{fullName}</div>
              <div className="member-user-role">{roleLabel}</div>
            </div>
          </div>

          <button className="member-btn-logout" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ════════════════ MAIN ════════════════ */}
      <main className="member-main">

        {/* Topbar */}
        <header className="member-topbar">
          <div className="member-topbar-left">
            {/* Bouton hamburger mobile */}
            <button
              className="member-hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu size={22} />
            </button>
            <div>
              <h2>Bienvenue, {user.first_name || 'Membre'} ! 👋</h2>
              <p>Retrouvez ici toutes vos activités et informations.</p>
            </div>
          </div>

          <div className="member-topbar-right">
            {/* Avatar cliquable → profil */}
            <NavLink to="/membre/profile" style={{ textDecoration: 'none' }}>
              <div className="topbar-avatar-btn" title="Mon profil">
                {avatarUrl
                  ? <img src={avatarUrl} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  : <span style={{ fontWeight: 700, fontSize: '1rem' }}>{initial}</span>
                }
              </div>
            </NavLink>
          </div>
        </header>

        {/* Contenu des pages enfants */}
        <div className="member-content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
