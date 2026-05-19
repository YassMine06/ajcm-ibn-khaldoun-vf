import React, { useState, useEffect } from 'react';
import './MemberDashboard.css';
import { LayoutDashboard, ClipboardList, Clock, Calendar, Bell } from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import apiClient from '../../api/apiClient';

const mediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `http://localhost:8000${path}`;
};

export default function MemberDashboard() {
  const [events, setEvents]     = useState([]);
  const [myRegs, setMyRegs]     = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [evRes, regRes] = await Promise.allSettled([
          apiClient.get('/events/'),
          apiClient.get('/registrations/my-registrations/'),
        ]);
        if (evRes.status  === 'fulfilled') setEvents(evRes.value?.results  || evRes.value  || []);
        if (regRes.status === 'fulfilled') setMyRegs(regRes.value?.results || regRes.value || []);
      } catch (_) {}
      finally { setIsLoading(false); }
    };
    load();
  }, []);

  const upcomingEvents = events
    .filter(e => e.status === 'PUBLISHED' && new Date(e.start_date) >= new Date())
    .slice(0, 4);

  const cards = [
    { label: 'Événements disponibles', value: events.filter(e => e.status === 'PUBLISHED').length, icon: <ClipboardList size={22} />, color: '#2e513a', bg: '#ecfdf5' },
    { label: 'Mes inscriptions',       value: myRegs.length,                                        icon: <Calendar size={22} />,       color: '#C9A227',  bg: '#fef9ec' },
  ];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5rem' }}>
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #2e513a 0%, #3a6b4c 100%)',
        padding: '2rem 2.5rem', borderRadius: '16px',
        color: 'white', marginBottom: '2rem',
        boxShadow: '0 8px 32px rgba(46,81,58,0.25)',
        display: 'flex', alignItems: 'center', gap: '1rem'
      }}>
        <div style={{ background: 'rgba(255,255,255,0.12)', padding: '0.75rem', borderRadius: '12px' }}>
          <LayoutDashboard size={30} color="#fcd34d" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Mon Tableau de Bord
          </h1>
          <p style={{ margin: '0.2rem 0 0', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
            Suivez vos activités et inscriptions en temps réel
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        {cards.map((c, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: c.bg, color: c.color }}>{c.icon}</div>
            <div className="stat-info">
              <h3>{c.label}</h3>
              <p style={{ color: c.color, fontSize: '2rem', fontWeight: 800, margin: 0 }}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Événements à venir */}
      <div className="table-container" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b' }}>
          <Bell size={16} color="#C9A227" /> Prochains événements
        </h2>

        {upcomingEvents.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>
            Aucun événement à venir pour le moment.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {upcomingEvents.map(ev => (
              <div key={ev.id} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.9rem 1rem', borderRadius: '10px',
                background: '#f8fafc', border: '1px solid #e2e8f0',
              }}>
                {ev.poster ? (
                  <img src={mediaUrl(ev.poster)} alt={ev.Event_Name}
                    style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: 'rgba(46,81,58,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ClipboardList size={20} color="#2e513a" />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ev.Event_Name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                    📅 {new Date(ev.start_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    {ev.location && ` · 📍 ${ev.location}`}
                  </div>
                </div>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem',
                  borderRadius: 99, background: '#ecfdf5', color: '#2e513a',
                  border: '1px solid #bbf7d0', flexShrink: 0
                }}>
                  {ev.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
