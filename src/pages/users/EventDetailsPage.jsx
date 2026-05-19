import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { eventsData } from '../../assets/eventsData';
import { categoriesData } from '../../assets/categoriesData';
import { User, Mail, Phone, Send, AlertCircle, CheckCircle, Users } from 'lucide-react';
import './EventDetailsPage.css';

const EventDetailsPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [apiEvent, setApiEvent] = useState(null);
  const [category, setCategory] = useState(null);
  const [likesCount, setLikesCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeSubEventIndex, setActiveSubEventIndex] = useState(-1);
  const [isMuted, setIsMuted] = useState(true);

  // Formulaire d'inscription
  const [formData, setFormData] = useState({ member_name: '', email: '', phone: '' });
  const [formStatus, setFormStatus] = useState({ loading: false, error: '', success: false });

  useEffect(() => {
    window.scrollTo(0, 0);

    const foundEvent = eventsData.find(e => e.folder === id);
    if (foundEvent) {
      setEvent(foundEvent);

      const foundCat = categoriesData.find(c => c.id === foundEvent.categoryId);
      setCategory(foundCat || categoriesData[categoriesData.length - 1]);

      setLikesCount(100 + (foundEvent.title.length * 5));
      setCurrentImageIndex(0);
      setActiveSubEventIndex(-1);

      // Fetch dynamic stats from backend
      const fetchApiEvent = async () => {
        try {
          const response = await axios.get('http://localhost:8000/api/events/');
          const data = response.data.results ? response.data.results : response.data;
          // Match by title
          const matched = data.find(e => e.Event_Name === foundEvent.title);
          if (matched) {
            setApiEvent(matched);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données de l'événement API:", error);
        }
      };
      fetchApiEvent();
    }
  }, [id]);

  const currentIndex = eventsData.findIndex(e => e.folder === id);
  const prevEvent = currentIndex > 0 ? eventsData[currentIndex - 1] : null;
  const nextEvent = currentIndex < eventsData.length - 1 ? eventsData[currentIndex + 1] : null;

  if (!event) {
    return (
      <div className="page-enter">
        <Navbar />
        <div style={{ padding: '150px 20px', textAlign: 'center', minHeight: '60vh' }}>
          <h2>Événement introuvable</h2>
          <p>Désolé, la page que vous recherchez n'existe pas.</p>
          <Link to="/evenements" style={{ color: '#4a7c59', fontWeight: 'bold', marginTop: '20px', display: 'inline-block' }}>
            Retour aux événements
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNextImage = () => {
    const currentMediaArray = activeSubEventIndex === -1 ? (event.media || []) : (event.subEvents[activeSubEventIndex].media || []);
    if (currentMediaArray && currentImageIndex < currentMediaArray.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    if (!apiEvent) return;

    setFormStatus({ loading: true, error: '', success: false });

    try {
      await axios.post('http://localhost:8000/api/registrations/event-requests/', {
        event: apiEvent.id,
        full_name: formData.member_name,
        email: formData.email,
        phone: formData.phone
      });

      setFormStatus({ loading: false, error: '', success: true });
      // Update places locally to avoid refetching
      setApiEvent(prev => ({
        ...prev,
        places_remaining: Math.max(0, prev.places_remaining - 1)
      }));
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || "Erreur lors de l'inscription.";
      setFormStatus({ loading: false, error: errorMsg, success: false });
    }
  };

  const currentMediaArray = activeSubEventIndex === -1
    ? (event.media || [])
    : (event.subEvents[activeSubEventIndex].media || []);

  const currentFolderPath = activeSubEventIndex === -1
    ? `/Evenements/${encodeURIComponent(event.folder)}`
    : `/Evenements/${encodeURIComponent(event.folder)}/${encodeURIComponent(event.subEvents[activeSubEventIndex].folder)}`;

  const renderMediaItem = (filename) => {
    if (!filename) return null;
    const isVideo = /\.(mp4|webm|mov|avi)$/i.test(filename);
    const src = `${currentFolderPath}/${filename}`;

    if (isVideo) {
      return (
        <>
          <video
            key={src} src={src} autoPlay muted={isMuted} loop playsInline className="media-item-video"
            onClick={(e) => { e.target.paused ? e.target.play() : e.target.pause(); }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <button
            className="volume-toggle-btn"
            onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </>
      );
    }

    return <img key={src} src={src} alt={event.title} onError={(e) => { e.target.src = '/logo_ajcm.svg'; }} />;
  };

  const renderRegistrationSection = () => {
    if (!apiEvent) return null;

    const isPast = apiEvent.status === 'past';
    const isFull = apiEvent.places_remaining <= 0;

    return (
      <div className="registration-section" style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={20} color="#2e513a" /> Inscription à l'événement
        </h3>

        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ background: '#dcfce7', color: '#166534', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600 }}>
            Places restantes : {apiEvent.places_remaining}
          </span>
          {isPast && (
            <span style={{ background: '#fee2e2', color: '#991b1b', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600 }}>
              Événement terminé
            </span>
          )}
          {isFull && !isPast && (
            <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600 }}>
              Complet
            </span>
          )}
        </div>

        {formStatus.success ? (
          <div style={{ background: '#ecfdf5', color: '#065f46', padding: '1rem', borderRadius: '8px', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={20} />
            <strong>Inscription confirmée !</strong> Vous êtes bien inscrit(e).
          </div>
        ) : (
          <form onSubmit={handleRegistrationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {formStatus.error && (
              <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', border: '1px solid #fecaca', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} /> {formStatus.error}
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text" required placeholder="Votre nom complet"
                value={formData.member_name} onChange={e => setFormData({ ...formData, member_name: e.target.value })}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                disabled={isPast || isFull || formStatus.loading}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1 1 200px' }}>
                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email" required placeholder="Adresse email"
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  disabled={isPast || isFull || formStatus.loading}
                />
              </div>
              <div style={{ position: 'relative', flex: '1 1 200px' }}>
                <Phone size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="tel" required placeholder="Numéro de téléphone"
                  value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  disabled={isPast || isFull || formStatus.loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPast || isFull || formStatus.loading}
              style={{
                background: isPast || isFull ? '#94a3b8' : '#C9A227',
                color: 'white', padding: '0.85rem', borderRadius: '8px', border: 'none', fontWeight: 600,
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                cursor: isPast || isFull || formStatus.loading ? 'not-allowed' : 'pointer'
              }}
            >
              {formStatus.loading ? 'Envoi en cours...' : (isPast ? 'Événement terminé' : (isFull ? 'Complet' : 'Confirmer l\'inscription'))}
              {!isPast && !isFull && !formStatus.loading && <Send size={16} />}
            </button>
          </form>
        )}
      </div>
    );
  };

  return (
    <div className="event-details-page page-enter">
      <Navbar />

      {prevEvent && (
        <Link to={`/evenements/${encodeURIComponent(prevEvent.folder)}`} className="event-side-nav prev" aria-label="Événement précédent">
          &#10094;
        </Link>
      )}

      {nextEvent && (
        <Link to={`/evenements/${encodeURIComponent(nextEvent.folder)}`} className="event-side-nav next" aria-label="Événement suivant">
          &#10095;
        </Link>
      )}

      <div className="event-navigation-top">
        <div className="mobile-only-nav">
          {prevEvent ? (
            <Link to={`/evenements/${encodeURIComponent(prevEvent.folder)}`} className="event-nav-btn">
              &#10094; <span>Précédent</span>
            </Link>
          ) : <div className="event-nav-placeholder" />}
        </div>

        <Link to="/evenements" className="back-btn" style={{ margin: '0 auto' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span className="hide-on-mobile">Tous les événements</span>
        </Link>

        <div className="mobile-only-nav">
          {nextEvent ? (
            <Link to={`/evenements/${encodeURIComponent(nextEvent.folder)}`} className="event-nav-btn">
              <span>Suivant</span> &#10095;
            </Link>
          ) : <div className="event-nav-placeholder" />}
        </div>
      </div>

      <div className="event-details-container">
        <div className="insta-media">
          {currentMediaArray && currentMediaArray.length > 0 ? (
            <>
              {renderMediaItem(currentMediaArray[currentImageIndex])}

              {currentImageIndex > 0 && (
                <button className="carousel-btn prev-btn" onClick={handlePrevImage} aria-label="Média précédent">&#10094;</button>
              )}

              {currentImageIndex < currentMediaArray.length - 1 && (
                <button className="carousel-btn next-btn" onClick={handleNextImage} aria-label="Média suivant">&#10095;</button>
              )}

              {currentMediaArray.length > 1 && (
                <div className="carousel-dots">
                  {currentMediaArray.map((_, idx) => (
                    <span key={idx} className={`carousel-dot ${idx === currentImageIndex ? 'active' : ''}`} onClick={() => setCurrentImageIndex(idx)} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <img src={`${currentFolderPath}/poster.jpg`} alt={event.title} onError={(e) => { e.target.src = '/logo_ajcm.svg'; }} />
          )}

          {category && <span className="insta-category-badge" style={{ background: category.color }}>{category.name}</span>}
        </div>

        <div className="insta-right-panel">
          <header className="insta-header">
            <img src="/logo_ajcm.svg" alt="AJCM Logo" className="insta-avatar" />
            <div className="insta-author-info">
              <span className="insta-author-name">ajcm_mohammedia</span>
              {event.lieu && <span className="insta-location">{event.lieu}</span>}
            </div>
          </header>

          <div className="insta-right-scrollable">
            <div className="insta-content">
              {event.subEvents && event.subEvents.length > 0 && (
                <div className="sub-events-tabs">
                  <button className={`sub-event-tab ${activeSubEventIndex === -1 ? 'active' : ''}`} onClick={() => { setActiveSubEventIndex(-1); setCurrentImageIndex(0); }}>العامة</button>
                  {event.subEvents.map((sub, idx) => (
                    <button key={idx} className={`sub-event-tab ${activeSubEventIndex === idx ? 'active' : ''}`} onClick={() => { setActiveSubEventIndex(idx); setCurrentImageIndex(0); }}>{sub.name}</button>
                  ))}
                </div>
              )}

              <div className="insta-caption"><strong>ajcm_mohammedia</strong> {event.title}</div>

              {(event.description_fr || event.desc) && <div className="insta-desc-fr">{event.description_fr || event.desc}</div>}
              {event.description_ar && <div className="insta-desc-ar" dir="rtl">{event.description_ar}</div>}

              <div className="insta-details-list">
                {event.date && <p><strong>🗓️ Date :</strong> {event.date}</p>}
                {event.lieu && <p><strong>📍 Lieu :</strong> {event.lieu}</p>}
                {event.membres && <p><strong>👥 Invités :</strong> {event.membres}</p>}
              </div>

              {/* Dynamic Registration Section */}
              {renderRegistrationSection()}
            </div>
          </div>

          <div className="insta-right-footer">
            <div className="insta-actions">
              <div className="action-icons-left">
                <button className="action-btn" onClick={handleShare} aria-label="Share">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
                {copied && <span className="copy-feedback">Lien copié !</span>}
              </div>
            </div>

            <div className="insta-likes">{likesCount} J'aime</div>
            <div className="insta-time">IL Y A QUELQUES JOURS</div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EventDetailsPage;
