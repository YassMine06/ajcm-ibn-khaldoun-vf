import React, { useState, useEffect } from 'react';
import {
  Mail, RefreshCw, AlertCircle, Eye, EyeOff,
  MessageSquare, CheckCircle, Archive, Search
} from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import axios from 'axios';

const STATUS_CONFIG = {
  UNREAD:   { label: 'Non lu',   bg: '#fee2e2', color: '#dc2626', border: '#fecaca' },
  READ:     { label: 'Lu',       bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  REPLIED:  { label: 'Répondu', bg: '#dcfce7', color: '#166534', border: '#bbf7d0' },
  ARCHIVED: { label: 'Archivé', bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' },
};

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('adminToken')}`
});

export default function ContactManager() {
  const [messages, setMessages]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('ALL');
  const [expanded, setExpanded]   = useState(null); // id of expanded message

  const loadMessages = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:8000/api/contact/messages/', {
        headers: getAuthHeader()
      });
      const data = res.data.results || res.data;
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Impossible de charger les messages de contact.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadMessages(); }, []);

  const markAs = async (id, action) => {
    try {
      if (action === 'read') {
        await axios.post(`http://localhost:8000/api/contact/messages/${id}/mark_as_read/`, {}, {
          headers: getAuthHeader()
        });
      } else if (action === 'archived') {
        await axios.patch(`http://localhost:8000/api/contact/messages/${id}/`, { status: 'ARCHIVED' }, {
          headers: getAuthHeader()
        });
      }
      setMessages(prev => prev.map(m => {
        if (m.id !== id) return m;
        return { ...m, status: action === 'read' ? 'READ' : 'ARCHIVED' };
      }));
    } catch (err) {
      alert('Erreur: ' + (err.response?.data?.detail || err.message));
    }
  };

  const filtered = messages.filter(m => {
    const matchFilter = filter === 'ALL' || m.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.subject?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const unreadCount = messages.filter(m => m.status === 'UNREAD').length;

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Mail size={24} color="#C9A227" /> Messages de Contact
          </h1>
          <p className="text-muted">
            {filtered.length} message(s)
            {unreadCount > 0 && (
              <span style={{ marginLeft: '0.75rem', background: '#fee2e2', color: '#dc2626', padding: '2px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700 }}>
                {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn-icon" onClick={loadMessages} disabled={isLoading} title="Actualiser">
            <RefreshCw size={18} className={isLoading ? 'spin' : ''} />
          </button>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher..."
              style={{ paddingLeft: '2.2rem', width: '220px', height: '40px' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['ALL', 'UNREAD', 'READ', 'REPLIED', 'ARCHIVED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.35rem 1rem', borderRadius: '999px', border: '1px solid',
              fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              background: filter === f ? '#1e293b' : 'white',
              color:      filter === f ? 'white'    : '#64748b',
              borderColor: filter === f ? '#1e293b' : '#e2e8f0',
            }}
          >
            {f === 'ALL' ? 'Tous' : STATUS_CONFIG[f]?.label || f}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
          <AlertCircle size={18} /> {error}
          <button onClick={loadMessages} style={{ marginLeft: 'auto', background: 'none', border: '1px solid #fca5a5', padding: '0.25rem 0.75rem', borderRadius: '6px', color: '#dc2626', cursor: 'pointer' }}>Réessayer</button>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}><Spinner size={42} /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8', background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <MessageSquare size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p>Aucun message trouvé.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(msg => {
            const st = STATUS_CONFIG[msg.status] || STATUS_CONFIG.READ;
            const isOpen = expanded === msg.id;
            return (
              <div
                key={msg.id}
                style={{
                  background: 'white', borderRadius: '12px',
                  border: `1px solid ${msg.status === 'UNREAD' ? '#fecaca' : '#e2e8f0'}`,
                  boxShadow: msg.status === 'UNREAD' ? '0 0 0 2px #fee2e2' : '0 1px 3px rgba(0,0,0,0.06)',
                  overflow: 'hidden', transition: 'box-shadow 0.2s',
                }}
              >
                {/* Row header */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => {
                    setExpanded(isOpen ? null : msg.id);
                    if (msg.status === 'UNREAD') markAs(msg.id, 'read');
                  }}
                >
                  {/* Unread dot */}
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, background: msg.status === 'UNREAD' ? '#dc2626' : 'transparent', border: msg.status !== 'UNREAD' ? '2px solid #cbd5e1' : 'none' }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: msg.status === 'UNREAD' ? 700 : 600, color: '#1e293b', fontSize: '0.95rem' }}>
                        {msg.name}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{msg.email}</span>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
                        background: st.bg, color: st.color, border: `1px solid ${st.border}`
                      }}>
                        {st.label}
                      </span>
                    </div>
                    <div style={{ color: '#475569', fontSize: '0.88rem', marginTop: '0.2rem', fontWeight: msg.status === 'UNREAD' ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {msg.subject}
                    </div>
                  </div>

                  <div style={{ flexShrink: 0, color: '#94a3b8', fontSize: '0.78rem', textAlign: 'right' }}>
                    {msg.created_at ? new Date(msg.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>

                  <div style={{ color: '#94a3b8', flexShrink: 0 }}>
                    {isOpen ? <EyeOff size={16} /> : <Eye size={16} />}
                  </div>
                </div>

                {/* Expanded body */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid #f1f5f9', padding: '1.25rem 1.5rem', background: '#f8fafc' }}>
                    <p style={{ color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{msg.message}</p>

                    <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem' }}>
                      {msg.status !== 'ARCHIVED' && (
                        <button
                          onClick={() => markAs(msg.id, 'archived')}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.9rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 500 }}
                        >
                          <Archive size={14} /> Archiver
                        </button>
                      )}
                      <a
                        href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.9rem', background: '#2e513a', color: 'white', borderRadius: '8px', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 500 }}
                      >
                        <CheckCircle size={14} /> Répondre par email
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
