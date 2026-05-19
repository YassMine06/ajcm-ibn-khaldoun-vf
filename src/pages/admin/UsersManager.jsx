import React, { useState, useMemo, useEffect, useCallback } from 'react';
import './UsersManager.css';
import {
  Plus, Edit2, Trash2, Users, Search, UserCheck,
  Mail, Phone, Calendar, ShieldCheck, Camera, CreditCard, Award,
  Cake, AlertCircle, RefreshCw
} from 'lucide-react';
import userService from '../../api/userService';
import useAsync from '../../hooks/useAsync';
import Spinner from '../../components/common/Spinner';

const initialMember = {
  id: '', first_name: '', last_name: '', birth_date: '', email: '', password: '', phone: '',
  cin: '', address: '', role: 'MEMBER_STANDARD', is_active: true, _photoPreview: null, _photoFile: null
};

// Build full media URL for images coming from the backend
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `http://localhost:8000${url}`;
};

export default function UsersManager() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentMember, setCurrentMember] = useState(initialMember);
  const [activeTab, setActiveTab] = useState('all');
  const [isSaving, setIsSaving] = useState(false);

  const { execute: fetchUsers, isLoading, error } = useAsync(async () => {
    const res = await userService.getAll();
    return res.results || res;
  });

  const loadData = useCallback(async () => {
    try {
      const data = await fetchUsers();
      if (data) setMembers(data);
    } catch (err) { }
  }, [fetchUsers]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const calculateAge = (birthDate) => {
    if (!birthDate) return '--';
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const filtered = useMemo(() => {
    return (members || []).filter(m => {
      const term = search.toLowerCase();
      const matchesSearch =
        m.first_name?.toLowerCase().includes(term) ||
        m.last_name?.toLowerCase().includes(term) ||
        m.email?.toLowerCase().includes(term) ||
        m.cin?.toLowerCase().includes(term);

      if (activeTab === 'all') return matchesSearch;
      return matchesSearch && m.role === activeTab;
    });
  }, [members, search, activeTab]);

  const stats = useMemo(() => ({
    total: members.length,
    bureau: members.filter(m => m.role === 'MEMBER_BUREAU').length,
    membres: members.filter(m => m.role === 'MEMBER_STANDARD').length,
  }), [members]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      Object.keys(currentMember).forEach(key => {
        if (!key.startsWith('_') && currentMember[key] !== null) {
          if (key === 'photo' && typeof currentMember[key] === 'string') return; // skip if URL
          if (key === 'password' && !currentMember.password && currentMember.id) return; // skip if editing and password empty
          formData.append(key, currentMember[key]);
        }
      });

      if (currentMember._photoFile) {
        formData.append('photo', currentMember._photoFile);
      }

      if (currentMember.id) {
        await userService.update(currentMember.id, formData);
      } else {
        await userService.create(formData);
      }
      setIsEditing(false);
      loadData();
    } catch (err) {
      alert("Erreur lors de l'enregistrement: " + (err.response?.data?.error || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
      try {
        await userService.delete(id);
        loadData();
      } catch (err) {
        alert("Erreur lors de la suppression: " + (err.response?.data?.error || err.message));
      }
    }
  };

  const startAdd = () => {
    setCurrentMember(initialMember);
    setIsEditing(true);
  };

  const startEdit = (m) => {
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      if (dateStr.includes('T')) return dateStr.split('T')[0];
      return dateStr;
    };

    setCurrentMember({
      ...initialMember,
      ...m,
      birth_date: formatDate(m.birth_date),
      _photoPreview: getImageUrl(m.photo || m.avatar) || null,
      password: '' // Don't fill password when editing
    });
    setIsEditing(true);
  };

  if (isEditing) {
    const isNew = !currentMember.id;
    return (
      <div className="members-page page-enter">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--saas-text-main)', margin: 0 }}>
              {!isNew ? 'Modifier' : 'Nouveau'} Membre
            </h1>
            <p style={{ color: 'var(--saas-text-muted)' }}>Remplissez les informations détaillées ci-dessous.</p>
          </div>
          <button className="btn-ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>Annuler</button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          <div className="data-table-container" style={{ padding: '2rem', textAlign: 'center', height: 'fit-content' }}>
            <div
              style={{
                width: '120px', height: '120px', borderRadius: '50%',
                backgroundColor: '#F3F4F6', margin: '0 auto 1.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px dashed #E2E8F0', position: 'relative',
                overflow: 'hidden', cursor: isSaving ? 'not-allowed' : 'pointer'
              }}
              onClick={() => !isSaving && document.getElementById('photo-upload').click()}
            >
              {currentMember._photoPreview ? (
                <img src={currentMember._photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Camera size={32} color="#94A3B8" />
              )}
              <div style={{ position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '0.65rem', padding: '4px 0' }}>
                Changer
              </div>
            </div>
            <input id="photo-upload" type="file" accept="image/*" style={{ display: 'none' }} disabled={isSaving} onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setCurrentMember({ ...currentMember, _photoPreview: reader.result, _photoFile: file });
                reader.readAsDataURL(file);
              }
            }}
            />
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', textAlign: 'left' }}>Type de membre</label>
            <select className="search-input" disabled={isSaving} value={currentMember.role} onChange={e => setCurrentMember({ ...currentMember, role: e.target.value })} style={{ marginBottom: '1.5rem' }}>
              <option value="MEMBER_STANDARD">Membre Standard</option>
              <option value="MEMBER_BUREAU">Membre de Bureau</option>
            </select>
            <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '10px', fontSize: '0.8rem', color: '#64748B', textAlign: 'left' }}>
              <ShieldCheck size={14} style={{ marginRight: '0.5rem' }} />
              Le rôle "Bureau" donne accès à certains privilèges internes.
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2rem', justifyContent: 'center' }}>
              <input type="checkbox" id="isActive" checked={currentMember.is_active}
                onChange={e => setCurrentMember({ ...currentMember, is_active: e.target.checked })} disabled={isSaving}
                style={{ width: '18px', height: '18px' }} />
              <label htmlFor="isActive" style={{ margin: 0, cursor: 'pointer', fontWeight: 600 }}>Compte Actif</label>
            </div>
          </div>

          <div className="data-table-container" style={{ padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Prénom *</label>
                <input required type="text" className="search-input" disabled={isSaving} value={currentMember.first_name} onChange={e => setCurrentMember({ ...currentMember, first_name: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Nom *</label>
                <input required type="text" className="search-input" disabled={isSaving} value={currentMember.last_name} onChange={e => setCurrentMember({ ...currentMember, last_name: e.target.value })} />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Email *</label>
                <input required type="email" className="search-input" disabled={isSaving} value={currentMember.email} onChange={e => setCurrentMember({ ...currentMember, email: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Téléphone</label>
                <input type="text" className="search-input" disabled={isSaving} value={currentMember.phone || ''} onChange={e => setCurrentMember({ ...currentMember, phone: e.target.value })} />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Date de naissance</label>
                <input type="date" className="search-input" disabled={isSaving} value={currentMember.birth_date} onChange={e => setCurrentMember({ ...currentMember, birth_date: e.target.value })} />
                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--saas-text-muted)' }}>Âge : {calculateAge(currentMember.birth_date)} ans</p>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>CIN</label>
                <input type="text" className="search-input" disabled={isSaving} value={currentMember.cin || ''} onChange={e => setCurrentMember({ ...currentMember, cin: e.target.value })} />
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Adresse</label>
                <textarea className="search-input" style={{ minHeight: '80px' }} disabled={isSaving} value={currentMember.address || ''} onChange={e => setCurrentMember({ ...currentMember, address: e.target.value })} />
              </div>

              <div style={{ gridColumn: '1/-1', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Mot de passe {isNew ? '*' : '(laisser vide pour ne pas changer)'}</label>
                <input type={isNew ? 'text' : 'password'} required={isNew} placeholder={isNew ? "Définir un mot de passe" : "••••••••"} disabled={isSaving} className="search-input" value={currentMember.password || ''} onChange={e => setCurrentMember({ ...currentMember, password: e.target.value })} />
              </div>
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button type="button" className="btn-ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>Annuler</button>
              <button type="submit" className="btn-primary" disabled={isSaving} style={{ border: 'none', borderRadius: '10px', padding: '0.75rem 2rem' }}>
                {isSaving ? <><Spinner size={16} color="white" /> Enregistrement...</> : 'Enregistrer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="members-page page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--saas-text-main)', margin: 0 }}>Membres AJCM</h1>
          <p style={{ color: 'var(--saas-text-muted)', margin: '0.25rem 0 0 0' }}>Gestion de la communauté et des accès.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-icon" onClick={loadData} title="Actualiser" disabled={isLoading}>
            <RefreshCw size={18} className={isLoading ? 'spin' : ''} />
          </button>
          <button className="btn-primary" onClick={startAdd} style={{ border: 'none', borderRadius: '10px', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <Plus size={18} /> Ajouter un membre
          </button>
        </div>
      </div>

      <div className="stats-row">
        {[{ tab: 'all', label: 'Total', count: stats.total, icon: Users, color: '#6366F1', bg: '#EEF2FF' },
        { tab: 'MEMBER_BUREAU', label: 'Bureau', count: stats.bureau, icon: Award, color: '#D97706', bg: '#FEF3C7' },
        { tab: 'MEMBER_STANDARD', label: 'Membres', count: stats.membres, icon: UserCheck, color: '#10B981', bg: '#ECFDF5' }
        ].map((s, i) => (
          <div key={i} className="stat-card" onClick={() => setActiveTab(s.tab)} style={{ cursor: 'pointer', border: activeTab === s.tab ? `2px solid ${s.color}` : '1px solid var(--saas-border)' }}>
            <div className="stat-icon-wrapper" style={{ backgroundColor: s.bg, color: s.color }}><s.icon size={24} /></div>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--saas-text-muted)', fontWeight: 500 }}>{s.label}</p>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{s.count}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="controls-bar">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--saas-text-muted)' }} />
          <input type="text" className="search-input" placeholder="Rechercher par nom, ID ou CIN..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {error && (
        <div className="error-banner" style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--red-50)', border: '1px solid var(--red-200)', borderRadius: '8px', color: 'var(--red-700)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} />
          <span>Impossible de charger les membres.</span>
          <button className="btn-ghost" onClick={loadData} style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'inherit' }}>Réessayer</button>
        </div>
      )}

      {isLoading && members.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <Spinner size={40} />
          <p className="text-muted" style={{ marginTop: '1rem' }}>Chargement des membres...</p>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Identifiants</th>
                <th>Informations</th>
                <th>Contact</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="user-identity">
                      <div className="user-avatar" style={{ backgroundColor: m.role === 'MEMBER_BUREAU' ? '#FEF3C7' : '#F3F4F6', color: m.role === 'MEMBER_BUREAU' ? '#D97706' : 'var(--saas-primary)', overflow: 'hidden' }}>
                        {m.photo ? <img src={getImageUrl(m.photo)} alt={m.first_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (m.role === 'MEMBER_BUREAU' ? <Award size={20} /> : m.first_name?.charAt(0))}
                      </div>
                      <div className="user-info">
                        <div style={{ backgroundColor: '#EEF2FF', color: 'var(--saas-primary)', fontWeight: 800, fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', width: 'fit-content', border: '1px solid #C7D2FE' }}>{m.member_id || `ID: ${m.id}`}</div>
                        <h4 style={{ fontSize: '0.95rem', margin: '4px 0 2px' }}>{m.first_name} {m.last_name}</h4>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', color: 'var(--saas-text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Cake size={12} /> {calculateAge(m.birth_date)} ans</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> Adhésion: {m.date_joined ? new Date(m.date_joined).toLocaleDateString('fr-FR') : '--'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CreditCard size={12} /> {m.cin || '--'}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--saas-text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {m.email}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {m.phone || '--'}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${m.is_active ? 'status-active' : 'status-inactive'}`}>{m.is_active ? 'Actif' : 'Inactif'}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="action-btn" onClick={() => startEdit(m)}><Edit2 size={16} /></button>
                      <button className="action-btn delete" onClick={() => handleDelete(m.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && !isLoading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--saas-text-muted)' }}>
              <Search size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} /><br />
              Aucun membre trouvé pour votre recherche.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
