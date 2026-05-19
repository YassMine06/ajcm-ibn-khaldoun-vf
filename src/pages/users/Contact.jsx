import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './ContactPage.css';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:8000/api/contact/messages/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (response.ok) {
        setSent(true);
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setError("Erreur d'envoi, veuillez réessayer.");
      }
    } catch (err) {
      setError("Erreur réseau, vérifiez votre connexion.");
    }
  };

  return (
    <div className="contact-page page-enter">
      <Navbar />

      <header className="desc-hero">
        <div className="desc-hero-bg">
          <div className="desc-hero-overlay"></div>
        </div>
        <div className="evts-container desc-hero-content">
          <div className="badge-identity">Contactez-nous</div>
          <h1 className="animate-title">Prenons Contact</h1>
          <p className="desc-subtitle animate-subtitle">
            Une question ? Une suggestion ? Écrivez-nous, nous vous répondrons rapidement.
          </p>
        </div>
      </header>

      <main className="contact-main">
        <div className="contact-container">
          <div className="contact-grid">
            {/* Informations de contact */}
            <div className="contact-info">
              <h2>Nos Coordonnées</h2>
              <div className="contact-info-item">
                <MapPin size={20} />
                <div>
                  <strong>Adresse</strong>
                  <p>Maison de Jeunes Ibn Khaldoun, Mohammedia, Maroc</p>
                </div>
              </div>
              <div className="contact-info-item">
                <Phone size={20} />
                <div>
                  <strong>Téléphone</strong>
                  <p>0667015703 - 0773275830</p>
                </div>
              </div>
              <div className="contact-info-item">
                <Mail size={20} />
                <div>
                  <strong>Email</strong>
                  <p>ajcmmohammedia@gmail.com</p>
                </div>
              </div>
            </div>

            {/* Formulaire */}
            <div className="contact-form-container">
              <h2>Envoyez-nous un message</h2>
              {sent && <div className="success-message">✅ Message envoyé ! Nous vous répondrons rapidement.</div>}
              {error && <div className="error-message">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <input type="text" placeholder="Nom complet" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <input type="email" placeholder="Adresse e-mail" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                </div>
                <div className="form-group">
                  <input type="text" placeholder="Sujet" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required />
                </div>
                <div className="form-group">
                  <textarea placeholder="Message" rows="5" value={form.message} onChange={e => setForm({...form, message: e.target.value})} required></textarea>
                </div>
                <button type="submit" className="submit-btn">
                  <Send size={18} /> Envoyer
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}