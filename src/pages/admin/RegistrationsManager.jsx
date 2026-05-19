import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users, UserCheck, Calendar, CheckCircle, XCircle,
  RefreshCw, AlertCircle, Mail, Phone, MapPin, Plus
} from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import userService from '../../api/userService';
import './RegistrationsManager.css';

export default function RegistrationsManager() {
  const [activeTab, setActiveTab] = useState('memberships');
  const [memberships, setMemberships] = useState([]);
  const [eventsRegistrations, setEventsRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal State for creating User from Membership Request
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReqId, setSelectedReqId] = useState(null);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    password: '', role: 'MEMBER_STANDARD', cin: '', address: ''
  });

  const fetchMemberships = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:8000/api/registrations/admin/membership-requests/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data.results ? response.data.results : response.data;
      setMemberships(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur memberships:', err);
      setError('Impossible de charger les demandes d\'adhésion.');
    }
  };

  const fetchEventsRegistrations = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:8000/api/registrations/admin/event-requests/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data.results ? response.data.results : response.data;
      setEventsRegistrations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur events registrations:', err);
      setError('Impossible de charger les inscriptions aux événements.');
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    if (activeTab === 'memberships') {
      await fetchMemberships();
    } else {
      await fetchEventsRegistrations();
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleApproveClick = (req) => {
    setNewUser({
      first_name: req.first_name || '',
      last_name: req.last_name || '',
      email: req.email || '',
      phone: req.phone || '',
      password: '',
      role: 'MEMBER_STANDARD',
      cin: '',
      address: req.city ? `Ville: ${req.city}` : ''
    });
    setSelectedReqId(req.id);
    setIsModalOpen(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.password) {
      alert("Le mot de passe est obligatoire pour créer le compte.");
      return;
    }
    setIsSavingUser(true);
    try {
      // 1. Créer le membre via userService (POST /api/users/)
      const formData = new FormData();
      Object.keys(newUser).forEach(key => formData.append(key, newUser[key]));
      await userService.create(formData);

      // 2. Marquer la demande d'adhésion comme approuvée
      const token = localStorage.getItem('adminToken');
      await axios.post(`http://localhost:8000/api/registrations/admin/membership-requests/${selectedReqId}/action/`,
        { action: 'approve' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsModalOpen(false);
      fetchMemberships();
      alert("Le membre a été créé avec succès et la demande approuvée !");
    } catch (err) {
      alert("Erreur lors de la création du membre: " + (err.response?.data?.error || JSON.stringify(err.response?.data) || err.message));
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleRejectClick = async (id) => {
    if (!window.confirm("Voulez-vous vraiment rejeter (et archiver/supprimer) cette demande ?")) return;
    try {
      const token = localStorage.getItem('adminToken');
      // L'action reject va soit la supprimer soit la marquer REJECTED selon le backend
      await axios.post(`http://localhost:8000/api/registrations/admin/membership-requests/${id}/action/`,
        { action: 'reject' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMemberships();
    } catch (err) {
      alert(`Erreur: ${err.response?.data?.error || err.message}`);
    }
  };

  const groupedEvents = eventsRegistrations.reduce((acc, curr) => {
    const eventName = curr.event_name || 'Événement Inconnu';
    if (!acc[eventName]) acc[eventName] = [];
    acc[eventName].push(curr);
    return acc;
  }, {});

  return (
    <div className="page-enter" style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={28} color="#2e513a" /> Gestion des Inscriptions
          </h1>
          <p className="text-muted">Gérez les demandes d'adhésion et les participations aux événements.</p>
        </div>
        <button className="btn-icon" onClick={loadData} title="Actualiser" disabled={isLoading} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
          <RefreshCw size={20} className={isLoading ? 'spin' : ''} color="#64748b" />
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('memberships')}
          style={{
            background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1.05rem', fontWeight: 600,
            cursor: 'pointer', color: activeTab === 'memberships' ? '#2e513a' : '#64748b',
            borderBottom: activeTab === 'memberships' ? '3px solid #C9A227' : '3px solid transparent',
            display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'
          }}
        >
          <Users size={18} /> Demandes d'adhésion
        </button>
        <button
          onClick={() => setActiveTab('events')}
          style={{
            background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1.05rem', fontWeight: 600,
            cursor: 'pointer', color: activeTab === 'events' ? '#2e513a' : '#64748b',
            borderBottom: activeTab === 'events' ? '3px solid #C9A227' : '3px solid transparent',
            display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'
          }}
        >
          <Calendar size={18} /> Inscriptions Événements
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <Spinner size={40} />
          <p style={{ color: '#64748b', marginTop: '1rem' }}>Chargement en cours...</p>
        </div>
      ) : activeTab === 'memberships' ? (
        <div className="table-container" style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#475569', fontWeight: 600 }}>Candidat</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#475569', fontWeight: 600 }}>Contact</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#475569', fontWeight: 600 }}>Infos</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#475569', fontWeight: 600 }}>Motivation</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: '#475569', fontWeight: 600 }}>Statut</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: '#475569', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {memberships.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Aucune demande d'adhésion trouvée.</td></tr>
              ) : (
                memberships.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem', fontWeight: 500, color: '#1e293b' }}>
                      {req.first_name} {req.last_name}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}><Mail size={12} /> {req.email}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: '#64748b' }}><Phone size={12} /> {req.phone}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', color: '#475569' }}><strong>Âge:</strong> {req.age} ans</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: '#475569' }}><MapPin size={12} /> {req.city}</div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#475569', maxWidth: '200px' }}>
                      <div style={{ maxHeight: '60px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {req.motivation}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                        background: req.status === 'PENDING' ? '#fef3c7' : req.status === 'APPROVED' ? '#dcfce7' : '#fee2e2',
                        color: req.status === 'PENDING' ? '#92400e' : req.status === 'APPROVED' ? '#166534' : '#991b1b'
                      }}>
                        {req.status === 'PENDING' ? 'En attente' : req.status === 'APPROVED' ? 'Approuvé' : 'Rejeté'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {req.status === 'PENDING' && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleApproveClick(req)}
                            title="Créer Membre & Approuver"
                            style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #10b981', borderRadius: '6px', padding: '0.4rem', cursor: 'pointer' }}
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleRejectClick(req.id)}
                            title="Rejeter"
                            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #ef4444', borderRadius: '6px', padding: '0.4rem', cursor: 'pointer' }}
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          {Object.keys(groupedEvents).length === 0 ? (
            <div style={{ background: 'white', padding: '3rem', textAlign: 'center', color: '#64748b', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              Aucune inscription à un événement trouvée.
            </div>
          ) : (
            Object.entries(groupedEvents).map(([eventName, participants]) => (
              <div key={eventName} style={{ marginBottom: '2rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ background: '#f8fafc', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '1.1rem', margin: 0, color: '#1e293b' }}>{eventName}</h2>
                  <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {participants.length} Participant(s)
                  </span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9' }}>
                        <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>Nom complet</th>
                        <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>Email</th>
                        <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>Téléphone</th>
                        <th style={{ padding: '0.75rem 1.5rem', textAlign: 'center', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((p) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: '#0f172a' }}>{p.full_name}</td>
                          <td style={{ padding: '1rem 1.5rem', color: '#475569', fontSize: '0.9rem' }}>{p.email}</td>
                          <td style={{ padding: '1rem 1.5rem', color: '#475569', fontSize: '0.9rem' }}>{p.phone}</td>
                          <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                            <span style={{
                              padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                              background: p.status === 'CONFIRMED' ? '#dcfce7' : '#f1f5f9',
                              color: p.status === 'CONFIRMED' ? '#166534' : '#475569'
                            }}>
                              {p.status === 'CONFIRMED' ? 'Confirmé' : p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal de Création Membre */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', width: '90%', maxWidth: '600px', borderRadius: '12px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginTop: 0, color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>Finaliser la création du compte Membre</h2>
            <form onSubmit={handleCreateUser}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Prénom *</label>
                  <input type="text" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} required
                    value={newUser.first_name} onChange={e => setNewUser({ ...newUser, first_name: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nom *</label>
                  <input type="text" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} required
                    value={newUser.last_name} onChange={e => setNewUser({ ...newUser, last_name: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Email *</label>
                  <input type="email" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} required
                    value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Téléphone</label>
                  <input type="text" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Mot de passe initial *</label>
                  <input type="password" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} required placeholder="Ex: membre123"
                    value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.5rem 1rem', background: 'none', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>Annuler</button>
                <button type="submit" disabled={isSavingUser} style={{ padding: '0.5rem 1rem', background: '#2e513a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isSavingUser ? <Spinner size={14} color="white" /> : <Plus size={14} />} Créer le membre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
