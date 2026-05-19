import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './ContactPage.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState(''); // '' | 'sending' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Parse Django REST Framework validation errors into readable text
  const parseDjangoError = (err) => {
    const data = err?.response?.data;
    if (!data) return 'Erreur réseau. Vérifiez votre connexion.';
    if (typeof data === 'object' && !Array.isArray(data)) {
      const msgs = Object.entries(data)
        .map(([field, val]) => {
          const label = field === 'non_field_errors' ? '' : `${field}: `;
          const text = Array.isArray(val) ? val.join(', ') : String(val);
          return `${label}${text}`;
        })
        .join(' | ');
      if (msgs) return msgs;
    }
    if (data.detail) return data.detail;
    if (data.error)  return data.error;
    if (typeof data === 'string') return data;
    return 'Une erreur est survenue. Veuillez réessayer.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      await axios.post('http://localhost:8000/api/contact/messages/', {
        name:    formData.name.trim(),
        email:   formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      // Réinitialiser après 6 secondes
      setTimeout(() => setStatus(''), 6000);
    } catch (err) {
      console.error('[Contact Submit Error]', err?.response?.data || err);
      setErrorMsg(parseDjangoError(err));
      setStatus('error');
    }
  };


  return (
    <div className="contact-page page-enter">
      <Navbar />

      {/* ── Hero ── */}
      <header className="desc-hero">
        <div className="desc-hero-bg"><div className="desc-hero-overlay"></div></div>
        <div className="evts-container desc-hero-content">
          <div className="badge-identity">Contactez-nous</div>
          <h1 className="animate-title">Restons En Contact</h1>
          <p className="desc-subtitle animate-subtitle">
            Une question, une suggestion ou une envie de collaborer ? N'hésitez pas à nous écrire.
          </p>
        </div>
      </header>

      {/* ── Contact Section ── */}
      <section className="contact-section">
        <div className="contact-container">
          
          <div className="contact-info-panel">
            <h2>Nos Coordonnées</h2>
            <p>Nous serions ravis de vous rencontrer ou de répondre à vos questions par téléphone ou e-mail.</p>
            
            <div className="info-items">
              <div className="info-item">
                <div className="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <h4>Adresse</h4>
                  <p>Maison de Jeunes Ibn Khaldoun<br/>Mohammedia, Maroc</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                </div>
                <div>
                  <h4>Téléphone</h4>
                  <p>0667015703 - 0773275830</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <div>
                  <h4>E-mail</h4>
                  <p>ajcmmohammedia@gmail.com</p>
                </div>
              </div>
            </div>

            <div className="social-links">
              <h4>Suivez-nous</h4>
              <div className="social-icons">
                <a href="https://web.facebook.com/profile.php?id=61572668484022" target="_blank" rel="noopener noreferrer" className="social-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                </a>
                <a href="https://www.instagram.com/ajcm_mohammedia" target="_blank" rel="noopener noreferrer" className="social-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="contact-form-panel">
            <h2>Envoyez-nous un message</h2>

              {/* Feedback messages */}
              {status === 'success' && (
                <div style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '10px', border: '1px solid #bbf7d0', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  ✅ Votre message a bien été envoyé ! Nous vous répondrons dans les meilleurs délais.
                </div>
              )}
              {status === 'error' && errorMsg && (
                <div style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '10px', border: '1px solid #fecaca', fontWeight: 500 }}>
                  ⚠️ {errorMsg}
                </div>
              )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Nom complet</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  placeholder="Votre nom"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Adresse E-mail</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  placeholder="votre.email@exemple.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Sujet</label>
                <input 
                  type="text" 
                  id="subject" 
                  name="subject" 
                  value={formData.subject} 
                  onChange={handleChange} 
                  required 
                  placeholder="Objet de votre message"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea 
                  id="message" 
                  name="message" 
                  value={formData.message} 
                  onChange={handleChange} 
                  required 
                  placeholder="Comment pouvons-nous vous aider ?"
                  rows="5"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className={`submit-btn ${status === 'sending' ? 'sending' : ''} ${status === 'success' ? 'success' : ''} ${status === 'error' ? 'error' : ''}`}
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'Envoi en cours...' : 
                 status === 'success' ? '✅ Message envoyé !' :
                 status === 'error'   ? 'Réessayer' : 'Envoyer le message'}
              </button>
            </form>
          </div>


        </div>
      </section>

      {/* ── Map Section ── */}
      <section className="map-section">
        <div className="map-container">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13280.999719330104!2d-7.4042851!3d33.6828551!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7b6e92c6c39a7%3A0xc622d991b5c2a11b!2sMohammedia!5e0!3m2!1sfr!2sma!4v1700000000000!5m2!1sfr!2sma" 
            width="100%" 
            height="450" 
            style={{border:0}} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Carte Mohammedia"
          ></iframe>
        </div>
      </section>

      <Footer />
    </div>
  );
}
