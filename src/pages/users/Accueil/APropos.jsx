import React from 'react';
import { Link } from 'react-router-dom';
import './APropos.css';

const MissionIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/>
    <path d="M9 12l-4 4 4 4"/><path d="M15 12l4 4-4 4"/>
  </svg>
);
const VisionIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
  </svg>
);
const ValeursIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const pillars = [
  {
    Icon: MissionIcon,
    title: 'NOTRE MISSION',
    text: 'Soutenir les activités au profit des enfants, jeunes, femmes et chercheurs, sans affiliation politique.',
    color: '#4a7c59', bg: '#edf4ef',
  },
  {
    Icon: VisionIcon,
    title: 'NOTRE VISION',
    text: 'Quatre piliers stratégiques : Éducation, Action Sociale, Formation et Animation Culturelle.',
    color: '#C9A227', bg: '#fdf7e6',
  },
  {
    Icon: ValeursIcon,
    title: 'NOS VALEURS',
    text: 'Citoyenneté active, Indépendance, Solidarité inclusive, Excellence et Rayonnement.',
    color: '#b03a2e', bg: '#fbeeed',
  },
];

const APropos = () => (
  <section className="apropos-section" id="apropos">
    <div className="apropos-container">

      <div className="apropos-left">
        <div className="section-header left-align">
          <h2 className="section-title">À PROPOS DE NOUS</h2>
          <div className="section-divider"></div>
        </div>
        <p className="apropos-desc">
          Fondée en 1976 à Casablanca, l'A.J.C.M est une organisation éducative, culturelle et de recherche,
          bénévole et indépendante, œuvrant au profit de la jeunesse et de la citoyenneté.
        </p>
        <p className="apropos-desc">
          Devenue association nationale en 2019, elle déploie son action autour de quatre piliers :
          Éducation, Action Sociale, Formation et Rayonnement Culturel.
        </p>
        <Link to="/description" className="btn-savoir-plus">EN SAVOIR PLUS</Link>
      </div>

      <div className="apropos-image">
        <img src="/apropos.png" alt="À propos AJCM" />
      </div>

      <div className="apropos-pillars">
        {pillars.map((p) => (
          <div className="pillar-card" key={p.title}>
            <div className="pillar-icon" style={{ background: p.bg, color: p.color }}>
              <p.Icon />
            </div>
            <div className="pillar-content">
              <h4>{p.title}</h4>
              <p>{p.text}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  </section>
);

export default APropos;
