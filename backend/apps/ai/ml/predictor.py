"""
predictor.py — Logique centrale de l'IA AJCM
=============================================
Ce module traduit le travail des notebooks en fonctions Python réutilisables.

Notebooks d'origine :
  - 02_2_xgboost.ipynb  → entraînement + sauvegarde du modèle
  - 04_optimization_with_duration.ipynb → greedy optimizer
  - 05_pipeline_new_events.ipynb → ajout d'événement + ré-entraînement

Usage depuis Django :
    from apps.ai.ml.predictor import predict_priority, optimize_events

Types en base de données (Event.TYPE_CHOICES) vs types du modèle XGBoost :
  La base utilise des clés MAJUSCULES (ex: 'ART', 'SANTE').
  Le modèle a été entraîné sur des noms mixtes (ex: 'Art', 'Medical Convoy').
  DB_TO_MODEL_TYPE effectue la conversion avant chaque prédiction.
"""

import os
import logging
import joblib
import numpy as np
import pandas as pd
from pathlib import Path

logger = logging.getLogger(__name__)

# ── Chemins des fichiers modèle ──────────────────────────────────────────────
ML_DIR = Path(__file__).parent
MODEL_PATH   = ML_DIR / 'xgb_model.pkl'
ENCODER_PATH = ML_DIR / 'xgb_label_encoder.pkl'

# ── Mapping : types DB (majuscules) → types du modèle XGBoost ────────────────
# La base de données stocke les types en MAJUSCULES (ex: 'ART', 'SANTE').
# Le modèle XGBoost a été entraîné sur les types de l'Excel (ex: 'Art',
# 'Medical Convoy', 'solidarity_donation').
# Ce dictionnaire fait le pont entre les deux.
DB_TO_MODEL_TYPE = {
    # Correspondances directes
    'ART':         'Art',
    'CULTURE':     'Culture',
    'FORMATION':   'Formation',
    # Correspondances approchées
    'SANTE':       'Medical Convoy',      # impact médical élevé → Medical Convoy
    'SOLIDARITE':  'solidarity_donation', # action solidaire
    'JEUNESSE':    'Workshop',            # activité jeunesse → atelier
    'SPORT':       'Camping',             # activité physique/plein air
    'EVENEMENT':   'Conférence',          # événement général → conférence
    'CITOYENNETE': 'Table Ronde',         # débat citoyen
    'AUTRE':       'Workshop',            # fallback
}

# ── Constantes (issues des notebooks + données réelles de la DB) ──────────────
# Social Impact moyen par type du MODÈLE (noms Excel)
SOCIAL_IMPACT_BY_TYPE = {
    # Types présents dans l'Excel (valeurs mesurées)
    'Art':                  0.70,
    'Camping':              0.55,
    'Conférence':           0.79,
    'Culture':              0.65,
    'Formation':            0.72,
    'Medical Convoy':       0.93,
    'Table Ronde':          0.55,
    'Workshop':             0.67,
    'solidarity_donation':  0.90,
    'solidarity_material':  0.80,
}

# Valeurs max utilisées pour normaliser (issues de l'analyse exploratoire)
MAX_COST       = 5000.0   # MAD
MAX_VOLUNTEERS = 18.0

# ── Statistiques par type pour l'optimisation (notebook 04) ──────────────────
# Coût moyen, bénévoles et durée estimés par type du MODÈLE (noms Excel)
TYPE_STATS = {
    # Valeurs mesurées depuis l'Excel
    'Art':                  {'mean_cost': 608,  'mean_volunteers': 3,  'mean_duration_h': 3},
    'Camping':              {'mean_cost': 3400, 'mean_volunteers': 12, 'mean_duration_h': 64},
    'Conférence':           {'mean_cost': 533,  'mean_volunteers': 6,  'mean_duration_h': 2},
    'Culture':              {'mean_cost': 990,  'mean_volunteers': 5,  'mean_duration_h': 2},
    'Formation':            {'mean_cost': 850,  'mean_volunteers': 5,  'mean_duration_h': 6},
    'Medical Convoy':       {'mean_cost': 2667, 'mean_volunteers': 6,  'mean_duration_h': 7},
    'Table Ronde':          {'mean_cost': 500,  'mean_volunteers': 5,  'mean_duration_h': 2},
    'Workshop':             {'mean_cost': 589,  'mean_volunteers': 5,  'mean_duration_h': 3},
    'solidarity_donation':  {'mean_cost': 1217, 'mean_volunteers': 11, 'mean_duration_h': 4},
    'solidarity_material':  {'mean_cost': 2875, 'mean_volunteers': 5,  'mean_duration_h': 4},
}

# ── Normalisation du type avant prédiction ─────────────────────────────────────────

def normalize_event_type(event_type: str) -> str:
    """
    Convertit n'importe quel type d'événement (DB code ou saisie libre)
    vers le type reconnu par le modèle XGBoost.

    Exemples :
        'ART'        -> 'Art'
        'SANTE'      -> 'Medical Convoy'
        'Sante'      -> 'Medical Convoy'
        'Art'        -> 'Art'          (déjà correct)
        'atelier'    -> 'Workshop'     (correspondance partielle)
    """
    # 1. Essai direct : DB majuscule (ex: 'ART', 'SANTE')
    upper = event_type.strip().upper()
    if upper in DB_TO_MODEL_TYPE:
        return DB_TO_MODEL_TYPE[upper]

    # 2. Essai direct : déjà un type du modèle (ex: 'Art', 'Workshop')
    if event_type in SOCIAL_IMPACT_BY_TYPE:
        return event_type

    # 3. Correspondance partielle insensible à la casse
    lower = event_type.strip().lower()
    for model_type in SOCIAL_IMPACT_BY_TYPE:
        if lower in model_type.lower() or model_type.lower() in lower:
            return model_type

    # 4. Fallback : Workshop (valeurs moyennes)
    logger.warning(
        "Type '%s' non reconnu, utilisation du fallback 'Workshop'", event_type
    )
    return 'Workshop'


def load_model():
    """
    Charge le modèle XGBoost et l'encodeur depuis le dossier ml/.
    Lève une erreur claire si les fichiers .pkl n'existent pas encore.
    """
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Modèle introuvable : {MODEL_PATH}\n"
            "Veuillez exécuter le notebook 02_2_xgboost.ipynb pour générer "
            "xgb_model.pkl, puis le copier dans apps/ai/ml/"
        )
    if not ENCODER_PATH.exists():
        raise FileNotFoundError(
            f"Encodeur introuvable : {ENCODER_PATH}\n"
            "Veuillez exécuter le notebook 02_2_xgboost.ipynb pour générer "
            "xgb_label_encoder.pkl, puis le copier dans apps/ai/ml/"
        )

    model   = joblib.load(MODEL_PATH)
    encoder = joblib.load(ENCODER_PATH)
    logger.info("Modèle XGBoost chargé depuis %s", MODEL_PATH)
    return model, encoder


# ── Calcul des colonnes dérivées ─────────────────────────────────────────────

def calculate_columns(event_type: str, duration_hours: float,
                       cost: float, volunteers: int) -> dict:
    """
    Reproduit la fonction calculer_colonnes() du notebook 05.
    Calcule Social Impact, Cost Efficiency, Volunteer Intensity.

    Args:
        event_type    : type de l'événement (ex: 'Art', 'Sante')
        duration_hours: durée en heures (ex: 3.0)
        cost          : coût en MAD (ex: 600)
        volunteers    : nombre de bénévoles (ex: 3)

    Returns:
        dict avec social_impact, cost_efficiency, volunteer_intensity
    """
    # 1. Social Impact — basé sur le type
    social_impact = SOCIAL_IMPACT_BY_TYPE.get(event_type, 0.65)

    # 2. Cost Efficiency — plus c'est cher, moins c'est efficient
    cost_efficiency = round(1 - (float(cost) / MAX_COST), 4)
    cost_efficiency = max(0.0, min(1.0, cost_efficiency))   # clamp [0, 1]

    # 3. Volunteer Intensity
    volunteer_intensity = round(float(volunteers) / MAX_VOLUNTEERS, 4)
    volunteer_intensity = max(0.0, min(1.0, volunteer_intensity))

    return {
        'social_impact':        round(social_impact, 4),
        'cost_efficiency':      cost_efficiency,
        'volunteer_intensity':  volunteer_intensity,
    }


# ── Prédiction du Priority Score ─────────────────────────────────────────────

def predict_priority(event_type: str, duration: str,
                      cost: float, volunteers: int) -> dict:
    """
    Prédit le Priority Score d'un événement.
    Reproduit la logique de prédiction du notebook 02_2_xgboost.ipynb.

    Args:
        event_type : type de l'événement. Accepte les codes DB ('ART', 'SANTE'),
                     les noms Excel ('Art', 'Medical Convoy') ou tout autre format.
        duration   : durée sous forme de chaîne (ex: '3h', '24h')
        cost       : coût en MAD
        volunteers : nombre de bénévoles

    Returns:
        dict contenant priority_score et les colonnes calculées
    """
    model, encoder = load_model()

    # Normalisation : DB code / saisie libre → type du modèle
    model_type = normalize_event_type(event_type)

    # Extraction durée en heures (ex: '3h' → 3.0)
    duration_h = _parse_duration(duration)

    # Colonnes calculées
    cols = calculate_columns(model_type, duration_h, cost, volunteers)

    # Encodage du type
    try:
        type_enc = encoder.transform([model_type])[0]
    except ValueError:
        # Type inconnu → on utilise la classe la plus fréquente
        logger.warning("Type '%s' inconnu dans l'encodeur, utilisation de 0", model_type)
        type_enc = 0

    # Features dans le même ordre que l'entraînement
    X = pd.DataFrame([{
        'Type_enc':            type_enc,
        'Duration_h':          duration_h,
        'Social Impact':       cols['social_impact'],
        'Cost Efficiency':     cols['cost_efficiency'],
        'Volunteer Intensity': cols['volunteer_intensity'],
    }])

    priority_score = float(model.predict(X)[0])
    priority_score = round(max(0.0, min(1.0, priority_score)), 4)

    return {
        'priority_score':      priority_score,
        'social_impact':       cols['social_impact'],
        'cost_efficiency':     cols['cost_efficiency'],
        'volunteer_intensity': cols['volunteer_intensity'],
        'duration_hours':      duration_h,
        'model_type':          model_type,   # type utilisé réellement par le modèle
    }


# ── Optimisation mensuelle ───────────────────────────────────────────────────

def optimize_events(budget: float, max_volunteers: int,
                    event_requests: list) -> dict:
    """
    Algorithme greedy issu du notebook 04_optimization_with_duration.ipynb.
    Sélectionne les meilleurs événements qui rentrent dans les contraintes.

    Args:
        budget          : budget disponible en MAD (ex: 8000)
        max_volunteers  : nombre total de bénévoles disponibles (ex: 15)
        event_requests  : liste de dicts, ex:
                          [{"type": "Art", "count": 2},
                           {"type": "Formation", "count": 1}]

    Returns:
        dict avec selected, ignored, budget_used, volunteers_used, total_priority
    """
    # 1. Construire la liste de tous les événements demandés avec leurs estimations
    all_events = []
    for req in event_requests:
        raw_type = req.get('type', 'Workshop')
        etype = normalize_event_type(raw_type)  # convertit DB codes → type modèle
        count = int(req.get('count', 1))
        stats = TYPE_STATS.get(etype, TYPE_STATS['Workshop'])

        for i in range(count):
            duration_str = f"{stats['mean_duration_h']}h"
            result = predict_priority(
                event_type=etype,
                duration=duration_str,
                cost=stats['mean_cost'],
                volunteers=stats['mean_volunteers'],
            )
            all_events.append({
                'name':          f"{etype} #{i + 1}",
                'type':          etype,
                'cost_estime':   stats['mean_cost'],
                'volunteers':    stats['mean_volunteers'],
                'duration_h':    stats['mean_duration_h'],
                'priority_score': result['priority_score'],
            })

    # 2. Trier par priority_score décroissant (greedy)
    all_events.sort(key=lambda e: e['priority_score'], reverse=True)

    # 3. Sélection greedy
    selected       = []
    ignored        = []
    budget_restant = budget
    vols_restants  = max_volunteers

    for event in all_events:
        cout = event['cost_estime']
        vols = event['volunteers']
        raisons = []

        if cout > budget_restant:
            raisons.append(f"coût {cout} > budget restant {budget_restant:.0f} MAD")
        if vols > vols_restants:
            raisons.append(f"bénévoles {vols} > disponibles {vols_restants:.0f}")

        if not raisons:
            selected.append(event)
            budget_restant -= cout
            vols_restants  -= vols
        else:
            event['raison'] = ' | '.join(raisons)
            ignored.append(event)

    # 4. Résumé
    budget_used     = budget - budget_restant
    volunteers_used = max_volunteers - vols_restants
    total_priority  = round(sum(e['priority_score'] for e in selected), 4)

    return {
        'selected':        selected,
        'ignored':         ignored,
        'budget_used':     budget_used,
        'budget_total':    budget,
        'volunteers_used': volunteers_used,
        'volunteers_total': max_volunteers,
        'total_priority':  total_priority,
        'count_selected':  len(selected),
    }


# ── Ré-entraînement ──────────────────────────────────────────────────────────

def retrain_from_db() -> dict:
    """
    Ré-entraîne le modèle XGBoost depuis les données de la base de données Django.
    Reproduit le notebook 05_pipeline_new_events.ipynb.

    Utilise tous les événements qui ont :
      - actual_social_impact renseigné (événements terminés évalués par l'admin)

    Returns:
        dict avec cv_r2_mean, cv_r2_std, n_events
    """
    from xgboost import XGBRegressor
    from sklearn.preprocessing import LabelEncoder
    from sklearn.model_selection import cross_val_score
    from apps.events.models import Event

    # Récupération des événements avec données complètes
    qs = Event.objects.filter(
        actual_social_impact__isnull=False
    ).values(
        'type', 'Duration', 'Cost', 'Volunteers',
        'actual_social_impact', 'ai_priority_score'
    )

    if qs.count() < 5:
        return {
            'success': False,
            'message': f"Pas assez de données pour ré-entraîner ({qs.count()} événements). Minimum : 5",
            'n_events': qs.count(),
        }

    df = pd.DataFrame(list(qs))
    df.columns = ['Type', 'Duration', 'Cost', 'Volunteers',
                   'Social Impact', 'Priority Score']

    # Nettoyage et feature engineering
    le = LabelEncoder()
    df['Type_enc']   = le.fit_transform(df['Type'].astype(str))
    df['Duration_h'] = df['Duration'].apply(
        lambda d: d.total_seconds() / 3600 if hasattr(d, 'total_seconds') else _parse_duration(str(d))
    )
    df['Cost Efficiency']     = (1 - df['Cost'].astype(float) / MAX_COST).clip(0, 1)
    df['Volunteer Intensity'] = (df['Volunteers'].astype(float) / MAX_VOLUNTEERS).clip(0, 1)

    features = ['Type_enc', 'Duration_h', 'Social Impact',
                 'Cost Efficiency', 'Volunteer Intensity']

    X = df[features]
    y = df['Priority Score'].astype(float)

    # Ré-entraînement XGBoost (paramètres du notebook 02_2)
    model = XGBRegressor(
        n_estimators=200,
        max_depth=3,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbosity=0,
    )
    model.fit(X, y)

    # Évaluation
    cv_scores = cross_val_score(model, X, y, cv=min(5, len(df)), scoring='r2')

    # Sauvegarde
    joblib.dump(model, MODEL_PATH)
    joblib.dump(le,    ENCODER_PATH)

    # Marquer les événements comme utilisés pour l'entraînement
    Event.objects.filter(actual_social_impact__isnull=False).update(used_for_ai_training=True)

    logger.info("Modèle XGBoost ré-entraîné sur %d événements. CV-R²=%.4f", len(df), cv_scores.mean())

    return {
        'success':     True,
        'n_events':    len(df),
        'cv_r2_mean':  round(float(cv_scores.mean()), 4),
        'cv_r2_std':   round(float(cv_scores.std()),  4),
        'model_path':  str(MODEL_PATH),
    }


# ── Utilitaires ──────────────────────────────────────────────────────────────

def _parse_duration(duration_str: str) -> float:
    """
    Convertit une durée en chaîne vers des heures (float).
    Ex: '3h' → 3.0, '90min' → 1.5, '24' → 24.0
    """
    import re
    s = str(duration_str).strip().lower()
    m = re.search(r'(\d+(?:\.\d+)?)\s*h', s)
    if m:
        return float(m.group(1))
    m = re.search(r'(\d+(?:\.\d+)?)\s*min', s)
    if m:
        return float(m.group(1)) / 60
    m = re.search(r'(\d+(?:\.\d+)?)', s)
    if m:
        return float(m.group(1))
    return 0.0
