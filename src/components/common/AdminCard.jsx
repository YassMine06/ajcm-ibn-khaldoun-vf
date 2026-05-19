import React from 'react';
import { Calendar, Clock, MapPin, Edit2, Trash2, Users, Megaphone, Image as ImageIcon } from 'lucide-react';

export default function AdminCard({ 
  title, 
  date, 
  time, 
  location,
  lieu, // Alternative for location
  image, 
  type, // 'evenement' or 'actualite' or 'activite'
  onEdit, 
  onDelete, 
  onViewRegistrations 
}) {
  const displayLocation = location || lieu || 'AJCM';
  
  // Logic for badge styles based on type
  const getBadgeStyle = () => {
    switch(type) {
      case 'evenement': return { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe', label: 'Événement' };
      case 'actualite': return { bg: '#dcfce7', text: '#065f46', border: '#bbf7d0', label: 'Actualité' };
      default: return { bg: '#fef3c7', text: '#92400e', border: '#fde68a', label: 'Événement' };
    }
  };

  const style = getBadgeStyle();

  return (
    <div className="event-card">
      <div className="event-card-image">
        {image ? (
          <img 
            src={image} 
            alt={title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { 
              e.target.style.display = 'none'; 
              if(e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; 
            }} 
          />
        ) : null}
        <div style={{ 
          background: 'linear-gradient(135deg, #1e293b, #0f172a)', 
          width: '100%', 
          height: '100%', 
          display: image ? 'none' : 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <ImageIcon color="rgba(255,255,255,0.2)" size={64} />
        </div>
        <div className="event-badge">
          <span className="badge" style={{ 
            backgroundColor: style.bg, 
            color: style.text,
            fontWeight: 800,
            textTransform: 'uppercase',
            fontSize: '0.6rem',
            letterSpacing: '0.5px',
            padding: '4px 12px',
            borderRadius: '20px',
            border: `1px solid ${style.border}`
          }}>
            {style.label}
          </span>
        </div>
      </div>
      
      <div className="event-card-content" style={{ padding: '1.25rem 1.25rem 0.85rem 1.25rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--gray-800)', minHeight: '2.8em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
          {title || 'Sans titre'}
        </h3>
        
        <div className="event-details" style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div className="event-detail-item" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--gray-600)' }}>
            <Calendar size={13} style={{ color: '#3b82f6' }} />
            <span>{date || '--/--/----'} {time ? `à ${time}` : ''}</span>
          </div>
          <div className="event-detail-item" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--gray-600)' }}>
            <MapPin size={13} style={{ color: '#ef4444' }} />
            <span>{displayLocation}</span>
          </div>
        </div>
        
        <div className="event-card-actions" style={{ marginTop: '0.75rem', paddingTop: '0.6rem', borderTop: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button className="btn-ghost" onClick={onEdit} style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <Edit2 size={13} /> Modifier
          </button>
          
          {onViewRegistrations && (
            <button className="btn-icon" onClick={onViewRegistrations} title="Voir les inscrits" style={{ color: '#3b82f6', backgroundColor: '#eff6ff', width: '32px', height: '32px', borderRadius: '8px' }}>
              <Users size={16} />
            </button>
          )}

          <button className="btn-icon danger" onClick={onDelete} title="Supprimer" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
