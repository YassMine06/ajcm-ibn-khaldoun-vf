import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { UserPlus, Calendar, Mail, Phone, MapPin, Smile, Award, Send } from 'lucide-react';
import './InscriptionPage.css';
import { eventsData } from '../../assets/eventsData';

const InscriptionPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('membre');

  // États pour le formulaire de demande d'adhésion
  const [memberForm, setMemberForm] = useState({
    nom: '',
    age: '',
    email: '',
    tel: '',
    ville: '',
    motivation: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'evenement' || tabParam === 'membre') {
      setActiveTab(tabParam);
    }
    window.scrollTo(0, 0);
  }, [location]);

  const upcomingEvents = eventsData.map(e => `${e.title} (${e.date || 'À venir'})`);

  // Parse Django REST Framework error responses into a readable string
  const parseDjangoError = (err) => {
    const data = err?.response?.data;
    if (!data) return "Une erreur réseau est survenue. Vérifiez votre connexion.";
    // DRF validation errors: { field: ["message", ...], ... }
    if (typeof data === 'object' && !Array.isArray(data)) {
      const messages = Object.entries(data)
        .map(([field, msgs]) => {
          const label = field === 'non_field_errors' ? '' : `${field}: `;
          const text = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
          return `${label}${text}`;
        })
        .join(' | ');
      if (messages) return messages;
    }
    if (typeof data === 'string') return data;
    if (data.detail) return data.detail;
    if (data.error)  return data.error;
    return "Une erreur est survenue. Veuillez réessayer.";
  };

  // Handler pour la soumission du formulaire membre
  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const parts = memberForm.nom.trim().split(' ');
      const firstName = parts[0] || memberForm.nom.trim();
      const lastName = parts.slice(1).join(' ') || '';

      const payload = {
        first_name: firstName,
        last_name: lastName,
        email: memberForm.email.trim(),
        phone: memberForm.tel.trim(),
        age: parseInt(memberForm.age) || 0,
        city: memberForm.ville.trim(),
        motivation: memberForm.motivation.trim()
      };

      await axios.post('http://localhost:8000/api/registrations/membership-requests/', payload);

      setSuccessMessage("✅ Votre demande d'adhésion a été envoyée avec succès ! Nous vous contacterons très prochainement.");
      setMemberForm({ nom: '', age: '', email: '', tel: '', ville: '', motivation: '' });
      // Scroll vers le message
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    } catch (err) {
      console.error('[Membership Submit Error]', err?.response?.data || err);
      setErrorMessage(parseDjangoError(err));
      setTimeout(() => window.scrollTo({ top: 300, behavior: 'smooth' }), 100);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-enter" style={{ backgroundColor: '#f8fafc' }}>
      <Navbar />

      <main className="inscription-main">
        <div className="inscription-header">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#eef2ff', color: '#3b82f6', padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            <Award size={16} /> Rejoignez l'A.J.C.M
          </div>
          <h1>Faites le premier pas vers l'engagement</h1>
          <p>Choisissez votre mode de participation et contribuez au changement positif au sein de notre communauté.</p>
        </div>

        <div className="inscription-container">
          <div className="inscription-tabs">
            <button
              className={`tab-btn ${activeTab === 'membre' ? 'active' : ''}`}
              onClick={() => { setActiveTab('membre'); setSuccessMessage(''); setErrorMessage(''); }}
            >
              <UserPlus size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Devenir Membre
            </button>
            <button
              className={`tab-btn ${activeTab === 'evenement' ? 'active' : ''}`}
              onClick={() => { setActiveTab('evenement'); setSuccessMessage(''); setErrorMessage(''); }}
            >
              <Calendar size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              S'inscrire à un Événement
            </button>
          </div>

          <div className="form-wrapper">
            {/* Messages de retour pour l'utilisateur */}
            {successMessage && (
              <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', border: '1px solid #bbf7d0', textAlign: 'center', fontWeight: '500' }}>
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', border: '1px solid #fecaca', textAlign: 'center', fontWeight: '500' }}>
                {errorMessage}
              </div>
            )}

            {activeTab === 'evenement' ? (
              <form className="inscription-form" onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                setSuccessMessage('');
                setErrorMessage('');

                try {
                  const eventTitle = document.getElementById('event-select').value;
                  if (!eventTitle) throw new Error("Veuillez sélectionner un événement.");

                  // Trouver l'ID de l'événement depuis le backend
                  const res = await axios.get('http://localhost:8000/api/events/');
                  const events = res.data.results || res.data;
                  const selectedEvent = events.find(ev => (ev.Event_Name || ev.title) === eventTitle);

                  if (!selectedEvent) throw new Error("Événement introuvable sur le serveur. Veuillez réessayer.");

                  // Inscription API
                  const result = await axios.post('http://localhost:8000/api/registrations/event-requests/', {
                    event: selectedEvent.id,
                    full_name: document.getElementById('evt-nom').value.trim(),
                    email: document.getElementById('evt-email').value.trim(),
                    phone: document.getElementById('evt-tel').value.trim()
                  });

                  const msg = result.data?.status === 'CONFIRMED'
                    ? "✅ Votre inscription est confirmée ! À très bientôt."
                    : "✅ Votre demande d'inscription a été enregistrée.";
                  setSuccessMessage(msg);
                  e.target.reset();
                  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                } catch (err) {
                  const msg = parseDjangoError(err) || err.message || "Erreur lors de l'inscription.";
                  setErrorMessage(msg);
                  setTimeout(() => window.scrollTo({ top: 300, behavior: 'smooth' }), 100);
                } finally {
                  setIsSubmitting(false);
                }
              }}>
                <div className="form-group full-width">
                  <label htmlFor="event-select">Événement de votre choix *</label>
                  <select id="event-select" required defaultValue="">
                    <option value="" disabled>Sélectionnez un événement</option>
                    {upcomingEvents.map((evt, idx) => (
                      <option key={idx} value={evt.split(' (')[0]}>{evt}</option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="evt-nom">Nom complet *</label>
                    <input type="text" id="evt-nom" placeholder="Votre nom" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="evt-tel">Téléphone *</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input type="tel" id="evt-tel" placeholder="+212 600..." style={{ paddingLeft: '2.75rem' }} required />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="evt-email">Email professionnel ou personnel *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input type="email" id="evt-email" placeholder="votre@email.com" style={{ paddingLeft: '2.75rem' }} required />
                  </div>
                </div>
                <div className="form-group full-width">
                  <label htmlFor="evt-msg">Message ou Question spécifique</label>
                  <textarea id="evt-msg" rows="3" placeholder="Une attente particulière ou une question ?"></textarea>
                </div>
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'ENVOI...' : 'CONFIRMER MON INSCRIPTION'} <Send size={18} style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }} />
                </button>
              </form>
            ) : (
              <form className="inscription-form" onSubmit={handleMemberSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="mem-nom">Nom complet *</label>
                    <input
                      type="text" id="mem-nom" placeholder="Votre nom complet" required
                      value={memberForm.nom} onChange={(e) => setMemberForm({ ...memberForm, nom: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="mem-age">Âge *</label>
                    <input
                      type="number" id="mem-age" placeholder="Ex: 22" min="15" max="99" required
                      value={memberForm.age} onChange={(e) => setMemberForm({ ...memberForm, age: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="mem-email">Email *</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="email" id="mem-email" placeholder="votre@email.com" style={{ paddingLeft: '2.75rem' }} required
                        value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="mem-tel">Téléphone *</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="tel" id="mem-tel" placeholder="+212 600..." style={{ paddingLeft: '2.75rem' }} required
                        value={memberForm.tel} onChange={(e) => setMemberForm({ ...memberForm, tel: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="mem-ville">Ville de résidence *</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text" id="mem-ville" placeholder="Ex: Casablanca" style={{ paddingLeft: '2.75rem' }} required
                      value={memberForm.ville} onChange={(e) => setMemberForm({ ...memberForm, ville: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group full-width">
                  <label htmlFor="mem-motivation">Pourquoi souhaitez-vous nous rejoindre ? *</label>
                  <textarea
                    id="mem-motivation" rows="4" placeholder="Partagez avec nous vos motivations et ce que vous aimeriez apporter à l'association..." required
                    value={memberForm.motivation} onChange={(e) => setMemberForm({ ...memberForm, motivation: e.target.value })}
                  ></textarea>
                </div>
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'ENVOI EN COURS...' : 'SOUMETTRE MA CANDIDATURE'} <Smile size={18} style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }} />
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InscriptionPage;
