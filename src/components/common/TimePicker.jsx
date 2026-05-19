import React, { useState } from 'react';
import { Clock } from 'lucide-react';

export default function TimePicker({ value, onChange }) {
  const [showClock, setShowClock] = useState(false);
  const [clockMode, setClockMode] = useState('hours');
  const [tempHour, setTempHour] = useState(value ? value.split(':')[0] : '12');

  const handleHourClick = (h) => {
    setTempHour(h.toString().padStart(2, '0'));
    setClockMode('minutes');
  };

  const handleMinuteClick = (m) => {
    const minutes = m.toString().padStart(2, '0');
    onChange(`${tempHour}:${minutes}`);
    setShowClock(false);
    setClockMode('hours');
  };

  return (
    <div style={{ position: 'relative' }}>
      <input 
        type="text" 
        className="form-control" 
        placeholder="-- : --" 
        readOnly
        value={value || ''} 
        onClick={() => setShowClock(true)}
        style={{ cursor: 'pointer', background: 'white' }} 
      />
      <Clock size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
      
      {showClock && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 9998 }} 
            onClick={() => setShowClock(false)} 
          />
          <div className="clock-modal" style={{ 
            position: 'absolute', 
            top: '100%', 
            left: '50%', 
            transform: 'translateX(-50%)',
            marginTop: '0.5rem',
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '20px', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)', 
            width: '280px',
            zIndex: 9999 
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem', fontWeight: 700, color: 'var(--gray-700)', fontSize: '0.9rem' }}>
              {clockMode === 'hours' ? 'Sélectionner l\'heure' : 'Sélectionner les minutes'}
            </div>
            
            <div className="clock-face" style={{ width: '200px', height: '200px', margin: '0 auto', position: 'relative', background: '#f8fafc', borderRadius: '50%', border: '1px solid #e2e8f0' }}>
              {clockMode === 'hours' ? (
                [...Array(12)].map((_, i) => {
                  const hour = i + 1;
                  const angle = hour * 30;
                  const x = 50 + 38 * Math.sin((angle * Math.PI) / 180);
                  const y = 50 - 38 * Math.cos((angle * Math.PI) / 180);
                  return (
                    <button key={i} type="button" 
                      style={{ 
                        position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)', 
                        border: 'none', background: 'white', width: '30px', height: '30px', borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', 
                        fontWeight: 700, fontSize: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', color: 'var(--green-700)' 
                      }}
                      onClick={() => handleHourClick(hour)}>
                      {hour}
                    </button>
                  );
                })
              ) : (
                [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((min, i) => {
                  const angle = i * 30;
                  const x = 50 + 38 * Math.sin((angle * Math.PI) / 180);
                  const y = 50 - 38 * Math.cos((angle * Math.PI) / 180);
                  return (
                    <button key={i} type="button" 
                      style={{ 
                        position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)', 
                        border: 'none', background: 'var(--green-50)', width: '30px', height: '30px', borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', 
                        fontWeight: 700, fontSize: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', color: 'var(--green-900)' 
                      }}
                      onClick={() => handleMinuteClick(min)}>
                      {min}
                    </button>
                  );
                })
              )}
              
              {/* Hand */}
              <div style={{ 
                position: 'absolute', top: '50%', left: '50%', width: '2px', height: '65px', 
                background: 'var(--green-500)', transformOrigin: 'bottom center',
                transform: `translate(-50%, -100%) rotate(${clockMode === 'hours' ? (parseInt(tempHour) * 30) : (value ? parseInt(value.split(':')[1]) * 6 : 0)}deg)`,
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 1
              }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', width: '6px', height: '6px', background: 'var(--green-600)', borderRadius: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 }} />
            </div>
            
            {clockMode === 'minutes' && (
              <button type="button" className="btn-ghost" style={{ width: '100%', marginTop: '1rem', fontSize: '0.75rem', padding: '0.5rem' }} onClick={() => setClockMode('hours')}>
                ← Retour aux heures
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
