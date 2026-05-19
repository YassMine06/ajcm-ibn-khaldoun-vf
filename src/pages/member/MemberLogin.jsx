import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, Mail, ArrowRight, UserCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import logoAjcm from '../../assets/logo_ajcm.svg';
import '../LoginPages.css';

export default function MemberLogin({ onLoginSuccess }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // POST /api/auth/login/
      const response = await axios.post('http://localhost:8000/api/auth/login/', {
        email: email.trim().toLowerCase(),
        password,
      });

      const { access, refresh, user } = response.data;

      // Stocker les tokens et les infos utilisateur
      localStorage.setItem('access', access);
      if (refresh) localStorage.setItem('refresh', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      if (onLoginSuccess) onLoginSuccess(user);

      navigate('/membre/profile', { replace: true });
    } catch (err) {
      console.error('Erreur de connexion:', err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Identifiants incorrects. Vérifiez votre e-mail et mot de passe.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page member-theme">
      <div className="login-container">
        <div className="login-card">

          {/* En-tête */}
          <div className="login-header">
            <div className="login-logo">
              <img src={logoAjcm} alt="Logo AJCM" />
            </div>
            <h2>Espace Membre</h2>
            <p>Connectez-vous pour accéder à vos activités</p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleLogin} className="login-form" noValidate>

            {/* Message d'erreur */}
            {error && (
              <div className="login-error" role="alert">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Champ Email */}
            <div className="form-group">
              <label htmlFor="member-email">Adresse e-mail</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="member-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="votre.email@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label htmlFor="member-password" style={{ margin: 0 }}>Mot de passe</label>
                <a href="#" className="forgot-password" tabIndex={-1}>Mot de passe oublié ?</a>
              </div>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <Lock size={18} className="input-icon" />
                <input
                  id="member-password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{ position: 'absolute', right: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
                  tabIndex={-1}
                  aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              className="login-btn"
              disabled={isLoading || !email || !password}
            >
              {isLoading
                ? <Spinner size={20} color="white" />
                : <><span>Connexion à mon espace</span><ArrowRight size={18} /></>
              }
            </button>
          </form>

          {/* Pied de page */}
          <div className="login-footer signup-prompt">
            <UserCircle size={18} />
            <span>
              Pas encore membre ?{' '}
              <Link to="/inscription?tab=membre">Rejoignez-nous</Link>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
