import React, { useState } from 'react';
import './EditProfile.css';
import { Camera, Save, Edit3, User } from 'lucide-react';

export default function EditProfile({ user, onUpdateUser }) {
  const [form, setForm] = useState({ 
    name: user?.name || 'Ahmed Benali', 
    joinDate: user?.joinDate || '2026-01-01', 
    birthDate: user?.birthDate || '2002-05-15', 
    cin: user?.cin || 'AB123456', 
    email: user?.email || 'ahmed.b@ajcm.org', 
    phone: user?.phone || '+212 661 123 456', 
    password: '', 
    address: user?.address || 'Casablanca, Oasis',
    avatar: user?.avatar || null
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setSaved(false); };

  const handleSubmit = (e) => { 
    e.preventDefault(); 
    if (onUpdateUser) {
      onUpdateUser(form);
    }
    setSaved(true); 
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="page-title"><Edit3 size={24} /> Modifier mes informations</h1>

      {/* Avatar */}
      <div className="table-container" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--gray-700)', marginBottom: '1.25rem' }}>Photo de profil</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--green-700), var(--green-800))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: 'var(--gold-400)', overflow: 'hidden' }}>
              {form.avatar ? <img src={form.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'M'}
            </div>
            <label htmlFor="avatar-upload" style={{ position: 'absolute', bottom: 0, right: 0, width: '26px', height: '26px', borderRadius: '50%', background: 'var(--gold-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
              <Camera size={13} color="white" />
            </label>
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem' }}>Changer la photo de profil</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.75rem' }}>Formats acceptés : JPG, PNG. Taille max : 2 MB</p>
            <input 
              type="file" 
              id="avatar-upload" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setForm({ ...form, avatar: reader.result });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <button className="btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }} onClick={() => document.getElementById('avatar-upload').click()}>
              <Camera size={14} /> Parcourir…
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="table-container" style={{ padding: '2rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--gray-700)', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--gray-200)' }}>
          Informations personnelles
        </h3>

        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--success)', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 500 }}>
            ✅ Informations mises à jour avec succès.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Nom complet</label>
              <input type="text" name="name" className="form-control" value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Date d'adhésion</label>
              <input type="date" name="joinDate" className="form-control" value={form.joinDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Date de naissance</label>
              <input type="date" name="birthDate" className="form-control" value={form.birthDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>CIN</label>
              <input type="text" name="cin" className="form-control" value={form.cin} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} placeholder="membre@ajcm.org" />
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input type="text" name="phone" className="form-control" value={form.phone} onChange={handleChange} placeholder="+212 6XX XXX XXX" />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input type="password" name="password" className="form-control" value={form.password} onChange={handleChange} placeholder="Laissez vide pour ne pas changer" />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Adresse</label>
              <textarea name="address" className="form-control" rows="3" value={form.address} onChange={handleChange} />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
            <Save size={16} /> Enregistrer les modifications
          </button>
        </form>
      </div>
    </div>
  );
}
