import React, { useState, useEffect } from 'react';
import {
  Users, Calendar, Megaphone, UserCheck,
  TrendingUp, RefreshCw, Mail, Tag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import eventService from '../../api/eventService';
import annonceService from '../../api/annonceService';
import userService from '../../api/userService';
import apiClient from '../../api/apiClient';
import Spinner from '../../components/common/Spinner';
import './Statistics.css';
import './Admin.css';

/* ── Helpers ─────────────────────────────────────── */
const EVENT_TYPE_LABELS = {
  CULTURE: 'Culture', JEUNESSE: 'Jeunesse', FORMATION: 'Formation',
  EVENEMENT: 'Événement', ART: 'Art', SPORT: 'Sport',
  SOLIDARITE: 'Solidarité', SANTE: 'Santé', CITOYENNETE: 'Citoyenneté', AUTRE: 'Autre',
};

const TYPE_COLORS = [
  '#2e513a', '#C9A227', '#1d4ed8', '#dc2626',
  '#7c3aed', '#0891b2', '#d97706', '#059669', '#be185d', '#64748b'
];

/** Build SVG donut path for a given segment */
function polarToXY(cx, cy, r, angle) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutSegment(cx, cy, r, innerR, startAngle, endAngle, color, key) {
  const start = polarToXY(cx, cy, r, startAngle);
  const end   = polarToXY(cx, cy, r, endAngle);
  const iStart = polarToXY(cx, cy, innerR, startAngle);
  const iEnd   = polarToXY(cx, cy, innerR, endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return (
    <path key={key} fill={color} d={`
      M ${start.x} ${start.y}
      A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}
      L ${iEnd.x} ${iEnd.y}
      A ${innerR} ${innerR} 0 ${large} 0 ${iStart.x} ${iStart.y}
      Z
    `} />
  );
}

function DonutChart({ data, size = 180 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.42, innerR = size * 0.26;
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return <div style={{ height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>Aucune donnée</div>;
  let angle = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((d, i) => {
        const sweep = (d.value / total) * 360;
        const seg = donutSegment(cx, cy, r, innerR, angle, angle + sweep - 0.5, d.color, i);
        angle += sweep;
        return seg;
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="20" fontWeight="800" fill="#1e293b">{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#64748b">total</text>
    </svg>
  );
}

export default function Statistics() {
  const [events, setEvents]           = useState([]);
  const [annonces, setAnnonces]       = useState([]);
  const [members, setMembers]         = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [isLoading, setIsLoading]     = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ev, an, us, re, mb] = await Promise.allSettled([
        eventService.getAll(),
        annonceService.getAll(),
        userService.getAll(),
        apiClient.get('/registrations/admin/event-requests/'),
        apiClient.get('/registrations/admin/membership-requests/'),
      ]);
      const g = (r) => r.status === 'fulfilled' ? (r.value?.results || r.value || []) : [];
      setEvents(g(ev));
      setAnnonces(g(an));
      setMembers(g(us));
      setRegistrations(g(re));
      setMemberships(g(mb));
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  /* ── Computed data ──────────────────────────── */

  // 1. Events by type
  const typeCount = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1; return acc;
  }, {});
  const typeData = Object.entries(typeCount)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count], i) => ({ label: EVENT_TYPE_LABELS[type] || type, count, color: TYPE_COLORS[i % TYPE_COLORS.length] }));
  const maxTypeCount = Math.max(...typeData.map(d => d.count), 1);

  // 2. Registration statuses (event registrations)
  const regByStatus = registrations.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1; return acc;
  }, {});
  const regDonut = [
    { label: 'Confirmé',   value: regByStatus.CONFIRMED || 0, color: '#2e513a' },
    { label: 'En attente', value: regByStatus.PENDING   || 0, color: '#C9A227' },
    { label: 'Rejeté',    value: regByStatus.REJECTED   || 0, color: '#dc2626' },
    { label: 'Annulé',    value: regByStatus.CANCELLED  || 0, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  // 3. Membership requests by status
  const mbByStatus = memberships.reduce((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1; return acc;
  }, {});
  const mbData = [
    { label: 'En attente', value: mbByStatus.PENDING  || 0, color: '#C9A227' },
    { label: 'Approuvé',   value: mbByStatus.APPROVED || 0, color: '#2e513a' },
    { label: 'Rejeté',    value: mbByStatus.REJECTED  || 0, color: '#dc2626' },
  ];
  const maxMb = Math.max(...mbData.map(d => d.value), 1);

  // 4. Recent events (last 5)
  const recentEvents = [...events]
    .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
    .slice(0, 5);

  // KPI cards
  const cards = [
    { label: 'Événements',   value: events.length,        icon: <Calendar  size={22}/>, color: '#2e513a', bg: '#dcfce7', path: '/admin/activities'   },
    { label: 'Annonces',     value: annonces.length,      icon: <Megaphone size={22}/>, color: '#C9A227', bg: '#fef9ec', path: '/admin/annonces'     },
    { label: 'Membres',      value: members.length,       icon: <Users     size={22}/>, color: '#1d4ed8', bg: '#dbeafe', path: '/admin/members'      },
    { label: 'Inscriptions', value: registrations.length, icon: <UserCheck size={22}/>, color: '#dc2626', bg: '#fee2e2', path: '/admin/registrations' },
  ];

  return (
    <div className="page-enter">

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={26} color="#C9A227" /> Tableau de bord
          </h1>
          <p className="text-muted">Statistiques en temps réel — AJCM Ibn Khaldoun</p>
        </div>
        <button className="btn-ghost" onClick={loadData} disabled={isLoading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <RefreshCw size={15} className={isLoading ? 'spin' : ''} />
          {isLoading ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {cards.map((c, i) => (
          <Link to={c.path} key={i} className="stat-card" style={{ textDecoration: 'none' }}>
            <div className="stat-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
            <div className="stat-info">
              <h3 style={{ color: c.color }}>
                {isLoading ? <Spinner size={18} /> : c.value}
              </h3>
              <p>{c.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Row 1 : Types + Inscriptions donut ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>

        {/* Chart 1 — Events by type (vertical bars) */}
        <div className="section-box" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Tag size={16} color="#C9A227" />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>Événements par type</h3>
          </div>

          {isLoading ? <div style={{ textAlign: 'center', padding: '3rem' }}><Spinner size={32} /></div>
          : typeData.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>Aucun événement</p>
          : (
            <div>
              {/* Bars */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '160px', padding: '0 0.25rem' }}>
                {typeData.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: d.color }}>{d.count}</span>
                    <div
                      title={`${d.label}: ${d.count}`}
                      style={{
                        width: '100%', background: d.color, opacity: 0.85,
                        height: `${Math.round((d.count / maxTypeCount) * 130)}px`,
                        borderRadius: '4px 4px 0 0', transition: 'height 0.6s cubic-bezier(.4,0,.2,1)',
                        cursor: 'default', minHeight: '4px'
                      }}
                    />
                  </div>
                ))}
              </div>
              {/* Labels */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px', padding: '0 0.25rem' }}>
                {typeData.map((d, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.6rem', color: '#64748b', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.label}>
                    {d.label}
                  </div>
                ))}
              </div>
              {/* Legend */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '1rem' }}>
                {typeData.map((d, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#475569' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: d.color, display: 'inline-block' }} />
                    {d.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chart 2 — Inscriptions aux événements (donut) */}
        <div className="section-box" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <UserCheck size={16} color="#2e513a" />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>Statuts des inscriptions</h3>
          </div>

          {isLoading ? <div style={{ textAlign: 'center', padding: '3rem' }}><Spinner size={32} /></div>
          : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <DonutChart data={regDonut} size={160} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
                {regDonut.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Aucune inscription</p>
                ) : regDonut.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.82rem', color: '#475569', flex: 1 }}>{d.label}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 2 : Membership requests + Recent events ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.25rem' }}>

        {/* Chart 3 — Membership requests (horizontal bars) */}
        <div className="section-box" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Users size={16} color="#1d4ed8" />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>Demandes d'adhésion</h3>
          </div>

          {isLoading ? <div style={{ textAlign: 'center', padding: '2rem' }}><Spinner size={28} /></div>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {mbData.map((d, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 500 }}>{d.label}</span>
                    <span style={{ fontWeight: 700, color: d.color, fontSize: '0.88rem' }}>{d.value}</span>
                  </div>
                  <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', background: d.color, borderRadius: '999px',
                      width: `${maxMb > 0 ? Math.round((d.value / maxMb) * 100) : 0}%`,
                      transition: 'width 0.8s cubic-bezier(.4,0,.2,1)',
                      minWidth: d.value > 0 ? '8px' : '0'
                    }} />
                  </div>
                </div>
              ))}

              {/* Total */}
              <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Total candidats</span>
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1e293b' }}>{memberships.length}</span>
              </div>
            </div>
          )}
        </div>

        {/* Table — 5 derniers événements */}
        <div className="section-box">
          <div className="section-header" style={{ padding: '1rem 1.5rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
              <Calendar size={16} color="#C9A227" /> Derniers événements
            </h3>
            <Link to="/admin/activities" className="btn-ghost" style={{ fontSize: '0.78rem' }}>Voir tout →</Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nom</th>
                  <th style={{ padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Type</th>
                  <th style={{ padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Date</th>
                  <th style={{ padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="4" style={{ padding: '2.5rem', textAlign: 'center' }}><Spinner size={28} /></td></tr>
                ) : recentEvents.length === 0 ? (
                  <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Aucun événement</td></tr>
                ) : recentEvents.map((ev, i) => {
                  const statusCfg = {
                    PUBLISHED: { label: 'Publié',    bg: '#dcfce7', color: '#166534' },
                    DRAFT:     { label: 'Brouillon', bg: '#fef3c7', color: '#92400e' },
                    CANCELLED: { label: 'Annulé',   bg: '#fee2e2', color: '#991b1b' },
                    COMPLET:   { label: 'Complet',   bg: '#e0e7ff', color: '#3730a3' },
                  }[ev.status] || { label: ev.status, bg: '#f1f5f9', color: '#475569' };
                  const typeColor = TYPE_COLORS[Object.keys(EVENT_TYPE_LABELS).indexOf(ev.type) % TYPE_COLORS.length] || '#64748b';
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.85rem', color: '#0f172a', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ev.Event_Name}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, background: typeColor + '18', color: typeColor }}>
                          {EVENT_TYPE_LABELS[ev.type] || ev.type}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#475569' }}>
                        {ev.start_date ? new Date(ev.start_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, background: statusCfg.bg, color: statusCfg.color }}>
                          {statusCfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
