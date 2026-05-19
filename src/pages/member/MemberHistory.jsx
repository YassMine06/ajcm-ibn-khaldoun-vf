import React from 'react';
import './MemberHistory.css';
import { History, CheckCircle, Calendar, MapPin } from 'lucide-react';

const history = [
  { title: 'Atelier Théâtre', date: '01/02/2026', lieu: 'Dār al-Shabāb Ibn Khaldoun' },
  { title: 'Formation Anashid Éducatif', date: '12/04/2026', lieu: 'Dār al-Shabāb al-Arabī' },
  { title: 'Soirée Coranique', date: '07/03/2026', lieu: 'Dār al-Shabāb Ibn Khaldoun' },
  { title: 'Camp Imouzzer', date: 'Été 2025', lieu: 'Imouzzer' },
];

export default function MemberHistory() {
  return (
    <div>
      <h1 className="page-title"><History size={24} /> Historique des événements</h1>
      <div className="table-container">
        <div className="table-header">
          <h2>{history.length} événement(s) participé(s)</h2>
          <span className="badge badge-success"><CheckCircle size={12} /> Toutes validées</span>
        </div>
        <table>
          <thead>
            <tr><th>#</th><th>Événement</th><th>Date</th><th>Lieu</th><th>Statut</th></tr>
          </thead>
          <tbody>
            {history.map((h, i) => (
              <tr key={i}>
                <td style={{ color: 'var(--gray-300)', fontWeight: 700, fontSize: '0.75rem' }}>{String(i + 1).padStart(2, '0')}</td>
                <td style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{h.title}</td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gray-500)', fontSize: '0.8rem' }}>
                    <Calendar size={13} /> {h.date}
                  </span>
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gray-500)', fontSize: '0.8rem' }}>
                    <MapPin size={13} /> {h.lieu}
                  </span>
                </td>
                <td><span className="badge badge-success"><CheckCircle size={11} /> Participé</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
