import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import logoAjcm from '../../assets/logo_ajcm.svg';
import '../LoginPages.css';

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/api/auth/login/', {
        email,
        password
      });

      const { access, user } = response.data;

      // Vérifier si l'utilisateur a les droits d'admin
      if (user.is_superuser || user.is_staff) {
        localStorage.setItem('adminToken', access);
        localStorage.setItem('user', JSON.stringify(user));

        if (onLoginSuccess) {
          onLoginSuccess(user);
        }

        navigate('/admin/statistics', { replace: true });
      } else {
        setError("Accès refusé : Ce compte n'a pas les privilèges d'administrateur.");
        localStorage.removeItem('adminToken'); // Sécurité
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Identifiants incorrects ou problème de connexion."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page admin-theme">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <img src={logoAjcm} alt="AJCM Logo" />
            </div>
            <h2>Portail Administrateur</h2>
            <p>Accès sécurisé réservé au bureau de l'AJCM</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {error && (
              <div className="login-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label>Adresse e-mail</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  required
                  placeholder="admin@ajcm.ma"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? (
                <Spinner size={20} color="white" />
              ) : (
                <>Se connecter <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="login-footer">
            <ShieldCheck size={16} />
            <span>Connexion chiffrée de bout en bout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
