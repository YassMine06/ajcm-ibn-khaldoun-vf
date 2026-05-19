import React, { useEffect } from 'react';
import './DescriptionPage.css';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const pillars = [
  {
    id: 1, 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
    title: 'Éducation, Citoyenneté et Recherche',
    items: [
      "Valeurs civiques : Promotion de la démocratie participative et éducation aux valeurs de la citoyenneté.",
      "Enseignement : Appui au préscolaire, à l'éducation non formelle et lutte contre l'analphabétisme.",
      "Recherche : Création et soutien de centres d'études et de recherche pluridisciplinaires.",
    ],
  },
  {
    id: 2, 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
    title: 'Action Sociale et Inclusion',
    items: [
      "Accompagnement : Soutien aux femmes, jeunes et seniors via des centres de médiation familiale et d'écoute.",
      "Éducation inclusive : Animation de centres de protection de l'enfance et intégration des personnes aux besoins spécifiques.",
    ],
  },
  {
    id: 3, 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
      </svg>
    ),
    title: 'Formation et Développement Économique',
    items: [
      "Entrepreneuriat : Accompagnement des jeunes porteurs de projets et formation des cadres administratifs et éducatifs.",
      "Artisanat : Création et supervision d'ateliers d'apprentissage professionnel.",
      "Partenariats : Collaboration avec les secteurs public/privé et organisations internationales pour l'emploi et l'environnement.",
    ],
  },
  {
    id: 4, 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
      </svg>
    ),
    title: 'Animation, Culture et Rayonnement',
    items: [
      "Événementiel : Organisation de festivals, séminaires, compétitions sportives et artistiques.",
      "Mobilité : Gestion de colonies de vacances et de voyages d'échange, au Maroc et à l'étranger.",
      "Proximité : Animation de bibliothèques mobiles, de clubs éducatifs et publication de supports de communication.",
    ],
  },
];

const values = [
  { text: 'Citoyenneté active', icon: '🌟' },
  { text: 'Indépendance', icon: '🕊️' },
  { text: 'Solidarité inclusive', icon: '🤝' },
  { text: 'Excellence éducative', icon: '📚' },
  { text: 'Rayonnement', icon: '🌍' },
  { text: 'Ouverture', icon: '💡' },
];

const DescriptionPage = () => {
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="description-page page-enter">
      <Navbar />

      <header className="desc-hero">
        <div className="desc-hero-bg">
          <div className="desc-hero-overlay"></div>
        </div>
        <div className="container desc-hero-content">
          <div className="badge-identity">Découvrez l'AJCM</div>
          <h1 className="animate-title">Notre Identité</h1>
          <p className="desc-subtitle animate-subtitle">Une mission ancrée dans l'histoire, une vision tournée vers l'avenir.</p>
        </div>
      </header>

      <section className="section-history">
        <div className="container">
          <div className="section-header center-align">
            <h2>Notre Histoire</h2>
            <div className="section-divider"></div>
          </div>
          <div className="history-grid">
            <div className="history-text">
              <div className="creation-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>Fondée le <strong>1er Août 1976</strong></span>
              </div>
              <p className="history-para">
                Née à Casablanca en tant qu'association locale dédiée à l'enfance et à la jeunesse, 
                l'AJCM a toujours mis l'humain au cœur de ses préoccupations. Animée par une volonté de fer, 
                elle franchit une étape stratégique en devenant régionale en 2015.
              </p>
              <p className="history-para">
                Depuis 2019, l'association s'est hissée au rang d'organisation nationale. Elle s'appuie aujourd'hui 
                sur un réseau solide et une expertise reconnue à travers tout le Maroc.
              </p>
            </div>
            
            <div className="history-visual">
              <div className="glass-slogan-card">
                <div className="quote-mark">"</div>
                <p className="slogan-text">
                  Organisation éducative, culturelle, de recherche, bénévole et indépendante, 
                  elle a pour mission principale de soutenir diverses activités publiques ou privées 
                  au profit des enfants, des jeunes, des femmes, des personnes âgées et des étudiants chercheurs. 
                  Elle ne revendique aucune affiliation partisane, syndicale ou idéologique.
                </p>
              </div>
              <div className="history-blob-bg"></div>
              <img src="/logo_ajcm.svg" alt="AJCM Logo" className="history-logo-float" />
            </div>
          </div>
        </div>
      </section>

      <section className="section-pillars">
        <div className="container">
          <div className="section-header center-align">
            <h2>Nos 4 Piliers Stratégiques</h2>
            <div className="section-divider"></div>
            <p className="section-desc">Les fondations sur lesquelles repose notre action associative au quotidien.</p>
          </div>
          
          <div className="pillars-compact-grid">
            {pillars.map(pillar => (
              <div key={pillar.id} className="pillar-compact-item">
                <div className="pillar-icon-side">
                  <div className="icon-ring">
                    {pillar.icon}
                  </div>
                </div>
                <div className="pillar-content-side">
                  <h3 className="pillar-compact-title">{pillar.title}</h3>
                  <ul className="pillar-compact-list">
                    {pillar.items.map((item, idx) => (
                      <li key={idx}>
                        <span className="compact-bullet"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-values">
        <div className="container">
          <div className="section-header center-align">
            <h2>Valeurs Fondamentales</h2>
            <div className="section-divider"></div>
          </div>
          <div className="values-wrapper">
            <div className="values-content">
              <p className="values-intro">
                Ce qui nous rassemble et guide chacune de nos décisions. Nos valeurs sont le ciment 
                de notre communauté et la garantie de notre impact.
              </p>
            </div>
            
            <div className="values-badges-grid">
              {values.map((val, idx) => (
                <div key={idx} className="value-badge" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <span className="value-icon">{val.icon}</span>
                  <span className="value-text">{val.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-message">
        <div className="container">
          <div className="section-header center-align">
            <h2>Mot du Secrétaire Général</h2>
            <div className="section-divider"></div>
          </div>
          <div className="message-premium-card">
            <div className="message-bg-pattern"></div>
            <div className="message-quote-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
            
            <div className="message-grid">
              <div className="message-author-box">
                <div className="author-avatar-wrap">
                  <div className="author-avatar-placeholder">
                    <span>JH</span>
                  </div>
                </div>
                <div className="author-identity">
                  <h3>Jawad Hadi</h3>
                  <div className="author-line"></div>
                  <p>Secrétaire Général</p>
                </div>
              </div>
              
              <div className="message-content arabic-premium-text">
                <p>
                  جمعية شباب المواطنة المغربية ليست مجرد إطار جمعوي، بل هي عائلة حقيقية تُجسد معنى الانتماء قولاً وفعلاً.
                  داخلها تُبنى العلاقات الإنسانية الصادقة، وتمتد جسور التواصل عبر مختلف ربوع الوطن، في روح من الأخوة والتطوع والمسؤولية.
                </p>
                <p>
                  هي جمعية جعلت من التكوين ركيزة أساسية لعملها، حيث وفرت فضاءات للتعلم المستمر،
                  سواء من خلال دورات حضورية أو عن بعد، مما ساهم في تأهيل الشباب وتعزيز قدراتهم في مجالات متعددة.
                </p>
                <p>
                  فخور بانتمائي إلى هذه العائلة، التي لا تكتفي بالشعارات، بل تترجم قيم المواطنة إلى مبادرات وأفعال ملموسة.
                </p>
                
                <div className="arabic-signature">
                  <strong>جواد حاضي</strong>
                  <span>الكاتب العام للمكتب المركزي</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DescriptionPage;
