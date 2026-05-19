import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Spinner from '../../components/common/Spinner';
import './EvenementsPage.css';

import { eventsData as staticEvents } from '../../assets/eventsData';
import { categoriesData } from '../../assets/categoriesData';

/* ── Constantes ── */
const MEDIA_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/').replace(/\/api.*$/, '');

const TYPE_COLORS = {
  CULTURE: '#7c3aed', JEUNESSE: '#2e513a', FORMATION: '#0891b2',
  EVENEMENT: '#C9A227', ART: '#be185d', SPORT: '#dc2626',
  SOLIDARITE: '#d97706', SANTE: '#059669', CITOYENNETE: '#1d4ed8', AUTRE: '#64748b',
};
const TYPE_LABELS = {
  CULTURE: 'Culture', JEUNESSE: 'Jeunesse', FORMATION: 'Formation',
  EVENEMENT: 'Événement', ART: 'Art', SPORT: 'Sport',
  SOLIDARITE: 'Solidarité', SANTE: 'Santé', CITOYENNETE: 'Citoyenneté', AUTRE: 'Autre',
};

const allCategories = [{ id: 'tous', name: 'Tous' }, ...categoriesData];

/** Construit l'URL complète d'une image (poster API ou galerie) */
const getEventImage = (ev) => {
  if (ev.poster_url)             return ev.poster_url.startsWith('http') ? ev.poster_url : `${MEDIA_BASE}${ev.poster_url}`;
  if (ev.poster)                 return ev.poster.startsWith('http')     ? ev.poster     : `${MEDIA_BASE}${ev.poster}`;
  const img = ev.images?.[0]?.image;
  if (img)                       return img.startsWith('http')           ? img           : `${MEDIA_BASE}${img}`;
  return null;
};

export default function EvenementsPage() {
  const [apiEvents, setApiEvents]   = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [activeFilter, setActiveFilter] = useState('tous');

  /* Charge les événements depuis l'API */
  useEffect(() => {
    window.scrollTo(0, 0);
    axios.get('http://localhost:8000/api/events/')
      .then(res => {
        const data = res.data.results || res.data;
        const published = Array.isArray(data)
          ? data.filter(e => e.status === 'PUBLISHED' || e.status === 'COMPLET')
          : [];
        setApiEvents(published);
      })
      .catch(err => console.error('Erreur événements API:', err))
      .finally(() => setIsLoading(false));
  }, []);

  /* Filtre les événements statiques par catégorie */
  const filteredStatic = activeFilter === 'tous'
    ? staticEvents
    : staticEvents.filter(e => e.categoryId === activeFilter);

  return (
    <div className="evenements-page page-enter">
      <Navbar />

      {/* ── Hero ── */}
      <header className="desc-hero">
        <div className="desc-hero-bg"><div className="desc-hero-overlay"></div></div>
        <div className="evts-container desc-hero-content">
          <div className="badge-identity">Agenda AJCM</div>
          <h1 className="animate-title">Nos Événements</h1>
          <p className="desc-subtitle animate-subtitle">
            Découvrez {apiEvents.length > 0 ? `${apiEvents.length} événement(s) à venir et ` : ''}
            {staticEvents.length} événements organisés par l'A.J.C.M.
          </p>
        </div>
      </header>

      {/* ════════════════════════════════════════ */}
      {/* SECTION 1 — Événements depuis l'admin   */}
      {/* ════════════════════════════════════════ */}
      {(isLoading || apiEvents.length > 0) && (
        <section style={{ background: '#fff', padding: '4rem 0', borderBottom: '1px solid #e8f0eb' }}>
          <div className="evts-container">
            <div className="section-header center-align" style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'center' }}>
                <span style={{ background: '#dcfce7', color: '#2e513a', padding: '2px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em' }}>NOUVEAUX</span>
                Événements à venir
              </h2>
              <div className="section-divider"></div>
            </div>

            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}><Spinner size={40} /></div>
            ) : (
              <div className="evts-grid">
                {apiEvents.map(ev => {
                  const imgSrc = getEventImage(ev);
                  const typeColor = TYPE_COLORS[ev.type] || '#2e513a';
                  const typeLabel = TYPE_LABELS[ev.type] || ev.type;
                  return (
                    <div className="evt-card" key={ev.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="evt-card-img-wrap">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={ev.Event_Name}
                            onError={e => { e.target.src = '/logo_ajcm.svg'; e.target.style.objectFit = 'contain'; }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${typeColor}22, ${typeColor}44)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                            🗓️
                          </div>
                        )}
                        <span className="evt-cat-badge" style={{ background: typeColor }}>{typeLabel}</span>
                        {ev.status === 'COMPLET' && (
                          <span style={{ position: 'absolute', bottom: 12, right: 12, background: '#dc2626', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px' }}>COMPLET</span>
                        )}
                      </div>
                      <div className="evt-card-body">
                        <h3>{ev.Event_Name}</h3>
                        {ev.start_date && (
                          <p style={{ fontSize: '0.78rem', color: '#C9A227', fontWeight: 600 }}>
                            📅 {new Date(ev.start_date).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                          </p>
                        )}
                        {ev.location && <p style={{ fontSize: '0.78rem', color: '#64748b' }}>📍 {ev.location}</p>}
                        {ev.description && <p style={{ fontSize: '0.83rem', color: '#555', lineHeight: 1.5 }}>{ev.description.substring(0, 100)}{ev.description.length > 100 ? '...' : ''}</p>}
                        {ev.max_places > 0 && (
                          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 'auto' }}>
                            👥 {ev.places_remaining ?? ev.max_places} place(s) disponible(s)
                          </p>
                        )}
                        {ev.Cost > 0 && (
                          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2e513a' }}>💰 {ev.Cost} MAD</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════ */}
      {/* SECTION 2 — Événements historiques       */}
      {/* ════════════════════════════════════════ */}
      <div className="evts-filters-bar">
        <div className="evts-container">
          <div className="evts-filters">
            {allCategories.map(cat => (
              <button
                key={cat.id}
                className={`filter-btn ${activeFilter === cat.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="evts-main">
        <div className="evts-container">
          <div className="section-header center-align" style={{ marginBottom: '3rem' }}>
            <h2>Événements passés</h2>
            <div className="section-divider"></div>
          </div>
          <div className="evts-grid">
            {filteredStatic.map(evt => {
              const catInfo = categoriesData.find(c => c.id === evt.categoryId) || categoriesData[categoriesData.length - 1];
              return (
                <Link
                  to={`/evenements/${encodeURIComponent(evt.folder)}`}
                  className="evt-card"
                  key={evt.folder}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="evt-card-img-wrap">
                    <img
                      src={`/Evenements/${encodeURIComponent(evt.folder)}/${evt.media && evt.media.length > 0 ? evt.media[0] : 'poster.jpg'}`}
                      alt={evt.title}
                      onError={e => { e.target.src = '/logo_ajcm.svg'; }}
                    />
                    <span className="evt-cat-badge" style={{ background: catInfo.color }}>{catInfo.name}</span>
                  </div>
                  <div className="evt-card-body">
                    <h3>{evt.title}</h3>
                    <p>{evt.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
