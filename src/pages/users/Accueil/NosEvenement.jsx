import React from 'react';
import { Link } from 'react-router-dom';
import './NosEvenement.css';

import { eventsData } from '../../../assets/eventsData';
import { categoriesData } from '../../../assets/categoriesData';

const evenementsRecents = eventsData.slice(0, 4);

const NosEvenements = () => (
  <section className="evenements-section" id="evenements">
    <div className="evenements-container">
      <div className="section-header center-align">
        <h2 className="section-title">NOS ÉVÉNEMENTS RÉCENTS</h2>
        <div className="section-divider"></div>
      </div>
      <div className="evenements-grid">
        {evenementsRecents.map((evt) => {
          const catInfo = categoriesData.find(c => c.id === evt.categoryId) || categoriesData[categoriesData.length - 1];
          return (
          <Link to={`/evenements/${encodeURIComponent(evt.folder)}`} className="evenement-card" key={evt.folder} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="evenement-img-wrap">
              <img
                src={`/Evenements/${encodeURIComponent(evt.folder)}/${evt.media && evt.media.length > 0 ? evt.media[0] : 'poster.jpg'}`}
                alt={evt.title}
                onError={(e) => { e.target.src = '/logo_ajcm.svg'; }}
              />
              <span className="evt-tag-badge" style={{ background: catInfo.color }}>{catInfo.name}</span>
            </div>
            <div className="evenement-body">
              <h3 className="evenement-title">{evt.title}</h3>
              <p className="evenement-desc">{evt.desc}</p>
              <div className="evenement-link" style={{ marginTop: 'auto' }}>
                EN SAVOIR PLUS →
              </div>
            </div>
          </Link>
        )})}
      </div>
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Link to="/evenements" className="btn-primary-hero" style={{ display: 'inline-block' }}>
          VOIR TOUS LES ÉVÉNEMENTS
        </Link>
      </div>
    </div>
  </section>
);

export default NosEvenements;
