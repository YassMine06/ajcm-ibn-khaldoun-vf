import React, { useState } from 'react';
import './CalendarManager.css';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useEffect } from 'react';

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];

export default function CalendarManager() {
  const [today] = useState(new Date());
  const [current, setCurrent] = useState(new Date());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/events').then(res => setEvents(res.data)).catch(() => {});
  }, []);

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsThisMonth = events.filter(e => {
    if (!e.date) return false;
    return e.date.includes(MONTHS[month]) || e.date.includes(`${month + 1}`);
  });

  const prev = () => setCurrent(new Date(year, month - 1, 1));
  const next = () => setCurrent(new Date(year, month + 1, 1));

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="table-container" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ color: 'var(--primary-green)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={22} /> Calendrier (édition)
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn-icon" onClick={prev}><ChevronLeft size={20} /></button>
            <span style={{ fontWeight: 600, minWidth: '160px', textAlign: 'center' }}>
              {MONTHS[month]} {year}
            </span>
            <button className="btn-icon" onClick={next}><ChevronRight size={20} /></button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: 'center', fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.5rem' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {cells.map((day, i) => {
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            return (
              <div key={i} style={{
                minHeight: '60px',
                borderRadius: '8px',
                backgroundColor: day ? (isToday ? 'var(--primary-green)' : 'var(--off-white)') : 'transparent',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
                padding: '6px 8px',
                color: isToday ? 'var(--primary-gold)' : 'var(--text-dark)',
                fontWeight: isToday ? 700 : 400,
                fontSize: '0.875rem',
                border: day ? '1px solid var(--border-color)' : 'none',
              }}>
                {day}
              </div>
            );
          })}
        </div>
      </div>

      <div className="table-container" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-green)' }}>
          Événements de {MONTHS[month]}
        </h3>
        {eventsThisMonth.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Aucun événement trouvé ce mois-ci.</p>
        ) : (
          eventsThisMonth.map((e, i) => (
            <div key={i} style={{ padding: '0.75rem', borderLeft: '4px solid var(--primary-gold)', marginBottom: '0.75rem', backgroundColor: 'var(--off-white)', borderRadius: '0 6px 6px 0' }}>
              <div style={{ fontWeight: 600 }}>{e.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{e.date} — {e.lieu || 'Lieu non spécifié'}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
