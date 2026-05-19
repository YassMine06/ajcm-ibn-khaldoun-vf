import React, { useEffect, useRef, useState } from 'react';
import './NotreImpact.css';

/* ── Icons ── */
const PeopleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="7" r="3"/><path d="M3 21v-2a6 6 0 0 1 9-5.196"/>
    <circle cx="17" cy="11" r="3"/><path d="M21 21v-2a4 4 0 0 0-6-3.46"/>
  </svg>
);
const FolderIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const HandIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

/* ── Animated counter ── */
const Counter = ({ target, suffix }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1500;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref} className="stat-number">{count}{suffix}</span>;
};

const stats = [
  { Icon: PeopleIcon, value: 120, suffix: '+', label: 'Membres actifs' },
  { Icon: FolderIcon, value: 25,  suffix: '+', label: 'Projets réalisés' },
  { Icon: HeartIcon,  value: 500, suffix: '+', label: 'Bénéficiaires' },
  { Icon: HandIcon,   value: 10,  suffix: '+', label: 'Partenaires' },
];

const NotreImpact = () => (
  <section className="impact-section" id="impact">
    <div className="impact-container">
      <div className="impact-bar">
        {stats.map((s, i) => (
          <React.Fragment key={s.label}>
            <div className="impact-stat">
              <div className="impact-icon-wrap">
                <s.Icon />
              </div>
              <div className="impact-text">
                <Counter target={s.value} suffix={s.suffix} />
                <span className="stat-label">{s.label}</span>
              </div>
            </div>
            {i < stats.length - 1 && <div className="stat-divider" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  </section>
);

export default NotreImpact;
