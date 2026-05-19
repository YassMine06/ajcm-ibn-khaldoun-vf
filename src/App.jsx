import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';

// Public pages
import HomePage from './pages/users/HomePage';
import DescriptionPage from './pages/users/DescriptionPage';
import EvenementsPage from './pages/users/EvenementsPage';
import EventDetailsPage from './pages/users/EventDetailsPage';
import AnnoncesPage from './pages/users/AnnoncesPage';
import InscriptionPage from './pages/users/InscriptionPage';
import CalendrierPage from './pages/users/CalendrierPage';
import ContactPage from './pages/users/ContactPage';
import './App.css';
import './platform.css';

// Platform pages
import AdminLogin from './pages/admin/AdminLogin';
import MemberLogin from './pages/member/MemberLogin';
import AdminLayout from './layouts/AdminLayout';
import MemberLayout from './layouts/MemberLayout';

import Statistics from './pages/admin/Statistics';
import ActivitiesManager from './pages/admin/ActivitiesManager';
import AnnoncesManager from './pages/admin/AnnoncesManager';
import UsersManager from './pages/admin/UsersManager';
import AdminCalendar from './pages/admin/AdminCalendar';
import PartnersManager from './pages/admin/PartnersManager';
import RegistrationsManager from './pages/admin/RegistrationsManager';
import AIModule from './pages/admin/AIModule';
import ContactManager from './pages/admin/ContactManager';

import MemberProfile from './pages/member/MemberProfile';
import EditProfile from './pages/member/EditProfile';
import RegisterActivities from './pages/member/RegisterActivities';
import MemberCalendar from './pages/member/MemberCalendar';
import MemberHistory from './pages/member/MemberHistory';

export default function App() {
  const [user, setUser] = useState(() => {
    /* Nettoyer les tokens expirés au démarrage */
    const cleanExpiredToken = (key) => {
      const token = localStorage.getItem(key);
      if (!token) return;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 <= Date.now()) {
          localStorage.removeItem(key);
          if (key === 'adminToken') localStorage.removeItem('adminUser');
          if (key === 'access')     { localStorage.removeItem('refresh'); localStorage.removeItem('user'); }
        }
      } catch { localStorage.removeItem(key); }
    };
    cleanExpiredToken('adminToken');
    cleanExpiredToken('access');

    try {
      const loggedInUser = localStorage.getItem('user');
      return loggedInUser ? JSON.parse(loggedInUser) : null;
    } catch (e) {
      return null;
    }
  });

  const handleUpdateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const onLoginSuccess = (userData) => {
    setUser(userData);
  };

  /* Vérifie qu'un token JWT existe ET n'est pas expiré */
  const isTokenValid = (key) => {
    const token = localStorage.getItem(key);
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  const isAuthenticatedAdmin  = () => isTokenValid('adminToken');
  const isAuthenticatedMember = () => isTokenValid('access');

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<div className="app-container"><HomePage /></div>} />
        <Route path="/description" element={<div className="app-container"><DescriptionPage /></div>} />
        <Route path="/evenements" element={<div className="app-container"><EvenementsPage /></div>} />
        <Route path="/evenements/:id" element={<div className="app-container"><EventDetailsPage /></div>} />
        <Route path="/annonces" element={<div className="app-container"><AnnoncesPage /></div>} />
        <Route path="/calendrier" element={<div className="app-container"><CalendrierPage /></div>} />
        <Route path="/contact" element={<div className="app-container"><ContactPage /></div>} />
        <Route path="/inscription" element={<div className="app-container"><InscriptionPage /></div>} />

        {/* Login Routes */}
        <Route path="/admin/login" element={
          isAuthenticatedAdmin() ? <Navigate to="/admin/statistics" replace /> : <AdminLogin onLoginSuccess={onLoginSuccess} />
        } />

        <Route path="/membre/login" element={
          isAuthenticatedMember() ? <Navigate to="/membre/profile" replace /> : <MemberLogin onLoginSuccess={onLoginSuccess} />
        } />

        {/* Redirection générique si ancien lien utilisé */}
        <Route path="/login" element={<Navigate to="/membre/login" replace />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          isAuthenticatedAdmin() ?
            <div className="platform-app"><AdminLayout /></div> :
            <Navigate to="/admin/login" replace />
        }>
          <Route path="statistics" element={<Statistics />} />
          <Route path="activities" element={<ActivitiesManager />} />
          <Route path="annonces" element={<AnnoncesManager />} />
          <Route path="members" element={<UsersManager />} />
          <Route path="users" element={<UsersManager />} />
          <Route path="calendar" element={<AdminCalendar />} />
          <Route path="partners" element={<PartnersManager />} />
          <Route path="registrations" element={<RegistrationsManager />} />
          <Route path="registrations/:eventName" element={<RegistrationsManager />} />
          <Route path="ai-module" element={<AIModule />} />
          <Route path="contact-messages" element={<ContactManager />} />
          <Route index element={<Navigate to="statistics" replace />} />
        </Route>

        {/* Member Routes — protégées : token 'access' valide requis */}
        <Route path="/membre" element={
          isAuthenticatedMember() ?
            <div className="platform-app"><MemberLayout /></div> :
            <Navigate to="/membre/login" replace />
        }>
          <Route path="profile"             element={<MemberProfile />} />
          <Route path="registrations"       element={<RegisterActivities />} />
          <Route path="register-activities" element={<RegisterActivities />} />
          <Route path="edit-profile"        element={<EditProfile user={user} onUpdateUser={handleUpdateUser} />} />
          <Route path="calendar"            element={<MemberCalendar />} />
          <Route path="history"             element={<MemberHistory />} />
          <Route index element={<Navigate to="profile" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
