import React, { useState, useEffect, useMemo } from 'react';
import './ActivitiesManager.css';
import {
  Plus, Search, Image as ImageIcon, Edit2, X,
  AlertCircle, RefreshCw, Megaphone, Trash2, Calendar
} from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import annonceService from '../../api/annonceService';

const initialAnnonce = {
  id: '', title: '', content: '', type: 'NEWS', is_active: true, is_featured: false,
  _imagePreview: null, _imageFile: null
};

const mediaUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `http://localhost:8000${url}`;
};

const TYPE_COLORS = {
  NEWS:        { bg: '#dbeafe', text: '#1e40af', label: 'Actualité'    },
  EVENT:       { bg: '#dcfce7', text: '#15803d', label: 'Événement'    },
  ALERT:       { bg: '#fee2e2', text: '#b91c1c', label: 'Alerte'       },
  PROMO:       { bg: '#fef9ec', text: '#92400e', label: 'Promotion'    },
  INFO:        { bg: '#f1f5f9', text: '#475569', label: 'Information'  },
  // Compatibilité anciens enregistrements
  ACTUALITE:   { bg: '#dbeafe', text: '#1e40af', label: 'Actualité'    },
  EVENEMENT:   { bg: '#dcfce7', text: '#15803d', label: 'Événement'    },
  URGENT:      { bg: '#fee2e2', text: '#b91c1c', label: 'Urgent'       },
};

const STATUS_LABELS = {
  active:   { bg: '#dcfce7', text: '#15803d', label: 'Actif'    },
  inactive: { bg: '#f1f5f9', text: '#64748b', label: 'Inactif'  },
  featured: { bg: '#fef9ec', text: '#92400e', label: 'À la une' },
};

export default function AnnoncesManager() {
  const [annonces, setAnnonces]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent]     = useState(initialAnnonce);
  const [isSaving, setIsSaving]   = useState(false);

  /* ── Chargement ── */
  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await annonceService.getAll();
      setAnnonces(res.results || res || []);
    } catch {
      setError('Impossible de charger les annonces.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(() =>
    (annonces || []).filter(a =>
      a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.content?.toLowerCase().includes(search.toLowerCase())
    ), [annonces, search]);

  /* ── CRUD ── */
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette annonce ?')) return;
    try { await annonceService.delete(id); loadData(); }
    catch (err) { alert('Erreur: ' + (err.message || 'Erreur serveur')); }
  };

  const startEdit = (a) => {
    setCurrent({ ...initialAnnonce, ...a, _imagePreview: mediaUrl(a.image) || null, _imageFile: null });
    setIsEditing(true);
  };

  const startAdd = () => { setCurrent(initialAnnonce); setIsEditing(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append('title',       current.title);
      fd.append('content',     current.content);
      fd.append('type',        current.type);
      fd.append('is_active',   current.is_active  ? 'true' : 'false');
      fd.append('is_featured', current.is_featured ? 'true' : 'false');
      if (current._imageFile) fd.append('image', current._imageFile);

      if (current.id) await annonceService.update(current.id, fd);
      else            await annonceService.create(fd);

      setIsEditing(false);
      setCurrent(initialAnnonce);
      loadData();
    } catch (err) {
      alert("Erreur: " + (err.response?.data ? JSON.stringify(err.response.data) : err.message));
    } finally {
      setIsSaving(false);
    }
  };

  /* ════════ FORMULAIRE ════════ */
  if (isEditing) {
    return (
      <div className="page-enter">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="page-title">
            <Megaphone size={22} color="#C9A227" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
            {current.id ? 'Modifier' : 'Nouvelle'} annonce
          </h1>
          <button className="btn-ghost" onClick={() => { setIsEditing(false); setCurrent(initialAnnonce); }}>
            <X size={18} /> Annuler
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>

            {/* Colonne principale */}
            <div className="table-container" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="form-label">Titre *</label>
                  <input className="form-control" required value={current.title}
                    onChange={e => setCurrent(p => ({ ...p, title: e.target.value }))} placeholder="Titre de l'annonce" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Type</label>
                    <select className="form-control" value={current.type} onChange={e => setCurrent(p => ({ ...p, type: e.target.value }))}>
                      <option value="NEWS">Actualité</option>
                      <option value="EVENT">Événement</option>
                      <option value="ALERT">Alerte</option>
                      <option value="PROMO">Promotion</option>
                      <option value="INFO">Information</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', padding: '0.65rem 0.9rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <input type="checkbox" checked={!!current.is_active}
                        onChange={e => setCurrent(p => ({ ...p, is_active: e.target.checked }))}
                        style={{ width: '16px', height: '16px', accentColor: '#2e513a', cursor: 'pointer' }} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#374151' }}>Publier l'annonce (visible sur le site)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', padding: '0.65rem 0.9rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <input type="checkbox" checked={!!current.is_featured}
                        onChange={e => setCurrent(p => ({ ...p, is_featured: e.target.checked }))}
                        style={{ width: '16px', height: '16px', accentColor: '#C9A227', cursor: 'pointer' }} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#374151' }}>⭐ Mettre à la une</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="form-label">Contenu *</label>
                  <textarea className="form-control" rows={7} required value={current.content}
                    onChange={e => setCurrent(p => ({ ...p, content: e.target.value }))} placeholder="Contenu de l'annonce..." />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-ghost" onClick={() => { setIsEditing(false); setCurrent(initialAnnonce); }}>Annuler</button>
                <button type="submit" className="btn-primary" style={{ background: '#C9A227' }} disabled={isSaving}>
                  {isSaving ? <Spinner size={16} color="white" /> : null}
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>

            {/* Colonne image */}
            <div className="table-container" style={{ padding: '1.5rem' }}>
              <label className="form-label">Image de l'annonce</label>
              <input type="file" accept="image/*" id="annonce-img" style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () => setCurrent(p => ({ ...p, _imageFile: file, _imagePreview: reader.result }));
                  reader.readAsDataURL(file);
                }} />
              <label htmlFor="annonce-img" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '220px', border: '2px dashed #cbd5e1', borderRadius: '10px',
                cursor: 'pointer', background: '#f8fafc', overflow: 'hidden', transition: 'border-color 0.2s'
              }}>
                {current._imagePreview ? (
                  <img src={current._imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                    <ImageIcon size={36} style={{ marginBottom: '0.5rem' }} />
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>Cliquez pour ajouter</p>
                  </div>
                )}
              </label>
              {current._imagePreview && (
                <button type="button" onClick={() => setCurrent(p => ({ ...p, _imagePreview: null, _imageFile: null }))}
                  style={{ width: '100%', marginTop: '0.75rem', padding: '0.4rem', background: 'none', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                  Supprimer l'image
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    );
  }

  /* ════════ LISTE ════════ */
  return (
    <div className="page-enter">
      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>
            <Megaphone size={24} color="#C9A227" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
            Gestion des annonces
          </h1>
          <p className="text-muted">{filtered.length} annonces répertoriées</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn-icon" onClick={loadData} title="Actualiser" disabled={isLoading}>
            <RefreshCw size={18} className={isLoading ? 'spin' : ''} />
          </button>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', top: '50%', left: '0.85rem', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="text" className="form-control" placeholder="Rechercher..." style={{ paddingLeft: '2.5rem', width: '260px', height: '42px' }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={startAdd} style={{ height: '42px', background: '#C9A227' }}>
            <Plus size={18} /> Nouvelle annonce
          </button>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
          <AlertCircle size={20} /><span>{error}</span>
          <button onClick={loadData} style={{ marginLeft: 'auto', background: 'none', border: '1px solid #fca5a5', padding: '0.25rem 0.75rem', borderRadius: '6px', color: '#dc2626', cursor: 'pointer' }}>Réessayer</button>
        </div>
      )}

      {/* Contenu */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}><Spinner size={44} /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          <Megaphone size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p>Aucune annonce trouvée.</p>
          <button className="btn-primary" onClick={startAdd} style={{ marginTop: '1rem', background: '#C9A227' }}>
            <Plus size={16} /> Créer une annonce
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filtered.map(annonce => {
            const tc = TYPE_COLORS[annonce.type] || TYPE_COLORS.NEWS;
            return (
              <div key={annonce.id} style={{
                background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0',
                overflow: 'hidden', display: 'flex', flexDirection: 'column',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s',
              }}>
                {/* Image */}
                <div style={{ height: '180px', background: '#f8fafc', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                  {annonce.image ? (
                    <img src={mediaUrl(annonce.image)} alt={annonce.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.5rem', color: '#cbd5e1' }}>
                      <ImageIcon size={36} />
                      <span style={{ fontSize: '0.75rem' }}>Sans image</span>
                    </div>
                  )}
                  {/* Badge type */}
                  <span style={{
                    position: 'absolute', top: '0.75rem', left: '0.75rem',
                    background: tc.bg, color: tc.text,
                    fontSize: '0.65rem', fontWeight: 800, padding: '3px 10px', borderRadius: 99,
                    textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>{tc.label}</span>
                </div>

                {/* Contenu */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.3,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {annonce.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {annonce.content}
                  </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                        <Calendar size={12} />
                        {annonce.created_at ? new Date(annonce.created_at).toLocaleDateString('fr-FR') : '—'}
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {annonce.is_featured && (
                          <span style={{ background: '#fef9ec', color: '#92400e', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>⭐ Une</span>
                        )}
                        <span style={{
                          background: annonce.is_active !== false ? '#dcfce7' : '#f1f5f9',
                          color:      annonce.is_active !== false ? '#15803d' : '#64748b',
                          fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99
                        }}>
                          {annonce.is_active !== false ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <button onClick={() => startEdit(annonce)} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                      padding: '0.5rem', background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px',
                      color: '#475569', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
                    }}>
                      <Edit2 size={13} /> Modifier
                    </button>
                    <button onClick={() => handleDelete(annonce.id)} style={{
                      width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'none', border: '1px solid #fecaca', borderRadius: '8px',
                      color: '#ef4444', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0
                    }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
