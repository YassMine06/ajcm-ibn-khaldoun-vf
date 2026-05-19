# AJCM AI Module — Documentation complète

> **Auteure** : Responsable module IA — ENSET, Projet de fin d'études  
> **Dernière mise à jour** : 17/05/2026

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Structure des fichiers](#2-structure-des-fichiers)
3. [Comment intégrer ce module dans le repo](#3-comment-intégrer-ce-module-dans-le-repo)
4. [Installation des dépendances](#4-installation-des-dépendances)
5. [Configuration Django](#5-configuration-django)
6. [Base de données — tables IA](#6-base-de-données--tables-ia)
7. [Peupler la DB avec les données historiques](#7-peupler-la-db-avec-les-données-historiques)
8. [Lancer le projet](#8-lancer-le-projet)
9. [Les 2 endpoints API](#9-les-2-endpoints-api)
10. [Frontend — Page Module IA](#10-frontend--page-module-ia)
11. [Le modèle XGBoost](#11-le-modèle-xgboost)
12. [Problèmes connus et solutions](#12-problèmes-connus-et-solutions)

---

## 1. Vue d'ensemble

Ce module IA permet à l'administrateur AJCM de :

- **Analyser & Planifier** : Donner un budget et un nombre de bénévoles disponibles pour le mois, lister les événements prévus, et laisser le modèle IA sélectionner la combinaison optimale selon un score de priorité calculé par XGBoost.
- **Ré-entraîner le modèle** : Quand un événement réel est créé sur la plateforme, ses données sont ajoutées à l'historique et le modèle se ré-entraîne automatiquement pour devenir plus précis avec le temps.

Le modèle a été entraîné sur **62 événements réels AJCM Mohammedia** avec un score de validation croisée **CV-R² = 0.797**.

---

## 2. Structure des fichiers

```
backend/
└── apps/
    └── ai/                          ← Tout le module IA est ici
        ├── __init__.py
        ├── admin.py                 ← Interface admin Django pour voir les données IA
        ├── apps.py
        ├── models.py                ← 2 tables : AIEventHistory + AITrainingRun
        ├── serializers.py           ← Validation des inputs API
        ├── views.py                 ← Logique des 2 endpoints (optimize + retrain)
        ├── urls.py                  ← Routes : /api/ai/optimize/ et /api/ai/retrain/
        └── ml/
            ├── predictor.py              ← Charge le modèle et fait les prédictions
            ├── train.py                  ← Ré-entraîne le modèle XGBoost
            ├── import_ai_history.py      ← Script one-time : importe les 62 événements en DB
            ├── xgb_model.pkl             ← Modèle XGBoost entraîné (binaire)
            ├── xgb_label_encoder.pkl     ← Encodeur des types d'événements (binaire)
            └── Data_new_LABELED.xlsx     ← Dataset des 62 événements AJCM réels

src/
└── pages/
    └── admin/
        ├── AIModule.jsx             ← Page frontend du module IA
        └── AIModule.css             ← Styles de la page
```

---

## 3. Comment intégrer ce module dans le repo

### Pour la coéquipière qui reçoit ce travail

Ce module est poussé dans une **branche séparée** pour ne pas toucher le travail existant sur `main`.

```bash
# 1. Cloner le repo (si pas encore fait)
git clone https://github.com/<nom-repo>/ajcm-ibn-khaldoun.git
cd ajcm-ibn-khaldoun

# 2. Se mettre sur la branche du module IA
git checkout feature/ai-module

# 3. (Optionnel) Voir ce qui a changé par rapport à main
git diff main --name-only
```

### Pour merger dans main quand tout est validé

```bash
git checkout main
git merge feature/ai-module
```

---

## 4. Installation des dépendances

Ajouter ces lignes dans `backend/requirements.txt` si elles n'y sont pas encore :

```
xgboost
scikit-learn
pandas
openpyxl
joblib
numpy
```

Puis installer :

```bash
cd backend
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
```

---

## 5. Base de données — tables IA

Le module crée **2 nouvelles tables** dans la base de données :

### `ai_event_history`

Stocke tous les événements historiques utilisés pour entraîner le modèle.
C'est l'équivalent en base de données du fichier `Data_new_LABELED.xlsx`.

| Colonne               | Type          | Description                             |
| --------------------- | ------------- | --------------------------------------- |
| `event_name`          | CharField     | Nom de l'événement                      |
| `type`                | CharField     | Type (Art, Workshop, Medical Convoy...) |
| `duration`            | CharField     | Durée en format texte (ex: "4h")        |
| `duration_h`          | FloatField    | Durée en heures (ex: 4.0)               |
| `cost`                | FloatField    | Coût réel en MAD                        |
| `volunteers`          | IntegerField  | Nombre de bénévoles utilisés            |
| `social_impact`       | FloatField    | Score calculé (0 à 1)                   |
| `cost_efficiency`     | FloatField    | Score calculé (0 à 1)                   |
| `volunteer_intensity` | FloatField    | Score calculé (0 à 1)                   |
| `priority_score`      | FloatField    | Score final IA                          |
| `added_at`            | DateTimeField | Date d'ajout                            |
| `used_for_training`   | BooleanField  | Si utilisé dans le dernier entraînement |

### `ai_training_run`

Log de chaque ré-entraînement du modèle.

| Colonne        | Type          | Description                                           |
| -------------- | ------------- | ----------------------------------------------------- |
| `trained_at`   | DateTimeField | Date du ré-entraînement                               |
| `total_events` | IntegerField  | Nombre d'événements utilisés                          |
| `cv_r2_mean`   | FloatField    | Score moyen CV-R²                                     |
| `cv_r2_std`    | FloatField    | Écart-type CV-R²                                      |
| `triggered_by` | CharField     | Nom de l'événement qui a déclenché le ré-entraînement |

### Créer les tables (migrations)

```bash
cd backend
venv\Scripts\activate
python manage.py makemigrations ai
python manage.py migrate
```

> ✅ Après `migrate`, les deux tables existent dans la DB **mais sont vides**.  
> Voir section 6 pour les peupler.

---

## 6. Peupler la DB avec les données historiques

### Qu'est-ce que `import_ai_history.py` ?

Ce script lit le fichier `Data_new_LABELED.xlsx` (le dataset de 62 événements AJCM réels avec leurs scores calculés) et insère chaque ligne dans la table `ai_event_history` de la base de données.

**Pourquoi c'est nécessaire ?**  
Le modèle XGBoost a été entraîné sur ce dataset. Quand un admin ajoute un nouvel événement via `/api/ai/retrain/`, le modèle se ré-entraîne sur `ai_event_history` + le nouvel événement. Si la table est vide, le ré-entraînement échoue ou donne de très mauvais résultats.

**⚠️ Ce script est à exécuter une seule fois** après chaque `migrate` sur un nouveau projet.

```bash
cd backend
venv\Scripts\activate
python apps/ai/ml/import_ai_history.py
```

Résultat attendu :

```
✅ 62 événements importés dans ai_event_history.
```

> Si vous voyez une erreur "table doesn't exist", refaire `python manage.py migrate` d'abord.

---

## 7. Lancer le projet

```bash
# Terminal 1 — Backend Django
cd ajcm-ibn-khaldoun/backend
venv\Scripts\activate
python manage.py runserver
# → http://127.0.0.1:8000

# Terminal 2 — Frontend React/Vite
cd ajcm-ibn-khaldoun
npm run dev
# → http://localhost:5173
```

**Vérifications :**

- `http://127.0.0.1:8000/api/docs/` → Swagger UI, section "ai" doit apparaître avec 2 endpoints
- `http://localhost:5173/admin/ai-module` → Page Module IA

---

## 8. Les 2 endpoints API

### POST `/api/ai/optimize/`

Reçoit un budget, un nombre de bénévoles, et une liste d'événements.  
Retourne les événements sélectionnés (optimaux) et rejetés (budget/bénévoles insuffisants).

**Input :**

```json
{
  "budget": 8000,
  "volunteers": 18,
  "events": [
    {
      "name": "Caravane Médicale",
      "category": "Medical Convoy",
      "duration_hours": 7,
      "forced": true
    },
    {
      "name": "Atelier Couture",
      "category": "Workshop",
      "duration_hours": 3,
      "forced": false
    },
    {
      "name": "Expo Art",
      "category": "Art",
      "duration_hours": 2,
      "forced": false
    }
  ]
}
```

> `forced: true` = cet événement est toujours inclus même s'il consomme beaucoup de ressources.

**Output :**

```json
{
  "selected": [
    {
      "name": "Caravane Médicale",
      "type": "Medical Convoy",
      "priority_score": 0.7089,
      "estimated_cost": 2785.71,
      "estimated_volunteers": 5,
      "forced": true
    }
  ],
  "rejected": [
    {
      "name": "Expo Art",
      "type": "Art",
      "reason": "bénévoles 3 > restants 2"
    }
  ],
  "budget_used": 3374.6,
  "budget_remaining": 4625.4,
  "volunteers_used": 10.0,
  "volunteers_remaining": 8.0
}
```

> ⚠️ `volunteers_used` et `volunteers_remaining` sont des **floats** — arrondir avec `Math.floor()` côté frontend.

---

### Working on it...

### POST `/api/ai/retrain/`

Ajoute un nouvel événement réel à l'historique et ré-entraîne le modèle XGBoost.  
À appeler après la création d'un événement réel sur la plateforme.

**Input :**

```json
{
  "event_name": "Caravane médicale Ouled Haddou",
  "category": "Medical Convoy",
  "duration": "8h",
  "cost": 3500,
  "volunteers": 7
}
```

**Output :**

```json
{
  "message": "✅ 'Caravane médicale Ouled Haddou' ajouté. Modèle ré-entraîné.",
  "total_events": 63,
  "cv_r2_mean": 0.7943,
  "cv_r2_std": 0.1201,
  "new_event": {
    "ai_type": "Medical Convoy",
    "duration_h": 8.0,
    "social_impact": 0.9317,
    "cost_efficiency": 0.3,
    "volunteer_intensity": 0.3889,
    "priority_score": 0.6336
  }
}
```

---

### Le CATEGORY_MAP — traduction des types

Le frontend et les coéquipières utilisent parfois des noms de catégories différents de ceux du modèle IA.  
Le `CATEGORY_MAP` dans `views.py` traduit automatiquement :

```python
CATEGORY_MAP = {
    'workshop':          'Workshop',
    'formation':         'Formation',
    'art':               'Art',
    'camping':           'Camping',
    'conference':        'Conférence',
    'conférence':        'Conférence',
    'culture':           'Culture',
    'medical convoy':    'Medical Convoy',
    'sante':             'Medical Convoy',
    'santé':             'Medical Convoy',
    'table ronde':       'Table Ronde',
    'solidarite':        'solidarity_donation',
    'solidarité':        'solidarity_donation',
    'solidarity_donation':   'solidarity_donation',
    'solidarity_material':   'solidarity_material',
}
```

> Si les coéquipières ajoutent de nouveaux types dans leur modèle `Event`, il faut ajouter la traduction ici.

---

## 9. Frontend — Page Module IA

**Fichiers :** `src/pages/admin/AIModule.jsx` + `AIModule.css`  
**Route :** `/admin/ai-module`

### Ce que fait la page

1. L'admin saisit le **budget total** et les **bénévoles disponibles** du mois
2. L'admin ajoute des événements planifiés (nom, type, durée, forcé ou non)
3. Clic **"Analyser & Planifier"** → appel `POST /api/ai/optimize/`
4. Affichage des résultats : événements retenus, rejetés, budget et bénévoles restants

### Point 2 — Ré-entraînement (à brancher, pas encore fait)

Quand un événement est créé via la page `/admin/activities`, il faut appeler `POST /api/ai/retrain/` après la création réussie. Ce point **n'est pas encore implémenté** — prochaine étape.

---

## 10. Le modèle XGBoost

| Paramètre              | Valeur                                                                        |
| ---------------------- | ----------------------------------------------------------------------------- |
| Algorithme             | XGBoost Regressor                                                             |
| CV-R²                  | 0.797                                                                         |
| Dataset d'entraînement | 62 événements AJCM Mohammedia réels                                           |
| Features utilisées     | Type (encodé), Durée (h), Social Impact, Cost Efficiency, Volunteer Intensity |

**Formule du Priority Score :**

```
Priority Score = 0.6 × Social_Impact + 0.3 × Cost_Efficiency + 0.1 × Volunteer_Intensity
```

**Types d'événements reconnus par le modèle (valeurs exactes) :**

```
Art, Camping, Conférence, Culture, Formation,
Medical Convoy, Table Ronde, Workshop,
solidarity_donation, solidarity_material
```

**Régénérer les fichiers .pkl si besoin :**

```bash
cd backend
python apps/ai/ml/train.py
```

---
