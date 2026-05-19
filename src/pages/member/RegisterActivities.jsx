import React, { useState, useEffect } from 'react';
import './RegisterActivities.css';
import { ClipboardList, CheckCircle, Clock, XCircle } from 'lucide-react';
import axios from 'axios';

export default function RegisterActivities() {
  const [events, setEvents] = useState([]);
  const [registered, setRegistered] = useState({});

  useEffect(() => {
    const fetchAnnonces = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/annonces');
        console.log("Annonces reçues:", res.data); // Pour le débogage si possible
        
        if (Array.isArray(res.data)) {
          // Filtrer les annonces de type 'evenement' (insensible à la casse)
          const onlyEvents = res.data.filter(a => 
            a.type?.toLowerCase() === 'evenement' || 
            a.type?.toLowerCase() === 'événement'
          );
          setEvents(onlyEvents);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des annonces:", err);
      }
    };
    
    fetchAnnonces();
  }, []);

  const handleRegister = (id) => setRegistered(prev => ({ ...prev, [id]: 'pending' }));

  const statusBadge = {
    pending:  <span className="badge badge-warning"><Clock size={11} /> En attente</span>,
    approved: <span className="badge badge-success"><CheckCircle size={11} /> Approuvée</span>,
    rejected: <span className="badge badge-danger"><XCircle size={11} /> Refusée</span>,
  };

  return (
    <div>
      <h1 className="page-title"><ClipboardList size={24} /> Inscription aux événements</h1>
      
      {events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)' }}>
          <Clock size={48} color="var(--gray-300)" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'var(--gray-500)', fontWeight: 500 }}>Aucun événement disponible pour l'inscription.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {events.map((ev, i) => {
            const status = registered[ev.id || ev._id];
            return (
              <div key={ev.id || ev._id || i} className="event-card">
                <div className="event-card-title">{ev.title}</div>
                {(ev.date) && (
                  <div className="event-card-meta">
                    <Clock size={12} /> {ev.date} {ev.startTime ? `à ${ev.startTime}` : ''}
                  </div>
                )}
                {(ev.location || ev.lieu) && (
                  <div className="event-card-meta">
                    <span>📍</span> {ev.location || ev.lieu}
                  </div>
                )}
                <div className="event-card-footer">
                  {status ? statusBadge[status] : (
                    <button className="btn-primary" style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }} onClick={() => handleRegister(ev.id || ev._id)}>
                      S'inscrire
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
