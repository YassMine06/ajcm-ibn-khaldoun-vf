import React from 'react';
import './MemberNotifications.css';
import { Bell, CheckCircle, Info, AlertCircle, X } from 'lucide-react';

const notifications = [
  { type: 'success', icon: <CheckCircle size={18} />, title: 'Inscription approuvée', msg: 'Votre inscription à "Atelier Théâtre" a été approuvée.', time: 'Il y a 2h', bg: 'var(--success-bg)', color: 'var(--success)', border: '#a7f3d0' },
  { type: 'info',    icon: <Info size={18} />,         title: 'Nouveau événement',    msg: 'Un nouvel événement est disponible : Formation Anashid Éducatif.', time: 'Hier', bg: 'var(--info-bg)', color: 'var(--info)', border: '#bfdbfe' },
  { type: 'info',    icon: <Bell size={18} />,          title: 'Rappel',               msg: 'Réunion générale le 10 mai 2026 à 18h, Dār al-Shabāb Ibn Khaldoun.', time: 'Il y a 3 jours', bg: 'var(--gold-100)', color: 'var(--gold-600)', border: '#fde68a' },
  { type: 'warning', icon: <AlertCircle size={18} />,  title: 'Date limite proche',   msg: "La date limite d'inscription au Camp Imouzzer est dans 2 jours.", time: 'Il y a 5 jours', bg: 'var(--warning-bg)', color: 'var(--warning)', border: '#fcd34d' },
];

export default function MemberNotifications() {
  return (
    <div>
      <h1 className="page-title"><Bell size={24} /> Notifications</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '720px' }}>
        {notifications.map((n, i) => (
          <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', backgroundColor: n.bg, border: `1px solid ${n.border}`, transition: 'var(--transition)' }}>
            <div style={{ color: n.color, flexShrink: 0, marginTop: '2px' }}>{n.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--gray-900)', marginBottom: '0.2rem' }}>{n.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', lineHeight: 1.5 }}>{n.msg}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginTop: '0.5rem' }}>{n.time}</div>
            </div>
            <button style={{ color: 'var(--gray-300)', flexShrink: 0, alignSelf: 'flex-start', padding: '2px' }}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
