import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { UserPlus, Calendar, Mail, Phone, MapPin, Smile, Send } from 'lucide-react';

export default function Inscription() {
  const [activeTab, setActiveTab] = useState('membre');
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  
  // Formulaire Devenir Membre
  const [formMembre, setFormMembre] = useState({
    first_name: '', last_name: '', email: '', phone: '', age: '', city: '', motivation: ''
  });
  
  // Formulaire Inscription Événement
  const [formEvent, setFormEvent] = useState({
    event_id: '', full_name: '', email: '', phone: '', message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Charger les événements pour l'onglet "inscription événement"
  useEffect(() => {
    fetch('http://localhost:8000/api/events/')
      .then(res => res.json())
      .then(data => {
        const liste = data.results || data;
        setEvents(liste);
        setLoadingEvents(false);
      })
      .catch(err => {
        console.error('Erreur chargement événements', err);
        setLoadingEvents(false);
      });
  }, []);

  // Soumission Devenir Membre
  const handleMembreSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const response = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formMembre)
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('✅ Inscription membre réussie ! Vous recevrez un email de confirmation.');
        setFormMembre({ first_name: '', last_name: '', email: '', phone: '', age: '', city: '', motivation: '' });
      } else {
        setError(data.error || data.message || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      setError('Erreur réseau, veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Soumission Inscription Événement
  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const response = await fetch('http://localhost:8000/api/registrations/event-requests/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: formEvent.event_id,
          full_name: formEvent.full_name,
          email: formEvent.email,
          phone: formEvent.phone,
          notes: formEvent.message
        })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('✅ Inscription à l\'événement enregistrée ! Vous recevrez une confirmation.');
        setFormEvent({ event_id: '', full_name: '', email: '', phone: '', message: '' });
      } else {
        setError(data.error || data.message || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      setError('Erreur réseau, veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar />
      
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
        
        {/* Onglets */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0' }}>
          <button
            onClick={() => setActiveTab('membre')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'membre' ? '#3b82f6' : 'transparent',
              color: activeTab === 'membre' ? 'white' : '#64748b',
              border: 'none',
              borderRadius: '12px 12px 0 0',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <UserPlus size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Devenir Membre
          </button>
          <button
            onClick={() => setActiveTab('evenement')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'evenement' ? '#3b82f6' : 'transparent',
              color: activeTab === 'evenement' ? 'white' : '#64748b',
              border: 'none',
              borderRadius: '12px 12px 0 0',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Calendar size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
            S'inscrire à un Événement
          </button>
        </div>

        {/* Messages */}
        {success && <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>{success}</div>}
        {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>{error}</div>}

        {/* Onglet Devenir Membre */}
        {activeTab === 'membre' && (
          <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Créer votre compte</h2>
            <form onSubmit={handleMembreSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <input type="text" placeholder="Prénom" value={formMembre.first_name} onChange={e => setFormMembre({...formMembre, first_name: e.target.value})} required style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <input type="text" placeholder="Nom" value={formMembre.last_name} onChange={e => setFormMembre({...formMembre, last_name: e.target.value})} required style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              </div>
              <input type="email" placeholder="Email" value={formMembre.email} onChange={e => setFormMembre({...formMembre, email: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <input type="tel" placeholder="Téléphone" value={formMembre.phone} onChange={e => setFormMembre({...formMembre, phone: e.target.value})} style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <input type="number" placeholder="Âge" value={formMembre.age} onChange={e => setFormMembre({...formMembre, age: e.target.value})} style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              </div>
              <input type="text" placeholder="Ville" value={formMembre.city} onChange={e => setFormMembre({...formMembre, city: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem' }} />
              <textarea placeholder="Pourquoi souhaitez-vous nous rejoindre ?" rows="4" value={formMembre.motivation} onChange={e => setFormMembre({...formMembre, motivation: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem' }} required></textarea>
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                {loading ? 'Inscription...' : 'Devenir membre'}
              </button>
            </form>
          </div>
        )}

        {/* Onglet Inscription Événement */}
        {activeTab === 'evenement' && (
          <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Inscription à un événement</h2>
            <form onSubmit={handleEventSubmit}>
              <select 
                required 
                value={formEvent.event_id}
                onChange={(e) => setFormEvent({...formEvent, event_id: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}
              >
                <option value="" disabled>Sélectionnez un événement</option>
                {events.map(evt => (
                  <option key={evt.id} value={evt.id}>{evt.Event_Name}</option>
                ))}
              </select>
              <input type="text" placeholder="Nom complet" value={formEvent.full_name} onChange={e => setFormEvent({...formEvent, full_name: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem' }} />
              <input type="email" placeholder="Email" value={formEvent.email} onChange={e => setFormEvent({...formEvent, email: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem' }} />
              <input type="tel" placeholder="Téléphone" value={formEvent.phone} onChange={e => setFormEvent({...formEvent, phone: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem' }} />
              <textarea placeholder="Message ou question" rows="3" value={formEvent.message} onChange={e => setFormEvent({...formEvent, message: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}></textarea>
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                {loading ? 'Inscription...' : 'S\'inscrire à l\'événement'}
              </button>
            </form>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}