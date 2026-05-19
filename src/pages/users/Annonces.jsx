import React, { useState, useEffect } from 'react';

export default function Annonces() {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/announcements/')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('Données brutes de l\'API :', data);
        const liste = data.results || data;
        console.log('Liste extraite :', liste);
        setAnnonces(liste);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur fetch :', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div style={{ color: 'red' }}>Erreur : {error}</div>;
  if (annonces.length === 0) return <div>Aucune annonce trouvée (vérifie la console).</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Annonces</h1>
      {annonces.map(annonce => (
        <div key={annonce.id} style={{ border: '1px solid #ddd', marginBottom: '1rem', padding: '1rem' }}>
          <h3>{annonce.title}</h3>
          <p>{annonce.content || 'Pas de contenu'}</p>
          {annonce.image && <img src={annonce.image} alt={annonce.title} style={{ maxWidth: '100%' }} />}
        </div>
      ))}
    </div>
  );
}