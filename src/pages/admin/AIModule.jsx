import React, { useState } from 'react';
import { 
  Plus, Trash2, Save, Sparkles, Clock, 
  Wallet, Users, AlertCircle, CheckCircle2, ChevronRight,
  TrendingUp, TrendingDown, Star
} from 'lucide-react';
import './AIModule.css';

const EVENT_TYPES = [
  'Art', 'Camping', 'Conférence', 'Culture', 'Formation',
  'Medical Convoy', 'Table Ronde', 'Workshop',
  'solidarity_donation', 'solidarity_material'
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/';

const STEPS = [
  { num: '1', title: 'Budget & bénévoles', desc: 'Entrez le budget total du mois et le nombre de volontaires disponibles.' },
  { num: '2', title: 'Ajoutez vos événements', desc: 'Listez chaque événement prévu : nom, type, durée. Cochez « forcé » pour les événements prioritaires.' },
  { num: '3', title: 'Lancez l\'analyse', desc: 'Le modèle calcule le score de priorité de chaque événement et sélectionne la combinaison optimale.' },
  { num: '4', title: 'Lisez les résultats', desc: 'Les événements retenus et rejetés s\'affichent avec les raisons et les ressources utilisées.' },
];

export default function AIModule() {
  const [globalBudget, setGlobalBudget] = useState('');
  const [globalVolunteers, setGlobalVolunteers] = useState('');
  const [events, setEvents] = useState([
    { id: Date.now(), name: '', type: 'Formation', duration_hours: '', forced: false }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [results, setResults] = useState(null); // ✅ Résultats de l'optimisation

  const addEvent = () => {
    setEvents([...events, { 
      id: Date.now() + Math.random(), 
      name: '', 
      type: 'Formation', 
      duration_hours: '', 
      forced: false 
    }]);
  };

  const removeEvent = (id) => {
    if (events.length > 1) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  const updateEvent = (id, field, value) => {
    setEvents(events.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const validate = () => {
    if (!globalBudget || !globalVolunteers) {
      setFeedback({ type: 'error', message: 'Veuillez entrer le budget total et le nombre de volontaires.' });
      return false;
    }
    const incomplete = events.some(e => !e.name || !e.duration_hours);
    if (incomplete) {
      setFeedback({ type: 'error', message: 'Veuillez remplir le nom et la durée pour chaque événement.' });
      return false;
    }
    return true;
  };

  const handleOptimize = async () => {
    if (!validate()) {
      alert("Veuillez remplir tous les champs numériques pour chaque événement.");
      return;
    }

    setIsLoading(true);
    setFeedback(null);
    setResults(null);

    const token = localStorage.getItem('adminToken');

    const payload = {
      budget: parseFloat(globalBudget),
      volunteers: parseInt(globalVolunteers),
      events: events.map(e => ({
        name: e.name,
        category: e.type,
        duration_hours: parseFloat(e.duration_hours),
        forced: e.forced
      }))
    };

    try {
      const response = await fetch(`${API_BASE}ai/optimize/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Erreur serveur');
      }

      setResults(data);
      setFeedback({ type: 'success', message: 'Optimisation réussie ! Défilez vers le bas pour voir les résultats.' });

    } catch (err) {
      setFeedback({ type: 'error', message: `Erreur : ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const volunteersUsed = results ? Math.floor(results.volunteers_used) : 0;
  const volunteersRemaining = results ? parseInt(globalVolunteers) - volunteersUsed : 0;

  return (
    <div className="ia-module-page page-enter">
      
      {/* ── Header ── */}
      <div className="ia-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem', padding: '0 0 1rem 0', background: 'transparent', boxShadow: 'none', border: 'none', borderBottom: '1px solid var(--gray-100)', borderRadius: 0 }}>
        <div>
          <h1 className="ia-title">Module IA</h1>
          <p className="ia-subtitle">Alimentez le modèle avec de nouvelles données pour optimiser vos prédictions.</p>
        </div>
      </div>

      {/* ── Feedback ── */}
      {feedback && (
        <div className={`ia-feedback ${feedback.type}`}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Formulaire + Sidebar */}
      <div className="ia-content">
        <div className="events-builder-section">
          
          {/* Budget et volontaires globaux */}
          <div className="ia-global-config">
            <h3 className="ia-section-title">Contraintes Globales du Mois</h3>
            <div className="form-row">
              <div className="ia-form-group">
                <label><Wallet size={14} /> Budget Total (MAD)</label>
                <input
                  type="number"
                  placeholder="Ex: 5000"
                  value={globalBudget}
                  onChange={e => setGlobalBudget(e.target.value)}
                  className="ia-input"
                />
              </div>
              <div className="ia-form-group">
                <label><Users size={14} /> Volontaires Disponibles</label>
                <input
                  type="number"
                  placeholder="Ex: 15"
                  value={globalVolunteers}
                  onChange={e => setGlobalVolunteers(e.target.value)}
                  className="ia-input"
                />
              </div>
            </div>
          </div>
          
          {/* Liste événements */}
          <div className="builder-header">
            <h3 className="ia-section-title" style={{ margin: 0 }}>Événements Planifiés</h3>
            <button className="btn-add-event" onClick={addEvent}>
              <Plus size={16} /> Ajouter un événement
            </button>
          </div>

          <div className="ia-events-list">
            {events.map((event, index) => (
              <div key={event.id} className="ia-event-card">
                <div className="card-index">#{index + 1}</div>
                <div className="card-main-form">
                  <div className="form-row">
                    {/* Nom de l'événement */}
                    <div className="ia-form-group">
                      <label>Nom de l'événement</label>
                      <input
                        type="text"
                        placeholder="Ex: Atelier Art Plastique"
                        value={event.name}
                        onChange={e => updateEvent(event.id, 'name', e.target.value)}
                        className="ia-input"
                      />
                    </div>
                    {/* Type */}
                    <div className="ia-form-group">
                      <label>Type d'événement</label>
                      <select
                        value={event.type}
                        onChange={e => updateEvent(event.id, 'type', e.target.value)}
                        className="ia-select"
                      >
                        {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    {/* Durée */}
                    <div className="ia-form-group">
                      <label><Clock size={14} /> Durée (heures)</label>
                      <input
                        type="number"
                        placeholder="Ex: 4"
                        value={event.duration_hours}
                        onChange={e => updateEvent(event.id, 'duration_hours', e.target.value)}
                        className="ia-input"
                      />
                    </div>
                    {/* Forcé */}
                    <div className="ia-form-group ia-forced-group">
                      <label className="ia-checkbox-label">
                        <input
                          type="checkbox"
                          checked={event.forced}
                          onChange={e => updateEvent(event.id, 'forced', e.target.checked)}
                        />
                        <span>Toujours inclus</span>
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  className="btn-remove-ia"
                  onClick={() => removeEvent(event.id)}
                  title="Supprimer"
                  disabled={events.length === 1}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="ia-sidebar-info">
          <button
            className={`btn-primary ${isLoading ? 'loading' : ''}`}
            onClick={handleOptimize}
            disabled={isLoading}    
          >
            {isLoading 
              ? <><span className="ia-spinner"/> Analyse en cours…</> 
              : <><Save size={18} /> Analyser &amp; Planifier</>}
          </button>

          <div className="ia-info-card glass">
            <h4>Comment ça marche ?</h4>
            <ol className="ia-steps-list">
              {STEPS.map(s => (
                <li key={s.num} className="ia-step-item">
                  <div className="ia-step-num">{s.num}</div>
                  <div>
                    <div className="ia-step-title">{s.title}</div>
                    <div className="ia-step-desc">{s.desc}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* RÉSULTATS */}
        {results && (
        <div className="ia-results-section">
          <h2 className="ia-results-title">
            Résultats de l'Optimisation
          </h2>

          {/* Stats globales */}
          <div className="ia-results-stats">
            <div className="stat-card">
              <Wallet size={22} />
              <div>
                <div className="stat-value">{results.budget_used?.toFixed(0)} MAD</div>
                <div className="stat-label">
                  Budget utilisé sur {globalBudget} MAD
                  ({((results.budget_used / parseFloat(globalBudget)) * 100).toFixed(1)}%)
                </div>
              </div>
            </div>
            <div className="stat-card">
              <Users size={22} />
              <div>
                <div className="stat-value">{volunteersUsed}</div>
                <div className="stat-label">
                  Volontaires sur {globalVolunteers}
                  ({((results.volunteers_used / parseInt(globalVolunteers)) * 100).toFixed(1)}%)
                </div>
              </div>
            </div>
            <div className="stat-card">
              <Star size={22} />
              <div>
                <div className="stat-value">{results.selected?.length || 0}</div>
                <div className="stat-label">Événements retenus ce mois</div>
              </div>
            </div>
          </div>

          {/* Événements retenus */}
          {results.selected?.length > 0 && (
            <div className="ia-results-table">
              <h3 style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} /> Événements Retenus Ce Mois
              </h3>
              <div className="ia-table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Événement</th>
                      <th>Type</th>
                      <th>Coût estimé</th>
                      <th>Volontaires</th>
                      <th>Priority Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.selected.map((ev, i) => (
                      <tr key={i}>
                        <td><strong>{ev.name}</strong></td>
                        <td><span className="tag">{ev.type}</span></td>
                        <td>{ev.estimated_cost?.toFixed(2)} MAD</td>
                        <td>{ev.estimated_volunteers}</td>
                        <td><span className="score-badge">{(ev.priority_score * 100).toFixed(1)}%</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Événements rejetés */}
          {results.rejected?.length > 0 && (
            <div className="ia-results-table rejected">
              <h3 style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingDown size={18} /> Événements Non Retenus (à reporter)
              </h3>
              <div className="ia-table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Événement</th>
                      <th>Type</th>
                      <th>Raison du rejet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.rejected.map((ev, i) => (
                      <tr key={i}>
                        <td><strong>{ev.name}</strong></td>
                        <td><span className="tag rejected">{ev.type}</span></td>
                        <td style={{ color: '#dc2626', fontSize: '0.85rem' }}>{ev.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Résumé budget restant */}
          <div className="ia-summary-bar">
            <span>💰 Budget restant : <strong>{results.budget_remaining?.toFixed(2)} MAD</strong></span>
            <span>👥 Volontaires restants : <strong>{volunteersRemaining}</strong></span>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
