# Documentation Technique : Plateforme AJCM (Admin & Membre)

Ce document décrit l'architecture, les fonctionnalités et le système de design de la plateforme intégrée au projet AJCM Ibn Khaldoun.

## 1. Architecture Globale

La plateforme est conçue comme une extension "Single Page Application" (SPA) au sein du site principal. Elle utilise `react-router-dom` pour la navigation et `axios` pour la communication avec le serveur Node.js.

### Structure des Dossiers
- `src/components/layouts/` : Contient les squelettes structurels (`AdminLayout.jsx`, `MemberLayout.jsx`).
- `src/components/pages/admin/` : Pages spécifiques à la gestion administrative.
- `src/components/pages/member/` : Pages spécifiques à l'espace membre.
- `src/platform.css` : Système de design unifié pour toute la plateforme.

## 2. Système de Routage

Les accès sont segmentés par des préfixes de route :
- `/admin/*` : Accès aux outils de gestion (protégé par rôle admin).
- `/membre/*` : Accès aux services personnels (protégé par rôle membre).

## 3. Design System (`platform.css`)

La plateforme utilise un design system distinct du site public, optimisé pour la productivité et la gestion de données.
- **Style actuel** : Floating Glassmorphism (Layout flottant, coins arrondis 24px+, flous d'arrière-plan).
- **Variables** : Utilise le préfixe `--p-` (ex: `--p-green-700`, `--p-radius-lg`).

## 4. Fonctionnalités Administrateur

| Page | Description | Composant |
| :--- | :--- | :--- |
| **Tableau de bord** | Vue d'ensemble des stats (activités, membres, annonces). | `Statistics.jsx` |
| **Événements** | CRUD complet des événements et activités de l'association. | `ActivitiesManager.jsx` |
| **Annonces** | Gestion avancée des actualités et événements (Types, Guests, Participants). | `AnnoncesManager.jsx` |
| **Membres** | Liste et gestion des comptes utilisateurs. | `UsersManager.jsx` |
| **Inscriptions** | Validation des nouvelles demandes d'adhésion. | `RegistrationsManager.jsx` |
| **Calendrier** | Planification visuelle des événements. | `CalendarManager.jsx` |
| **Partenaires** | Gestion des logos et infos partenaires. | `PartnersManager.jsx` |
| **Module IA** | Assistant intelligent pour l'administration. | `AIModule.jsx` |

## 5. Fonctionnalités Membre

| Page | Description | Composant |
| :--- | :--- | :--- |
| **Mon Profil** | Visualisation des informations personnelles. | `Profile.jsx` |
| **Dashboard** | Résumé des activités suivies et notifications. | `MemberDashboard.jsx` |
| **Inscriptions** | S'inscrire à de nouvelles activités proposées. | `RegisterActivities.jsx` |
| **Historique** | Liste des engagements passés. | `History.jsx` |
| **Calendrier Perso** | Vue temporelle des activités du membre. | `MemberCalendar.jsx` |

## 6. Flux de Données (Backend)

La plateforme communique avec un serveur Express (`server/index.js`) via les endpoints suivants :
- `/api/events` : GET, POST, PUT, DELETE.
- `/api/annonces` : GET, POST, PUT, DELETE.
- `/api/users` : Gestion des profils et authentification.
- `/api/registrations` : Flux d'inscription des membres.

Les données sont persistées dans des fichiers JS/JSON dans `src/assets/` via le module `fs` du serveur.

---
*Dernière mise à jour : Mai 2026*
