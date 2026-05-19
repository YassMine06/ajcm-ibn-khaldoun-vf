import React, { useState, useEffect } from 'react';
import './eventpage.css';

export default function Evenements() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('http://localhost:8000/api/events/')
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(data => {
        // Si ton backend renvoie un tableau direct
        const liste = Array.isArray(data) ? data : (data.results || []);
        console.log('Événements reçus :', liste);
        setEvents(liste);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur fetch :', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.type === filter);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement des événements...</div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Erreur : {error}</div>;
  if (events.length === 0) return <div style={{ padding: '2rem', textAlign: 'center' }}>Aucun événement trouvé.</div>;

  return (
    <div className="evenements-page">
      <section className="desc-hero">
        <div className="desc-hero-bg"></div>
        <div className="desc-hero-overlay"></div>
        <div className="desc-hero-content">
          <span className="badge-identity">AJCM IBN KHALDOUN</span>
          <h1 className="animate-title">Nos Événements</h1>
          <p className="animate-subtitle">Découvrez nos activités culturelles, sportives et solidaires.</p>
        </div>
      </section>

      <div className="evts-filters-bar">
        <div className="evts-container">
          <div className="evts-filters">
            <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Tous</button>
            <button className={`filter-btn ${filter === 'CULTURE' ? 'active' : ''}`} onClick={() => setFilter('CULTURE')}>Culture</button>
            <button className={`filter-btn ${filter === 'SPORT' ? 'active' : ''}`} onClick={() => setFilter('SPORT')}>Sport</button>
            <button className={`filter-btn ${filter === 'FORMATION' ? 'active' : ''}`} onClick={() => setFilter('FORMATION')}>Formation</button>
            <button className={`filter-btn ${filter === 'SOLIDARITE' ? 'active' : ''}`} onClick={() => setFilter('SOLIDARITE')}>Solidarité</button>
            <button className={`filter-btn ${filter === 'SANTE' ? 'active' : ''}`} onClick={() => setFilter('SANTE')}>Santé</button>
          </div>
        </div>
      </div>

      <div className="evts-main">
        <div className="evts-container">
          <div className="section-header center-align">
            <h2>Programme des Activités</h2>
            <div className="section-divider"></div>
          </div>
          <div className="evts-grid">
            {filteredEvents.map(event => {
              const imageUrl = event.poster || (event.images?.[0]?.image) || null;
              return (
                <div className="evt-card" key={event.id}>
                  <div className="evt-card-img-wrap">
                    {imageUrl ? <img src={imageUrl} alt={event.Event_Name} /> : <div>📷</div>}
                  </div>
                  <div className="evt-card-body">
                    <div className="evt-cat-badge" style={{ backgroundColor: '#4a7c59' }}>
                      {event.type_display || event.type}
                    </div>
                    <h3>{event.Event_Name}</h3>
                    <p>{event.description?.slice(0, 120)}...</p>
                    <div className="evt-date">📅 {new Date(event.start_date).toLocaleDateString('fr-FR')}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}