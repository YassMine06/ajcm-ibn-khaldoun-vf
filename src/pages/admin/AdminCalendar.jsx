import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminCalendar.css';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, AlertCircle, RefreshCw, Plus, Image as ImageIcon } from 'lucide-react';
import eventService from '../../api/eventService';
import Spinner from '../../components/common/Spinner';

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS   = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

const mediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `http://localhost:8000${path}`;
};

export default function AdminCalendar() {
  const navigate = useNavigate();
  const [events,    setEvents]    = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState('');
  const [today]  = useState(new Date());
  const [current, setCurrent] = useState(new Date());
  const [active,  setActive]  = useState(null);

  /* ── Charger les événements (une seule fois) ── */
  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await eventService.getAll();
      const raw = res.results || res || [];
      // Normaliser : utiliser start_date (champ réel du backend)
      const mapped = raw
        .filter(e => e.start_date)
        .map(e => {
          const d = new Date(e.start_date);
          // Forcer date locale (ignore timezone)
          const localDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          return { ...e, calendarDate: localDate };
        });
      setEvents(mapped);
    } catch {
      setError('Impossible de charger les événements.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []); // ← une seule exécution

  /* ── Navigation ── */
  const year  = current.getFullYear();
  const month = current.getMonth();
  const prev  = () => { setActive(null); setCurrent(new Date(year, month - 1, 1)); };
  const next  = () => { setActive(null); setCurrent(new Date(year, month + 1, 1)); };

  const firstDay    = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = useMemo(() => {
    const c = [];
    for (let i = 0; i < firstDay; i++) c.push(null);
    for (let d = 1; d <= daysInMonth; d++) c.push(d);
    return c;
  }, [firstDay, daysInMonth]);

  /* Événements d'un jour donné */
  const getDayEvents = useCallback((day) =>
    events.filter(e => {
      const d = e.calendarDate;
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    }), [events, month, year]);

  /* Événements du panneau (jour sélectionné OU tout le mois) */
  const panelEvents = useMemo(() => {
    if (active) return getDayEvents(active);
    return events
      .filter(e => e.calendarDate.getMonth() === month && e.calendarDate.getFullYear() === year)
      .sort((a, b) => a.calendarDate - b.calendarDate);
  }, [events, active, month, year, getDayEvents]);

  return (
    <div style={{ width: '100%' }} className="page-enter">

      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>
          <CalendarIcon size={24} style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: '#C9A227' }} />
          Calendrier des événements
        </h1>
        <button className="btn-icon" onClick={loadData} title="Actualiser" disabled={isLoading}>
          <RefreshCw size={18} className={isLoading ? 'spin' : ''} />
        </button>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
          <AlertCircle size={20} /><span>{error}</span>
          <button onClick={loadData} style={{ marginLeft: 'auto', background: 'none', border: '1px solid #fca5a5', padding: '0.25rem 0.75rem', borderRadius: '6px', color: '#dc2626', cursor: 'pointer' }}>
            Réessayer
          </button>
        </div>
      )}

      <div className="calendar-split">

        {/* ════ COLONNE GAUCHE — mini calendrier ════ */}
        <div className="cal-left">
          <div className="cal-card">

            {/* Navigation mois */}
            <div className="cal-header">
              <button className="cal-nav-btn" onClick={prev}><ChevronLeft size={18} /></button>
              <div className="cal-selectors">
                <select className="cal-select" value={month}
                  onChange={e => { setActive(null); setCurrent(new Date(year, parseInt(e.target.value), 1)); }}>
                  {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <select className="cal-select" value={year}
                  onChange={e => { setActive(null); setCurrent(new Date(parseInt(e.target.value), month, 1)); }}>
                  {[...Array(11)].map((_, i) => {
                    const y = new Date().getFullYear() - 2 + i;
                    return <option key={y} value={y}>{y}</option>;
                  })}
                </select>
              </div>
              <button className="cal-nav-btn" onClick={next}><ChevronRight size={18} /></button>
            </div>

            {/* Libellés jours */}
            <div className="cal-day-labels">
              {DAYS.map(d => <div key={d} className="cal-day-label">{d}</div>)}
            </div>

            {/* Grille jours */}
            <div className="cal-grid">
              {cells.map((day, i) => {
                const dayEvents = day ? getDayEvents(day) : [];
                const hasEvts  = dayEvents.length > 0;
                const isToday  = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const isActive = day === active;
                return (
                  <div key={i}
                    className={`cal-cell${!day ? ' cal-cell--empty' : ''}${hasEvts ? ' cal-cell--has' : ''}${isToday ? ' cal-cell--today' : ''}${isActive ? ' cal-cell--active' : ''}`}
                    onClick={() => day && setActive(active === day ? null : day)}
                  >
                    {day && <span className="cal-cell-num">{day}</span>}
                    {hasEvts && (
                      <div className="cal-dots">
                        {dayEvents.slice(0, 3).map((_, idx) => (
                          <span key={idx} className="cal-dot" style={{ backgroundColor: '#2e513a' }} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pied */}
            <div className="cal-footer">
              <div className="cal-stat">
                <strong>{panelEvents.length}</strong> {active ? 'événement(s) ce jour' : 'en ce mois'}
              </div>
              <button className="cal-today-btn" onClick={() => { setActive(today.getDate()); setCurrent(new Date()); }}>
                Aujourd'hui
              </button>
            </div>
          </div>
        </div>

        {/* ════ COLONNE DROITE — liste événements ════ */}
        <div className="cal-right">
          <div className="cal-right-header">
            <div>
              <h2 className="cal-right-title">
                {active ? `${active} ${MONTHS[month]} ${year}` : `${MONTHS[month]} ${year}`}
              </h2>
              <p className="cal-right-sub">{panelEvents.length} événement(s)</p>
            </div>
            <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
              onClick={() => navigate('/admin/activities', { state: { openForm: true } })}>
              <Plus size={16} /> Ajouter un événement
            </button>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <Spinner size={36} />
              <p className="text-muted" style={{ marginTop: '1rem' }}>Chargement...</p>
            </div>
          ) : panelEvents.length === 0 ? (
            <div className="cal-empty-state">
              <CalendarIcon size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <p>Aucun événement prévu pour cette période.</p>
              <button className="btn-primary" style={{ marginTop: '1rem', fontSize: '0.85rem' }}
                onClick={() => navigate('/admin/activities', { state: { openForm: true } })}>
                <Plus size={14} /> Créer un événement
              </button>
            </div>
          ) : (
            <div className="cal-event-list">
              {panelEvents.map((evt, idx) => (
                <div key={idx} className="cal-evt-card"
                  onClick={() => navigate('/admin/activities')}
                  style={{ cursor: 'pointer' }}>

                  {/* Poster */}
                  <div className="cal-evt-poster">
                    {mediaUrl(evt.poster) ? (
                      <img src={mediaUrl(evt.poster)} alt={evt.Event_Name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#94a3b8' }}>
                        <ImageIcon size={22} />
                      </div>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="cal-evt-body">
                    <span className="cal-evt-type-badge" style={{ background: '#ecfdf5', color: '#15803d' }}>
                      {evt.type_display || evt.type || 'Événement'}
                    </span>
                    <h3 className="cal-evt-title">{evt.Event_Name}</h3>
                    <p className="cal-evt-desc" style={{ margin: '0.25rem 0 0.5rem', fontSize: '0.8rem', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {evt.description || 'Aucune description.'}
                    </p>
                    <div className="cal-evt-meta">
                      {evt.start_time && (
                        <div className="cal-meta-item"><Clock size={13} /> {evt.start_time.substring(0, 5)}</div>
                      )}
                      {(evt.location || evt.city) && (
                        <div className="cal-meta-item"><MapPin size={13} /> {[evt.location, evt.city].filter(Boolean).join(', ')}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
