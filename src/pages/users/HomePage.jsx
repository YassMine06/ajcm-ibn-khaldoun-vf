import React from 'react';
import Header from './Accueil/Header';
import APropos from './Accueil/APropos';
import NosEvenements from './Accueil/NosEvenement';
import Annonces from './Accueil/Annonces';
import Partenaires from './Accueil/Partenaires';
import CTABanner from './Accueil/CTABanner';
import Footer from '../../components/Footer';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="page-enter">
      <Header />
      <main>
        <APropos />
        <Annonces />
        <NosEvenements />
        <Partenaires />
      </main>
      <CTABanner />
      <Footer />
    </div>
  );
};

export default HomePage;
