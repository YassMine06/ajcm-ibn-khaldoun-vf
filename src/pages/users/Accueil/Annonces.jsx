import React from 'react';
import { Link } from 'react-router-dom';
import './Annonces.css';
import { annoncesData } from '../../../assets/annoncesData';

const Annonces = () => {
  // Prends les 5 dernières annonces pour la galerie déroulante
  const recentAnnonces = annoncesData.slice(0, 5);
  // On quadruple la liste pour que le carrousel infini remplisse bien l'écran, même sur de très grands écrans
  const infiniteAnnonces = [...recentAnnonces, ...recentAnnonces, ...recentAnnonces, ...recentAnnonces];

  return (
    <section className="evt-section" id="annonces">
      <div className="evt-container-full">
        <div className="section-header center-align">
          <h2 className="section-title">NOS DERNIÈRES ANNONCES</h2>
          <div className="section-divider"></div>
        </div>
        
        <div className="annonces-scroller-container">
          <div className="annonces-scroller-track">
            {/* Boucle sur les annonces multipliées pour l'effet infini */}
            {infiniteAnnonces.map((annonce, index) => (
              <Link to="/annonces" className="scroller-item" key={`${annonce.id}-${index}`}>
                <div className="scroller-img-wrap">
                  <img src={`/${annonce.image}`} alt={`Annonce ${annonce.id}`} loading="lazy" />
                  <div className="scroller-overlay">
                    <span className="scroller-view-text">VOIR</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <Link to="/annonces" className="btn-agenda">VOIR TOUTES LES ANNONCES →</Link>
        </div>
      </div>
    </section>
  );
};

export default Annonces;
