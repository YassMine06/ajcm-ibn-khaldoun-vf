import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './AnnoncesPage.css';
import { Calendar, MapPin, Search } from 'lucide-react';
import Spinner from '../../components/common/Spinner';

const MEDIA_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/').replace(/\/api.*$/, '');
const imgUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${MEDIA_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
};

const TYPE_LABELS = {
  NEWS: 'Actualité', ALERT: 'Alerte', PROMO: 'Promotion', INFO: 'Information', EVENT: 'Événement'
};

const AnnoncesPage = () => {
  const [annonces, setAnnonces] = useState([]);
  const [selectedAnnonce, setSelectedAnnonce] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchAnnonces = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/announcements/');
        // Gérer la pagination Django REST Framework (res.data.results)
        const annoncesData = res.data.results ? res.data.results : res.data;
        setAnnonces(Array.isArray(annoncesData) ? annoncesData : []);
      } catch (err) {
        console.error("Erreur lors de la récupération des annonces:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnnonces();
  }, []);

  // Empêcher le scroll quand la modale est ouverte
  useEffect(() => {
    if (selectedAnnonce) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedAnnonce]);

  const closeModal = () => {
    setSelectedAnnonce(null);
  };

  const filteredAnnonces = annonces.filter(a =>
    a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="annonces-page page-enter">
      <Navbar />

      <header className="desc-hero">
        <div className="desc-hero-bg">
          <div className="desc-hero-overlay"></div>
        </div>
        <div className="evts-container desc-hero-content">
          <div className="badge-identity">Découvrez</div>
          <h1 className="animate-title">Nos Annonces</h1>
          <p className="desc-subtitle animate-subtitle">
            Retrouvez tous nos communiqués, affiches et déclarations officielles.
          </p>
        </div>
      </header>

      <main className="annonces-main">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div className="section-header" style={{ margin: 0 }}>
              <h2 style={{ fontSize: '2rem' }}>Toutes les annonces</h2>
              <div className="section-divider" style={{ margin: '0.5rem 0 0 0' }}></div>
            </div>
            
            <div className="annonce-search-bar">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Rechercher une annonce..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '5rem' }}>
              <Spinner size={40} />
            </div>
          ) : filteredAnnonces.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#666', fontSize: '1.1rem' }}>
              Aucune annonce trouvée.
            </div>
          ) : (
            <div className="annonces-masonry-grid">
              {filteredAnnonces.map((annonce) => (
                <div 
                  key={annonce.id} 
                  className="annonce-grid-item"
                  onClick={() => setSelectedAnnonce(annonce)}
                >
                  <div className="annonce-img-wrap">
                    <img src={imgUrl(annonce.image)} alt={`Annonce ${annonce.id}`} loading="lazy" onError={e => e.target.style.display='none'} />
                    {annonce.type && (
                      <div className={`annonce-type-badge ${annonce.type.toLowerCase()}`}>
                        {TYPE_LABELS[annonce.type] || annonce.type}
                      </div>
                    )}
                    <div className="annonce-hover-overlay">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        <line x1="11" y1="8" x2="11" y2="14"></line>
                        <line x1="8" y1="11" x2="14" y2="11"></line>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="annonce-card-body">
                    <h3 className="annonce-card-title">{annonce.title || 'Sans titre'}</h3>
                    
                    <div className="annonce-card-meta">
                      <div className="meta-item">
                        <Calendar size={14} className="meta-icon date-icon" />
                        <span>
                          {annonce.start_date
                            ? new Date(annonce.start_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                            : (annonce.date || '--/--/----')}
                        </span>
                      </div>
                      {annonce.location && (
                        <>
                          <span className="meta-divider">|</span>
                          <div className="meta-item">
                            <MapPin size={14} className="meta-icon loc-icon" />
                            <span>{annonce.location}</span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {annonce.content && !annonce.title && (
                      <p className="annonce-card-desc">{annonce.content.substring(0, 80)}...</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal / Lightbox */}
      {selectedAnnonce && (
        <div className="annonce-modal-overlay" onClick={closeModal}>
          <div className="annonce-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className={`modal-body has-text`}>
              <div className="modal-img-container">
                <img src={imgUrl(selectedAnnonce.image)} alt={`Annonce ${selectedAnnonce.id}`} onError={e => e.target.style.display='none'} />
              </div>
              
              <div className="modal-text-container">
                <div className="modal-text-scroll">
                  {selectedAnnonce.type && (
                    <span className={`modal-badge ${selectedAnnonce.type.toLowerCase()}`}>
                      {TYPE_LABELS[selectedAnnonce.type] || selectedAnnonce.type}
                    </span>
                  )}
                  {selectedAnnonce.title && <h2 className="modal-title">{selectedAnnonce.title}</h2>}
                  
                  <div className="modal-meta-info">
                    {selectedAnnonce.start_date && <div><strong>Date :</strong> {new Date(selectedAnnonce.start_date).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</div>}
                    {selectedAnnonce.location && <div><strong>Lieu :</strong> {selectedAnnonce.location}</div>}
                    {selectedAnnonce.guest && <div><strong>Invités :</strong> {selectedAnnonce.guest}</div>}
                    {selectedAnnonce.type === 'evenement' && selectedAnnonce.maxParticipants && (
                      <div><strong>Participants max :</strong> {selectedAnnonce.maxParticipants}</div>
                    )}
                  </div>
                  
                  {selectedAnnonce.content && (
                    <p className="arabic-text modal-desc">{selectedAnnonce.content}</p>
                  )}
                </div>
              </div>
              
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AnnoncesPage;
