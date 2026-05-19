import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import NotreImpact from './NotreImpact';
import './Header.css';

const Header = () => {
  return (
    <header className="site-header" id="accueil">
      <Navbar />

      <div className="hero-section">
        <div className="hero-background">
          <img src="/background.png" alt="AJCM Association Background" />
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-content">
          <h1 className="hero-title">
            CULTIVER LA <span className="hero-title-highlight">CITOYENNETÉ.</span><br />
            INSPIRER LA <span className="hero-title-highlight">JEUNESSE.</span>
          </h1>
          {/* <p className="hero-subtitle">
            Organisation éducative, culturelle et de recherche,<br />
            bénévole et indépendante au service de la citoyenneté<br />
            et du développement humain depuis 1976.
          </p> */}
          <div className="hero-impact-wrapper">
            <NotreImpact />
          </div>
          <br/>

          <div className="hero-buttons">
            <a href="#evenements" className="btn-primary-hero">DÉCOUVRIR NOS ÉVÉNEMENTS</a>
            <Link to="/inscription" className="btn-secondary-hero">NOUS REJOINDRE</Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
