import React, { useState, useEffect, useCallback } from 'react';
import './MemberProfile.css';
import {
  User, MapPin, Calendar, Mail, Phone, Edit2,
  Camera, Check, X, RefreshCw, CheckCircle2, Info
} from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import userService from '../../api/userService';

/* ── URL complète pour les médias Django ── */
const mediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `http://localhost:8000${path}`;
};

/* ── Avatar par défaut ── */
function DefaultAvatar({ name, size = 100 }) {
  const initial = (name?.[0] || 'M').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #C9A227, #a8851c)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 800, color: 'white',
      flexShrink: 0, boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
    }}>
      {initial}
    </div>
  );
}

/* ── Carte info lecture ── */
function InfoCard({ icon, label, value }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.9rem',
      padding: '1rem 1.1rem', borderRadius: '12px',
      backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
    }}>
      <div style={{ color: '#2e513a', background: 'rgba(46,81,58,0.08)', padding: '0.45rem', borderRadius: '8px', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
          {label}
        </div>
        <div style={{ fontSize: '0.92rem', fontWeight: 500, color: value ? '#1e293b' : '#94a3b8', fontStyle: value ? 'normal' : 'italic', wordBreak: 'break-word' }}>
          {value || 'Non renseigné'}
        </div>
      </div>
    </div>
  );
}

export default function MemberProfile() {
  const [user,         setUser]         = useState(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isEditing,    setIsEditing]    = useState(false);
  const [isSaving,     setIsSaving]     = useState(false);
  const [editForm,     setEditForm]     = useState({});
  const [photoFile,    setPhotoFile]    = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [fetchError,   setFetchError]   = useState('');
  const [saveError,    setSaveError]    = useState('');
  const [successMsg,   setSuccessMsg]   = useState('');

  /* ── GET /api/auth/me/ ── */
  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const data = await userService.getMe();
      setUser(data);
      setEditForm(data);
    } catch {
      setFetchError('Impossible de charger votre profil. Vérifiez votre connexion.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleCancel = () => {
    setIsEditing(false);
    setPhotoPreview(null);
    setPhotoFile(null);
    setEditForm(user);
    setSaveError('');
  };

  /* ── PATCH /api/auth/me/ ── */
  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    setSuccessMsg('');
    try {
      const fd = new FormData();
      fd.append('first_name', editForm.first_name?.trim() || '');
      fd.append('last_name',  editForm.last_name?.trim()  || '');
      if (editForm.phone !== undefined) fd.append('phone', editForm.phone?.trim() || '');
      if (editForm.bio   !== undefined) fd.append('bio',   editForm.bio?.trim()   || '');
      if (editForm.city  !== undefined) fd.append('city',  editForm.city?.trim()  || '');
      if (photoFile) fd.append('photo', photoFile);

      const updated = await userService.patchMe(fd);
      setUser(updated);
      setEditForm(updated);

      // Mettre à jour le localStorage pour la sidebar
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, ...updated }));

      setIsEditing(false);
      setPhotoFile(null);
      setPhotoPreview(null);
      setSuccessMsg('Profil mis à jour avec succès !');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setSaveError(err.message || 'Erreur lors de la mise à jour.');
    } finally {
      setIsSaving(false);
    }
  };

  /* ────────── États de chargement ────────── */
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem', gap: '1rem' }}>
        <Spinner size={44} />
        <p style={{ color: '#64748b', margin: 0 }}>Chargement de votre profil...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ color: '#dc2626', marginBottom: '1.5rem', fontWeight: 500 }}>{fetchError}</div>
        <button onClick={fetchProfile} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem', background: '#2e513a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <RefreshCw size={16} /> Réessayer
        </button>
      </div>
    );
  }

  if (!user) return null;

  /* ── Données à afficher (selon ce que /api/auth/me/ retourne réellement) ── */
  const fullName = user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Membre';
  const avatarSrc = photoPreview || mediaUrl(user.photo);

  return (
    <div className="member-profile-page">

      {/* Message de succès */}
      {successMsg && (
        <div className="member-profile-success">
          <CheckCircle2 size={18} /><span>{successMsg}</span>
        </div>
      )}

      {/* ══ HERO ══ */}
      <div className="member-profile-hero">
        {!isEditing && (
          <button className="member-profile-edit-btn" onClick={() => { setIsEditing(true); setSaveError(''); }}>
            <Edit2 size={15} /> Modifier mon profil
          </button>
        )}

        <div className="member-profile-hero-content">
          {/* Avatar */}
          <div className="member-profile-avatar-wrapper">
            {avatarSrc
              ? <img src={avatarSrc} alt={fullName} className="member-profile-avatar-img" />
              : <DefaultAvatar name={fullName} size={100} />
            }
            {isEditing && (
              <>
                <input type="file" id="profile-photo-input" accept="image/*" style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setPhotoFile(file);
                    const r = new FileReader();
                    r.onloadend = () => setPhotoPreview(r.result);
                    r.readAsDataURL(file);
                  }} />
                <label htmlFor="profile-photo-input" className="member-profile-camera-btn" title="Changer la photo">
                  <Camera size={16} />
                </label>
              </>
            )}
          </div>

          {/* Identité */}
          <div className="member-profile-identity">
            {isEditing ? (
              <div className="member-profile-name-inputs">
                <input type="text" value={editForm.first_name || ''} onChange={e => setEditForm(p => ({ ...p, first_name: e.target.value }))} placeholder="Prénom" className="member-profile-name-input" />
                <input type="text" value={editForm.last_name  || ''} onChange={e => setEditForm(p => ({ ...p, last_name:  e.target.value }))} placeholder="Nom"    className="member-profile-name-input" />
              </div>
            ) : (
              <h1 className="member-profile-fullname">{fullName}</h1>
            )}

            <p className="member-profile-email"><Mail size={14} style={{ flexShrink: 0 }} /> {user.email}</p>

            <div className="member-profile-badges">
              {user.is_superuser || user.is_staff ? (
                <span className="member-badge-role" style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                  Administrateur
                </span>
              ) : (
                <span className="member-badge-role">Membre AJCM</span>
              )}
              {user.age && (
                <span className="member-badge-id">{user.age} ans</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══ INFORMATIONS ══ */}
      <div className="member-profile-section">
        <h2 className="member-profile-section-title">Informations personnelles</h2>

        {isEditing ? (
          <div>
            {saveError && (
              <div className="member-profile-save-error"><X size={16} /> {saveError}</div>
            )}

            <div className="member-profile-edit-grid">
              <div className="member-profile-field">
                <label>Téléphone</label>
                <input type="tel" value={editForm.phone || ''} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} placeholder="Ex : +212 6XX XX XX XX" />
              </div>
              <div className="member-profile-field">
                <label>Ville</label>
                <input type="text" value={editForm.city || ''} onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))} placeholder="Ex : Mohammedia" />
              </div>
              <div className="member-profile-field" style={{ gridColumn: '1 / -1' }}>
                <label>Biographie / À propos</label>
                <textarea rows={3} value={editForm.bio || ''} onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))} placeholder="Parlez-nous de vous..." />
              </div>
            </div>

            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#92400e' }}>
              <Info size={14} />
              Pour modifier votre email ou mot de passe, contactez l'administrateur.
            </div>

            <div className="member-profile-edit-actions">
              <button onClick={handleCancel} className="member-profile-btn-cancel" disabled={isSaving}>
                <X size={16} /> Annuler
              </button>
              <button onClick={handleSave} className="member-profile-btn-save" disabled={isSaving}>
                {isSaving ? <Spinner size={16} color="white" /> : <Check size={16} />}
                {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </div>
        ) : (
          <div className="member-profile-info-grid">
            <InfoCard icon={<Phone    size={17} />} label="Téléphone"    value={user.phone} />
            <InfoCard icon={<MapPin   size={17} />} label="Ville"        value={user.city}  />
            <InfoCard icon={<User     size={17} />} label="Âge"          value={user.age ? `${user.age} ans` : null} />
            <InfoCard icon={<Mail     size={17} />} label="Email"        value={user.email} />
            {user.bio && (
              <div style={{ gridColumn: '1 / -1' }}>
                <InfoCard icon={<Info size={17} />} label="À propos" value={user.bio} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
