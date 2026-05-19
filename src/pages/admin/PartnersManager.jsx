import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './ActivitiesManager.css'; // Reuse CSS
import {
  Plus, Search, Image as ImageIcon, Handshake, Edit2, X, AlertCircle, RefreshCw
} from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import partnerService from '../../api/partnerService';
import useAsync from '../../hooks/useAsync';

const initialPartnerState = { id: '', name: '', website: '', is_active: true, _logoPreview: null, _logoFile: null };

// Build full media URL for images coming from the backend
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `http://localhost:8000${url}`;
};

export default function PartnersManager() {
  const [partners, setPartners] = useState([]);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentPartner, setCurrentPartner] = useState(initialPartnerState);
  const [isSaving, setIsSaving] = useState(false);

  const { execute: fetchPartners, isLoading, error } = useAsync(async () => {
    const res = await partnerService.getAll();
    return res.results || res;
  });

  const loadData = useCallback(async () => {
    try {
      const data = await fetchPartners();
      if (data) setPartners(data);
    } catch (err) { }
  }, [fetchPartners]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    return (partners || []).filter(p =>
      p.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [partners, search]);

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce partenaire ?')) {
      try {
        await partnerService.delete(id);
        loadData();
      } catch (err) {
        alert("Erreur lors de la suppression: " + (err.response?.data?.error || err.message));
      }
    }
  };

  const startEdit = (partner) => {
    setCurrentPartner({
      ...initialPartnerState,
      ...partner,
      _logoPreview: getImageUrl(partner.logo) || null
    });
    setIsEditing(true);
  };

  const startAdd = () => {
    setCurrentPartner(initialPartnerState);
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentPartner.name) {
      alert("Le nom est obligatoire.");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', currentPartner.name);
      if (currentPartner.website) formData.append('website', currentPartner.website);
      if (currentPartner.is_active !== undefined) formData.append('is_active', currentPartner.is_active);

      if (currentPartner._logoFile) {
        formData.append('logo', currentPartner._logoFile);
      }

      if (currentPartner.id) {
        await partnerService.update(currentPartner.id, formData);
      } else {
        await partnerService.create(formData);
      }

      setIsEditing(false);
      loadData();
    } catch (err) {
      alert("Erreur lors de l'enregistrement: " + (err.response?.data?.error || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    const isNew = !currentPartner.id;
    return (
      <div className="page-enter">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>
              <div className="sidebar-logo-icon" style={{ display: 'inline-flex', marginRight: '0.75rem', width: '32px', height: '32px' }}>
                <Handshake size={18} color="#2e513a" />
              </div>
              {!isNew ? 'Modifier' : 'Nouveau'} Partenaire
            </h1>
          </div>
          <button className="btn-ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>Retour</button>
        </div>

        <div className="dashboard-sections" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
          <div className="section-box" style={{ padding: '2rem' }}>
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="form-section">
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--green-800)', marginBottom: '1.25rem' }}>
                    Informations du partenaire
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label>Nom de l'entreprise/organisation *</label>
                      <input type="text" className="form-control" value={currentPartner.name}
                        onChange={e => setCurrentPartner({ ...currentPartner, name: e.target.value })}
                        required disabled={isSaving} />
                    </div>

                    <div className="form-group">
                      <label>URL du site web (Optionnel)</label>
                      <input type="url" className="form-control" value={currentPartner.website || ''} placeholder="https://..."
                        onChange={e => setCurrentPartner({ ...currentPartner, website: e.target.value })} disabled={isSaving} />
                    </div>

                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <input type="checkbox" id="isActive" checked={currentPartner.is_active}
                        onChange={e => setCurrentPartner({ ...currentPartner, is_active: e.target.checked })} disabled={isSaving}
                        style={{ width: '18px', height: '18px' }} />
                      <label htmlFor="isActive" style={{ margin: 0, cursor: 'pointer' }}>Afficher sur le site</label>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', borderTop: '1px solid var(--gray-100)', paddingTop: '2rem' }}>
                <button type="submit" className="btn-primary" style={{ padding: '0.8rem 2.5rem' }} disabled={isSaving}>
                  {isSaving ? <><Spinner size={16} color="white" /> Enregistrement...</> : 'Enregistrer'}
                </button>
                <button type="button" className="btn-ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>Annuler</button>
              </div>
            </form>
          </div>

          <div className="section-box" style={{ padding: '1.5rem', height: 'fit-content' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gray-700)', marginBottom: '1rem' }}>Logo *</h3>
            <div className="image-upload-wrapper">
              <input type="file" accept="image/*" id="partner-logo" style={{ display: 'none' }}
                disabled={isSaving}
                onChange={e => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setCurrentPartner({ ...currentPartner, _logoPreview: reader.result, _logoFile: file });
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <label htmlFor="partner-logo" className="image-upload-dropzone" style={{ height: '180px', cursor: isSaving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                {currentPartner._logoPreview ? (
                  <img src={currentPartner._logoPreview} alt="Logo" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                ) : (
                  <div className="upload-placeholder"><ImageIcon size={32} /><span style={{ fontSize: '0.85rem', marginTop: '8px' }}>Ajouter le logo</span></div>
                )}
              </label>
              <p style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', marginTop: '0.5rem' }}>Privilégiez les formats PNG avec fond transparent.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}><Handshake size={24} /> Gestion des partenaires</h1>
          <p className="text-muted">{filtered.length} partenaires répertoriés</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn-icon" onClick={loadData} title="Actualiser" disabled={isLoading}>
            <RefreshCw size={18} className={isLoading ? 'spin' : ''} />
          </button>
          <button className="btn-primary" onClick={startAdd} style={{ height: '44px' }}><Plus size={18} /> Ajouter partenaire</button>
        </div>
      </div>

      {isLoading && partners.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <Spinner size={40} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {filtered.map(p => (
            <div key={p.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '140px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                {p.logo ? (
                  <img src={getImageUrl(p.logo)} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <ImageIcon size={40} color="#cbd5e1" />
                )}
              </div>
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: '#1e293b' }}>{p.name}</h3>
                <a href={p.website || '#'} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#3b82f6', textDecoration: 'none', marginBottom: '1rem', wordBreak: 'break-all' }}>
                  {p.website || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Aucun lien</span>}
                </a>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: p.is_active ? '#166534' : '#64748b', background: p.is_active ? '#dcfce7' : '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    {p.is_active ? 'Visible' : 'Masqué'}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => startEdit(p)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.25rem' }}><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}><X size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
