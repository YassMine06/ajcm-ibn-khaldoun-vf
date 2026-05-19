import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import './ActivitiesManager.css';
import {
  Plus, Search, Image as ImageIcon, X, Clock,
  Edit2, Calendar, MapPin, AlertCircle, RefreshCw
} from 'lucide-react';
import AdminCard from '../../components/common/AdminCard';
import TimePicker from '../../components/common/TimePicker';
import Spinner from '../../components/common/Spinner';
import eventService from '../../api/eventService';

const initialEventState = {
  id: '', Event_Name: '', type: 'EVENEMENT', Duration: '02:00:00', Cost: '0',
  Volunteers: '0', description: '', start_date: '', end_date: '',
  start_time: '', location: '', city: '', max_places: '0',
  status: 'PUBLISHED', guests: '', _posterPreview: null, _posterFile: null
};

const TYPE_CHOICES = [
  { value: 'CULTURE',     label: 'Culture' },
  { value: 'JEUNESSE',    label: 'Jeunesse' },
  { value: 'FORMATION',   label: 'Formation' },
  { value: 'EVENEMENT',   label: 'Événement' },
  { value: 'ART',         label: 'Art' },
  { value: 'SPORT',       label: 'Sport' },
  { value: 'SOLIDARITE',  label: 'Solidarité' },
  { value: 'SANTE',       label: 'Santé' },
  { value: 'CITOYENNETE', label: 'Citoyenneté' },
  { value: 'AUTRE',       label: 'Autre' },
];

// Full URL for Django media files
const MEDIA_BASE = 'http://localhost:8000';
const mediaUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  // Handle paths with or without leading slash
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${MEDIA_BASE}${path}`;
};

// Resolve the best poster URL from an event object
// Priority: poster_url (full URL from model property) > poster (field path) > first gallery image
const getPosterUrl = (event) => {
  if (!event) return null;
  if (event.poster_url) return mediaUrl(event.poster_url);
  if (event.poster)     return mediaUrl(event.poster);
  // Fallback: first image in gallery (many events store poster as gallery image order=0)
  const firstImg = event.images?.find(img => img.order === 0) || event.images?.[0];
  if (firstImg?.image) return mediaUrl(firstImg.image);
  return null;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  if (dateStr.includes('T')) return dateStr.split('T')[0];
  return dateStr;
};

export default function ActivitiesManager() {
  const location = useLocation();
  const [events, setEvents]       = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(initialEventState);
  const [isSaving, setIsSaving]   = useState(false);
  const [dateError, setDateError]  = useState('');

  /* ── Charger les événements ── */
  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await eventService.getAll();
      setEvents(res.results || res || []);
    } catch (err) {
      setError('Impossible de charger les événements.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (location.state?.openForm) {
      startAdd();
      window.history.replaceState({}, document.title);
    }
  }, []); // ← dépendances vides : chargement une seule fois

  const filtered = useMemo(() =>
    (events || []).filter(e =>
      e.Event_Name?.toLowerCase().includes(search.toLowerCase()) ||
      e.location?.toLowerCase().includes(search.toLowerCase()) ||
      e.city?.toLowerCase().includes(search.toLowerCase())
    ), [events, search]);

  /* ── Validation dates/heures en temps réel ── */
  const validateDates = (start_date, end_date, start_time, end_time) => {
    if (!start_date) return '';
    if (end_date && end_date < start_date) {
      return '❌ La date de fin ne peut pas être antérieure à la date de début.';
    }
    if (end_date && end_date === start_date && start_time && end_time && end_time <= start_time) {
      return '❌ L\'heure de fin doit être après l\'heure de début pour un événement sur la même journée.';
    }
    return '';
  };

  /* ── Modification avec validation ── */
  const updateEvent = (field, value) => {
    const updated = { ...currentEvent, [field]: value };
    setCurrentEvent(updated);
    const err = validateDates(updated.start_date, updated.end_date, updated.start_time, updated.end_time);
    setDateError(err);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet événement ?')) return;
    try {
      await eventService.delete(id);
      loadData();
    } catch (err) {
      alert('Erreur lors de la suppression: ' + (err.message || 'Erreur serveur'));
    }
  };

  const startAdd = () => {
    setCurrentEvent(initialEventState);
    setIsEditing(true);
  };

  const startEdit = (event) => {
    setCurrentEvent({
      ...initialEventState,
      ...event,
      start_date: formatDate(event.start_date),
      end_date: formatDate(event.end_date),
      _posterPreview: getPosterUrl(event),
      _posterFile: null,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      // Champs texte
      if (currentEvent.Event_Name) formData.append('Event_Name', currentEvent.Event_Name.trim());
      if (currentEvent.type)       formData.append('type', currentEvent.type);
      if (currentEvent.Duration)   formData.append('Duration', currentEvent.Duration);
      if (currentEvent.Cost !== undefined) formData.append('Cost', currentEvent.Cost);
      if (currentEvent.Volunteers !== undefined) formData.append('Volunteers', currentEvent.Volunteers);
      if (currentEvent.description) formData.append('description', currentEvent.description);
      if (currentEvent.start_date)  formData.append('start_date', currentEvent.start_date);
      if (currentEvent.end_date)    formData.append('end_date',   currentEvent.end_date);
      if (currentEvent.start_time)  formData.append('start_time', currentEvent.start_time);
      if (currentEvent.location)    formData.append('location',   currentEvent.location);
      if (currentEvent.city)        formData.append('city',       currentEvent.city);
      if (currentEvent.max_places !== undefined) formData.append('max_places', currentEvent.max_places);
      if (currentEvent.status)      formData.append('status',     currentEvent.status);
      if (currentEvent.guests)      formData.append('guests',     currentEvent.guests);
      // Poster (image)
      if (currentEvent._posterFile) formData.append('poster', currentEvent._posterFile);

      if (currentEvent.id) {
        await eventService.update(currentEvent.id, formData);
      } else {
        await eventService.create(formData);
      }
      await loadData();
      setIsEditing(false);
      setCurrentEvent(initialEventState);
    } catch (err) {
      const detail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      alert('Erreur lors de la sauvegarde: ' + detail);
    } finally {
      setIsSaving(false);
    }
  };

  /* ── FORMULAIRE ── */
  if (isEditing) {
    return (
      <div className="page-enter">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="page-title">{currentEvent.id ? 'Modifier' : 'Ajouter'} un événement</h1>
          <button className="btn-ghost" onClick={() => { setIsEditing(false); setCurrentEvent(initialEventState); }}>
            <X size={18} /> Annuler
          </button>
        </div>

        <div className="table-container" style={{ padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

            {/* Poster upload */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Poster de l'événement</label>
              <div style={{
                border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '2rem',
                textAlign: 'center', cursor: 'pointer', position: 'relative',
                background: '#f8fafc', overflow: 'hidden', minHeight: '180px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
                onClick={() => document.getElementById('poster-input').click()}
              >
                {currentEvent._posterPreview ? (
                  <img src={currentEvent._posterPreview} alt="preview"
                    style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }} />
                ) : (
                  <div style={{ color: '#94a3b8' }}>
                    <ImageIcon size={40} style={{ marginBottom: '0.5rem' }} />
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Cliquez pour ajouter une image</p>
                  </div>
                )}
                <input id="poster-input" type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onloadend = () => setCurrentEvent(prev => ({ ...prev, _posterFile: file, _posterPreview: reader.result }));
                    reader.readAsDataURL(file);
                  }} />
              </div>
            </div>

            {/* Champs */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Nom de l'événement *</label>
              <input className="form-control" value={currentEvent.Event_Name} onChange={e => setCurrentEvent(p => ({ ...p, Event_Name: e.target.value }))} placeholder="Titre de l'événement" />
            </div>
            <div>
              <label className="form-label">Type</label>
              <select className="form-control" value={currentEvent.type} onChange={e => setCurrentEvent(p => ({ ...p, type: e.target.value }))}>
                {TYPE_CHOICES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Statut</label>
              <select className="form-control" value={currentEvent.status} onChange={e => setCurrentEvent(p => ({ ...p, status: e.target.value }))}>
                <option value="PUBLISHED">Publié</option>
                <option value="DRAFT">Brouillon</option>
                <option value="CANCELLED">Annulé</option>
              </select>
            </div>
            {/* ── Dates & Heures ── */}
            <div style={{ gridColumn: '1 / -1', background: '#f8fafc', borderRadius: '10px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: '0 0 1rem 0', fontWeight: 700, fontSize: '0.88rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={14} color="#C9A227" /> Dates &amp; Horaires
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Date de début *</label>
                  <input type="date" className="form-control"
                    value={currentEvent.start_date}
                    onChange={e => updateEvent('start_date', e.target.value)}
                    style={{ borderColor: dateError ? '#fca5a5' : undefined }} />
                </div>
                <div>
                  <label className="form-label">Heure de début</label>
                  <input type="time" className="form-control"
                    value={currentEvent.start_time || ''}
                    onChange={e => updateEvent('start_time', e.target.value)}
                    style={{ borderColor: dateError ? '#fca5a5' : undefined }} />
                </div>
                <div>
                  <label className="form-label">Date de fin</label>
                  <input type="date" className="form-control"
                    value={currentEvent.end_date}
                    min={currentEvent.start_date || undefined}
                    onChange={e => updateEvent('end_date', e.target.value)}
                    style={{ borderColor: dateError ? '#fca5a5' : undefined }} />
                </div>
                <div>
                  <label className="form-label">Heure de fin</label>
                  <input type="time" className="form-control"
                    value={currentEvent.end_time || ''}
                    onChange={e => updateEvent('end_time', e.target.value)}
                    style={{ borderColor: dateError ? '#fca5a5' : undefined }} />
                </div>
              </div>
              {/* Erreur inline dates */}
              {dateError && (
                <div style={{
                  marginTop: '0.75rem', padding: '0.65rem 1rem',
                  background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: '8px', color: '#dc2626',
                  fontSize: '0.85rem', fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  {dateError}
                </div>
              )}
            </div>

            <div>
              <label className="form-label"><MapPin size={14} /> Lieu</label>
              <input className="form-control" value={currentEvent.location} onChange={e => updateEvent('location', e.target.value)} placeholder="Ex: Salle Ibn Khaldoun" />
            </div>
            <div>
              <label className="form-label">Ville</label>
              <input className="form-control" value={currentEvent.city} onChange={e => updateEvent('city', e.target.value)} placeholder="Ex: Mohammedia" />
            </div>
            <div>
              <label className="form-label">Places max</label>
              <input type="number" className="form-control" value={currentEvent.max_places} onChange={e => setCurrentEvent(p => ({ ...p, max_places: e.target.value }))} min="0" />
            </div>
            <div>
              <label className="form-label">Coût (MAD)</label>
              <input type="number" className="form-control" value={currentEvent.Cost} onChange={e => setCurrentEvent(p => ({ ...p, Cost: e.target.value }))} min="0" step="0.01" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={4} value={currentEvent.description} onChange={e => setCurrentEvent(p => ({ ...p, description: e.target.value }))} placeholder="Description de l'événement..." />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label"><Edit2 size={14} /> Invités / Intervenants</label>
              <input className="form-control" value={currentEvent.guests} onChange={e => setCurrentEvent(p => ({ ...p, guests: e.target.value }))} placeholder="Noms des intervenants séparés par des virgules" />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
            <button className="btn-ghost" onClick={() => { setIsEditing(false); setCurrentEvent(initialEventState); setDateError(''); }}>Annuler</button>
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={isSaving || !currentEvent.Event_Name || !!dateError}
              title={dateError || ''}
            >
              {isSaving ? <Spinner size={18} color="white" /> : null}
              {isSaving ? 'Sauvegarde...' : (currentEvent.id ? 'Mettre à jour' : 'Créer l\'événement')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── LISTE ── */
  return (
    <div className="page-enter">
      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>
            <Calendar size={24} color="#C9A227" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
            Gestion des événements
          </h1>
          <p className="text-muted">{filtered.length} événements répertoriés</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn-icon" onClick={loadData} title="Actualiser" disabled={isLoading}>
            <RefreshCw size={18} className={isLoading ? 'spin' : ''} />
          </button>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', top: '50%', left: '0.85rem', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="text" className="form-control" placeholder="Rechercher..." style={{ paddingLeft: '2.5rem', width: '260px', height: '42px' }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={startAdd} style={{ height: '42px' }}>
            <Plus size={18} /> Ajouter
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

      {/* Grille */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}><Spinner size={44} /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          <Calendar size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <p style={{ fontSize: '1rem' }}>Aucun événement trouvé.</p>
          <button className="btn-primary" onClick={startAdd} style={{ marginTop: '1rem' }}><Plus size={16} /> Créer un événement</button>
        </div>
      ) : (
        <div className="events-grid">
          {filtered.map(event => (
            <AdminCard
              key={event.id}
              title={event.Event_Name}
              date={event.start_date ? new Date(event.start_date).toLocaleDateString('fr-FR') : ''}
              location={[event.location, event.city].filter(Boolean).join(', ')}
              image={getPosterUrl(event)}
              type={event.type}
              onEdit={() => startEdit(event)}
              onDelete={() => handleDelete(event.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
