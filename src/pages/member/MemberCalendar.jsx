import React, { useState, useEffect, useMemo } from 'react';
import './MemberCalendar.css';
import axios from 'axios';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

export default function MemberCalendar() {
  const [events, setEvents] = useState([]);
  const [today] = useState(new Date());
  const [current, setCurrent] = useState(new Date());
  const [active, setActive] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, annoncesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/events'),
          axios.get('http://localhost:5000/api/annonces')
        ]);
        
        const combined = [
          ...eventsRes.data.map(e => {
            const rawDate = e.date || e.startDate;
            if (!rawDate) return null;
            const d = new Date(rawDate);
            const localDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
            return { ...e, calendarDate: localDate, isActivity: true };
          }).filter(Boolean),
          ...annoncesRes.data
            .filter(a => a.type === 'evenement' || a.type === 'événement')
            .map(a => {
              const d = new Date(a.date);
              const localDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
              return { ...a, calendarDate: localDate, isAnnonce: true };
            })
        ];
        setEvents(combined);
      } catch (err) {
        console.error("Error fetching calendar data:", err);
      }
    };
    fetchData();
  }, []);

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prev = () => { setActive(null); setCurrent(new Date(year, month - 1, 1)); };
  const next = () => { setActive(null); setCurrent(new Date(year, month + 1, 1)); };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const getDayEvents = (day) => {
    return events.filter(e => {
      const d = e.calendarDate;
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const panelEvents = useMemo(() => {
    if (active) return getDayEvents(active);
    return events.filter(e => {
      const d = e.calendarDate;
      return d.getMonth() === month && d.getFullYear() === year;
    }).sort((a, b) => a.calendarDate - b.calendarDate);
  }, [events, active, month, year]);

  const handleDayClick = (day) => {
    if (!day) return;
    setActive(active === day ? null : day);
  };

  return (
    <div className="calendar-container">
      <h1 className="page-title"><CalendarIcon size={24} /> Mon Calendrier</h1>
      
      <div className="calendar-split">
        {/* LEFT - Mini Calendar Widget */}
        <div className="cal-left">
          <div className="cal-card">
            <div className="cal-header">
              <button className="cal-nav-btn" onClick={prev}><ChevronLeft size={18} /></button>
              
              <div className="cal-selectors">
                <select 
                  className="cal-select"
                  value={month} 
                  onChange={(e) => { setActive(null); setCurrent(new Date(year, parseInt(e.target.value), 1)); }}
                >
                  {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <select 
                  className="cal-select"
                  value={year} 
                  onChange={(e) => { setActive(null); setCurrent(new Date(parseInt(e.target.value), month, 1)); }}
                >
                  {[...Array(11)].map((_, i) => {
                    const y = 2020 + i;
                    return <option key={y} value={y}>{y}</option>
                  })}
                </select>
              </div>

              <button className="cal-nav-btn" onClick={next}><ChevronRight size={18} /></button>
            </div>

            <div className="cal-day-labels">
              {DAYS.map(d => <div key={d} className="cal-day-label">{d}</div>)}
            </div>

            <div className="cal-grid">
              {cells.map((day, i) => {
                const dayEvents = day ? getDayEvents(day) : [];
                const hasEvts = dayEvents.length > 0;
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const isActive = day === active;
                
                return (
                  <div 
                    key={i} 
                    className={`cal-cell ${!day ? 'cal-cell--empty' : ''} ${hasEvts ? 'cal-cell--has' : ''} ${isToday ? 'cal-cell--today' : ''} ${isActive ? 'cal-cell--active' : ''}`}
                    onClick={() => handleDayClick(day)}
                  >
                    {day && <span className="cal-cell-num">{day}</span>}
                    {hasEvts && (
                      <div className="cal-dots">
                        {dayEvents.slice(0, 3).map((e, idx) => (
                          <span key={idx} className="cal-dot" />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="cal-footer">
              <div className="cal-stat">
                <strong>{panelEvents.length}</strong> {active ? 'événement(s) ce jour' : 'en ce mois'}
              </div>
              <button className="cal-today-btn" onClick={() => { setActive(today.getDate()); setCurrent(new Date()); }}>Aujourd'hui</button>
            </div>
          </div>
        </div>

        {/* RIGHT - Event List */}
        <div className="cal-right">
          <div className="cal-right-header">
            <h2 className="cal-right-title">
              {active ? `${active} ${MONTHS[month]} ${year}` : `${MONTHS[month]} ${year}`}
            </h2>
            <p className="cal-right-sub">{panelEvents.length} événement(s) trouvé(s)</p>
          </div>

          {panelEvents.length === 0 ? (
            <div className="cal-empty-state">
              <CalendarIcon size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <p>Aucun événement prévu pour cette période.</p>
            </div>
          ) : (
            <div className="cal-event-list">
              {panelEvents.map((evt, idx) => (
                <div key={idx} className="cal-evt-card">
                  <div className="cal-evt-poster">
                    {evt.image ? (
                      <img src={evt.image.startsWith('data:') ? evt.image : `/${evt.image}`} alt={evt.title} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)' }}>
                        <CalendarIcon size={24} />
                      </div>
                    )}
                  </div>
                  <div className="cal-evt-body">
                    <span className="cal-evt-type-badge" style={{ 
                      backgroundColor: evt.isActivity ? 'var(--success-bg)' : 'var(--info-bg)',
                      color: evt.isActivity ? 'var(--success)' : 'var(--info)'
                    }}>
                      {evt.isActivity ? 'Activité' : 'Événement'}
                    </span>
                    <h3 className="cal-evt-title">{evt.title}</h3>
                    <p className="cal-evt-desc">{evt.desc || evt.text || 'Pas de description.'}</p>
                    <div className="cal-evt-meta">
                      <div className="cal-meta-item">
                        <Clock size={14} /> {evt.startTime || 'Heure non spécifiée'}
                      </div>
                      <div className="cal-meta-item">
                        <MapPin size={14} /> {evt.location || evt.lieu || 'AJCM'}
                      </div>
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
