import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Partenaires.css';

const MEDIA_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/').replace(/\/api.*$/, '');

/** Convertit un chemin relatif en URL absolue */
const toAbsUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${MEDIA_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
};

const Partenaires = () => {
  const [partners, setPartners] = useState([]);
  const [loaded, setLoaded]     = useState(false);

  useEffect(() => {
    axios.get('http://localhost:8000/api/partners/')
      .then(res => {
        const data = res.data.results ?? res.data;
        const active = Array.isArray(data) ? data.filter(p => p.is_active !== false) : [];
        setPartners(active);
      })
      .catch(err => console.error('Erreur partenaires:', err))
      .finally(() => setLoaded(true));
  }, []);

  // Ne masque la section QUE si le chargement est terminé ET la liste est vraiment vide
  if (loaded && partners.length === 0) return null;

  // Duplication pour animation Marquee infinie
  const repeated = partners.length > 0
    ? [...partners, ...partners, ...partners].slice(0, Math.max(partners.length * 2, 8))
    : [];

  return (
    <section className="partenaires-section" id="partenaires">
      <div className="partenaires-container">
        <div className="section-header center-align">
          <h2>Nos Partenaires</h2>
          <div className="section-divider"></div>
        </div>
      </div>

      {/* Carrousel pleine largeur */}
      <div className="marquee-wrapper">
        <div className="marquee-content">
          {repeated.map((partner, index) => (
            <a
              key={`${partner.id}-${index}`}
              href={partner.website || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="partner-card"
              title={partner.name}
            >
              {partner.logo ? (
                <img
                  src={toAbsUrl(partner.logo)}
                  alt={partner.name}
                  className="partner-logo-img"
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2e513a', padding: '0.5rem', textAlign: 'center' }}>
                  {partner.name}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partenaires;
