import React, { useState } from 'react';
import { User, Lock, LogIn, Shield, AlertCircle } from 'lucide-react';
import authService from '../api/authService';
import backgroundHome from '../assets/background0.png';
import logoAjcm from '../assets/logo_ajcm.svg';
import './LoginPage.css';
import Spinner from '../components/common/Spinner';

export default function LoginPage({ onLogin }) {
  const [activeTab, setActiveTab] = useState('admin'); // 'admin' or 'member'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userData = await authService.login(username, password);
      
      // Basic role validation
      if (activeTab === 'admin' && userData.role !== 'admin') {
        throw new Error("Accès refusé. Ce compte n'est pas un administrateur.");
      }
      if (activeTab === 'member' && userData.role !== 'member') {
        throw new Error("Accès refusé. Veuillez vous connecter via l'onglet Admin.");
      }

      onLogin(userData);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ '--login-bg': `url(${backgroundHome})` }}>
      {/* Left panel */}
      <div className="login-left">
        <div className="login-left-content">
          <div className="login-header-mini">
            <div className="login-logo-mini">
              <img src={logoAjcm} alt="Logo AJCM" />
            </div>
            <div className="nav-logo-text">
              <span className="nav-logo-title">A.J.C.M</span>
              <span className="nav-logo-sub">
                ASSOCIATION JEUNESSE <br />DE LA CITOYENNETÉ MAROCAINE<br />MOHAMMEDIA IBN KHALDOUN
              </span>
            </div>
          </div>
          <h1>
            Plateforme de <span>gestion</span>
          </h1>
          <p>
            Gérez vos événements, membres, partenaires et annonces depuis une interface centralisée, moderne et facile à utiliser.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-tabs">
            <button 
              className={`login-tab ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
              disabled={loading}
            >
              <Shield size={18} />
              Admin
            </button>
            <button 
              className={`login-tab ${activeTab === 'member' ? 'active' : ''}`}
              onClick={() => setActiveTab('member')}
              disabled={loading}
            >
              <User size={18} />
              Membre
            </button>
          </div>

          <div className="login-card-logo">
            <div className="login-card-icon">
              {activeTab === 'admin' ? <Shield size={28} /> : <LogIn size={28} />}
            </div>
            <h2>Connexion <span>{activeTab === 'admin' ? 'Administrateur' : 'Espace Membre'}</span></h2>
            <p>
              {activeTab === 'admin' 
                ? 'Accédez aux outils de gestion de l\'association' 
                : 'Consultez votre profil et participez aux événements'}
            </p>
          </div>

          {error && (
            <div className="error-msg">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{activeTab === 'admin' ? 'Identifiant Admin' : 'Email ou Identifiant'}</label>
              <div className="input-wrapper">
                <User size={16} />
                <input
                  type="text"
                  className="form-control"
                  placeholder={activeTab === 'admin' ? 'ex: admin' : 'votre identifiant'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <div className="input-wrapper">
                <Lock size={16} />
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              className={`btn-primary btn-block ${loading ? 'btn-loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <><Spinner size={18} color="white" /> Connexion...</>
              ) : (
                <><LogIn size={18} /> Se connecter</>
              )}
            </button>
          </form>

          <div className="login-hint">
            <strong>Aide :</strong> Utilisez vos identifiants fournis par l'AJCM.
          </div>
        </div>
      </div>
    </div>
  );
}

