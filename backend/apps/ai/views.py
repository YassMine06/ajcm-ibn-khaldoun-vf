"""
apps/ai/views.py
================
Deux endpoints :
  POST /api/ai/optimize/  → sélection greedy (notebook 04)
  POST /api/ai/retrain/   → ajout événement + ré-entraînement (notebook 05)

La logique est dans apps/ai/ml/predictor.py.
Ces vues ne font que valider les entrées et formater les sorties.
"""

import os
import re
import joblib
import numpy as np
import pandas as pd

from django.conf import settings
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from xgboost import XGBRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import cross_val_score

from apps.ai.models import AIEventHistory, AITrainingRun

# ── Chemins ───────────────────────────────────────────────────────────────────
ML_DIR = os.path.join(settings.BASE_DIR, "apps", "ai", "ml")
MODEL_PATH = os.path.join(ML_DIR, "xgb_model.pkl")
ENCODER_PATH = os.path.join(ML_DIR, "xgb_label_encoder.pkl")

# ── Mapping types DB → types du modèle ───────────────────────────────────────
CATEGORY_MAP = {
    # Types DB uppercase (coéquipiers)
    "culture": "Culture",
    "jeunesse": "Workshop",
    "formation": "Formation",
    "evenement": "Culture",
    "art": "Art",
    "sport": "Camping",
    "solidarite": "solidarity_donation",
    "solidarité": "solidarity_donation",
    "sante": "Medical Convoy",
    "santé": "Medical Convoy",
    "citoyennete": "Table Ronde",
    "citoyenneté": "Table Ronde",
    "autre": "Workshop",
    # Types du modèle (pass-through)
    "workshop": "Workshop",
    "camping": "Camping",
    "conférence": "Conférence",
    "conference": "Conférence",
    "medical convoy": "Medical Convoy",
    "medical_convoy": "Medical Convoy",
    "table ronde": "Table Ronde",
    "table_ronde": "Table Ronde",
    "solidarity_donation": "solidarity_donation",
    "solidarity_material": "solidarity_material",
}

# Social Impact par type (depuis notebook 05 / dataset réel)
SOCIAL_IMPACT_MAP = {
    "Art": 0.70,
    "Camping": 0.55,
    "Conférence": 0.79,
    "Culture": 0.65,
    "Formation": 0.72,
    "Medical Convoy": 0.93,
    "Table Ronde": 0.55,
    "Workshop": 0.67,
    "solidarity_donation": 0.90,
    "solidarity_material": 0.80,
}

# ── Helpers ───────────────────────────────────────────────────────────────────


def normalize_type(raw: str):
    """Convertit n'importe quel type vers le type connu du modèle."""
    if not raw:
        return None
    key = str(raw).strip().lower()
    return CATEGORY_MAP.get(key)


def load_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Modèle introuvable : {MODEL_PATH}. Lance apps/ai/ml/train.py d'abord."
        )
    return joblib.load(MODEL_PATH), joblib.load(ENCODER_PATH)


def load_history_from_db() -> pd.DataFrame:
    """Charge l'historique depuis AIEventHistory (ta table)."""
    qs = AIEventHistory.objects.filter(used_for_training=True).values(
        "event_name",
        "type",
        "duration",
        "duration_h",
        "cost",
        "volunteers",
        "social_impact",
        "cost_efficiency",
        "volunteer_intensity",
        "priority_score",
    )
    df = pd.DataFrame(list(qs))
    if df.empty:
        raise ValueError(
            "AIEventHistory est vide. Lance : python apps/ai/ml/import_ai_history.py"
        )
    df.columns = [
        "Event Name",
        "Type",
        "Duration",
        "Duration_h",
        "Cost",
        "Volunteers",
        "Social Impact",
        "Cost Efficiency",
        "Volunteer Intensity",
        "Priority Score",
    ]
    df["duration_cat"] = df["Duration_h"].apply(lambda h: "short" if h < 10 else "long")
    return df


def build_estimations(df):
    """
    Reproduit la cellule 4 du notebook 04 :
    dictionnaire 2D (Type, duration_cat) + fallback par type seul.
    """
    est_2d = (
        df.groupby(["Type", "duration_cat"])
        .agg(
            cost_moyen=("Cost", "mean"),
            volunteers_moy=("Volunteers", "mean"),
            social_impact=("Social Impact", "max"),
        )
        .round(2)
    )

    est_fallback = (
        df.groupby("Type")
        .agg(
            cost_moyen=("Cost", "mean"),
            volunteers_moy=("Volunteers", "mean"),
            social_impact=("Social Impact", "max"),
        )
        .round(2)
    )

    return est_2d, est_fallback


def parse_duration_h(duration_str: str) -> float:
    """'8h' → 8.0 / '90min' → 1.5 / '24' → 24.0"""
    s = str(duration_str).strip().lower()
    m = re.search(r"(\d+(?:\.\d+)?)\s*h", s)
    if m:
        return float(m.group(1))
    m = re.search(r"(\d+(?:\.\d+)?)\s*min", s)
    if m:
        return float(m.group(1)) / 60
    m = re.search(r"(\d+(?:\.\d+)?)", s)
    if m:
        return float(m.group(1))
    return 2.0


# ══════════════════════════════════════════════════════════════════════════════
#  ENDPOINT 1 — Optimisation mensuelle
#  POST /api/ai/optimize/
# ══════════════════════════════════════════════════════════════════════════════
@api_view(["POST"])
@permission_classes([IsAdminUser])
def optimize_activities(request):
    """
    Entrée :
    {
        "budget": 8000,
        "volunteers": 18,
        "events": [
            { "name": "Art #1",   "category": "Art",           "duration_hours": 2, "forced": false },
            { "name": "Santé #1", "category": "SANTE",         "duration_hours": 7, "forced": true  },
            { "name": "Form. #1", "category": "FORMATION",     "duration_hours": 24,"forced": false }
        ]
    }
    """
    budget = request.data.get("budget")
    volunteers = request.data.get("volunteers")
    events_raw = request.data.get("events", [])

    if budget is None or volunteers is None or not events_raw:
        return Response(
            {"error": "Champs requis : budget, volunteers, events"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Charger modèle + historique
    try:
        xgb_model, le = load_model()
        df_history = load_history_from_db()
    except (FileNotFoundError, ValueError) as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Estimations 2D (notebook 04, cellule 4)
    est_2d, est_fallback = build_estimations(df_history)
    cost_max = df_history["Cost"].max()
    vol_max = df_history["Volunteers"].max()
    types_connus = list(le.classes_)

    rows, unknown = [], []

    for ev in events_raw:
        raw_cat = ev.get("category", "")
        ai_type = normalize_type(raw_cat)
        duration_h = float(ev.get("duration_hours", 2))
        forced = bool(ev.get("forced", False))
        name = ev.get("name", raw_cat)

        if ai_type is None:
            unknown.append({"name": name, "reason": f"Type non reconnu : '{raw_cat}'"})
            continue

        # Lookup estimations (notebook 04, cellule 8)
        duration_cat = "short" if duration_h < 10 else "long"
        key = (ai_type, duration_cat)

        if key in est_2d.index:
            est = est_2d.loc[key]
        elif ai_type in est_fallback.index:
            est = est_fallback.loc[ai_type]
        else:
            est = pd.Series(
                {
                    "cost_moyen": 500.0,
                    "volunteers_moy": 3.0,
                    "social_impact": SOCIAL_IMPACT_MAP.get(ai_type, 0.65),
                }
            )

        cost_est = float(est["cost_moyen"])
        vol_est = float(est["volunteers_moy"])
        social = float(est["social_impact"])

        # Colonnes calculées (notebook 05, cellule 6)
        cost_eff = round(1 - cost_est / cost_max, 4)
        vol_int = round(vol_est / vol_max, 4)

        type_enc = le.transform([ai_type])[0] if ai_type in types_connus else -1

        rows.append(
            {
                "name": name,
                "ai_type": ai_type,
                "Duration_h": duration_h,
                "forced": forced,
                "estimated_cost": cost_est,
                "estimated_volunteers": vol_est,
                "Social Impact": social,
                "Cost Efficiency": cost_eff,
                "Volunteer Intensity": vol_int,
                "Type_enc": type_enc,
            }
        )

    if not rows:
        return Response(
            {"error": "Aucun événement valide.", "unknown_types": unknown},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Prédiction XGBoost (notebook 04, cellule 10)
    df_ev = pd.DataFrame(rows)
    features = [
        "Type_enc",
        "Duration_h",
        "Social Impact",
        "Cost Efficiency",
        "Volunteer Intensity",
    ]
    df_ev["priority_score"] = xgb_model.predict(df_ev[features]).round(4)

    # Greedy (notebook 04, cellule 12)
    selected, rejected = [], []
    budget_left = float(budget)
    vols_left = float(volunteers)

    # 1. Événements forcés en premier
    for _, row in df_ev[df_ev["forced"]].iterrows():
        budget_left -= row["estimated_cost"]
        vols_left -= row["estimated_volunteers"]
        selected.append(
            {
                "name": row["name"],
                "type": row["ai_type"],
                "priority_score": float(row["priority_score"]),
                "estimated_cost": float(row["estimated_cost"]),
                "estimated_volunteers": int(row["estimated_volunteers"]),
                "forced": True,
            }
        )

    # 2. Tri par priority_score décroissant puis greedy
    for _, row in (
        df_ev[~df_ev["forced"]]
        .sort_values("priority_score", ascending=False)
        .iterrows()
    ):
        c, v = row["estimated_cost"], row["estimated_volunteers"]
        if c <= budget_left and v <= vols_left:
            budget_left -= c
            vols_left -= v
            selected.append(
                {
                    "name": row["name"],
                    "type": row["ai_type"],
                    "priority_score": float(row["priority_score"]),
                    "estimated_cost": float(row["estimated_cost"]),
                    "estimated_volunteers": int(row["estimated_volunteers"]),
                    "forced": False,
                }
            )
        else:
            raisons = []
            if c > budget_left:
                raisons.append(f"coût {c:.0f} > budget restant {budget_left:.0f} MAD")
            if v > vols_left:
                raisons.append(f"bénévoles {v:.0f} > restants {vols_left:.0f}")
            rejected.append(
                {
                    "name": row["name"],
                    "type": row["ai_type"],
                    "reason": " & ".join(raisons),
                }
            )

    return Response(
        {
            "selected": selected,
            "rejected": rejected + unknown,
            "budget_used": round(float(budget) - budget_left, 2),
            "budget_remaining": round(budget_left, 2),
            "volunteers_used": round(float(volunteers) - vols_left, 1),
            "volunteers_remaining": round(vols_left, 1),
        }
    )


# ══════════════════════════════════════════════════════════════════════════════
#  ENDPOINT 2 — Ajouter un événement réel + ré-entraîner
#  POST /api/ai/retrain/
# ══════════════════════════════════════════════════════════════════════════════
@api_view(["POST"])
@permission_classes([IsAdminUser])
def retrain_model(request):
    """
    Reproduit le notebook 05 :
    1. Reçoit les données d'un événement réel terminé
    2. Calcule ses features (Social Impact, Cost Efficiency, Volunteer Intensity, Priority Score)
    3. Le sauvegarde dans AIEventHistory
    4. Ré-entraîne XGBoost sur tout l'historique
    5. Sauvegarde le nouveau modèle .pkl

    Option A — événement depuis la table des coéquipiers :
        { "event_id": 42 }

    Option B — données brutes :
        { "event_name": "...", "category": "Medical Convoy",
          "duration": "8h", "cost": 3500, "volunteers": 7 }
    """
    event_id = request.data.get("event_id")

    if event_id:
        # Option A : depuis la table Event des coéquipiers
        from apps.events.models import Event

        try:
            ev = Event.objects.get(pk=event_id)
        except Event.DoesNotExist:
            return Response(
                {"error": f"Événement id={event_id} introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        raw_cat = ev.type
        event_name = ev.Event_Name
        duration = ev.formatted_duration
        cost = float(ev.Cost)
        vols = int(ev.Volunteers)
    else:
        # Option B : données brutes
        raw_cat = request.data.get("category", "")
        event_name = request.data.get("event_name", raw_cat)
        duration = request.data.get("duration", "2h")
        cost = float(request.data.get("cost", 0))
        vols = int(request.data.get("volunteers", 0))

    # Normalisation du type
    ai_type = normalize_type(raw_cat)
    if ai_type is None:
        return Response(
            {"error": f"Type non reconnu : '{raw_cat}'"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ── Calcul des features (notebook 05, cellule 6) ──────────────────────────
    try:
        df_history = load_history_from_db()
    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    cost_max = max(df_history["Cost"].max(), cost)
    vol_max = max(df_history["Volunteers"].max(), vols)

    # Social Impact depuis la moyenne historique du type (notebook 05)
    si_map = df_history.groupby("Type")["Social Impact"].mean()
    social_impact = float(si_map.get(ai_type, SOCIAL_IMPACT_MAP.get(ai_type, 0.65)))

    cost_efficiency = round(max(0.0, 1 - cost / cost_max), 4)
    volunteer_intensity = round(min(1.0, vols / vol_max), 4)
    priority_score = round(
        0.50 * social_impact + 0.30 * cost_efficiency + 0.20 * volunteer_intensity, 6
    )
    duration_h = parse_duration_h(duration)

    # ── Sauvegarde dans AIEventHistory ────────────────────────────────────────
    AIEventHistory.objects.create(
        event_name=event_name,
        type=ai_type,
        duration=duration,
        duration_h=duration_h,
        cost=cost,
        volunteers=vols,
        social_impact=social_impact,
        cost_efficiency=cost_efficiency,
        volunteer_intensity=volunteer_intensity,
        priority_score=priority_score,
        source_event_id=event_id,
        used_for_training=True,
    )

    # ── Ré-entraînement XGBoost (notebook 05, cellule 13) ────────────────────
    df_updated = load_history_from_db()  # recharge avec le nouvel event

    le_new = LabelEncoder()
    df_updated["Type_enc"] = le_new.fit_transform(df_updated["Type"])

    X = df_updated[
        [
            "Type_enc",
            "Duration_h",
            "Social Impact",
            "Cost Efficiency",
            "Volunteer Intensity",
        ]
    ]
    y = df_updated["Priority Score"]

    xgb_new = XGBRegressor(
        n_estimators=200,
        max_depth=3,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbosity=0,
    )
    xgb_new.fit(X, y)
    cv_scores = cross_val_score(xgb_new, X, y, cv=min(5, len(df_updated)), scoring="r2")

    # Sauvegarde des nouveaux .pkl
    os.makedirs(ML_DIR, exist_ok=True)
    joblib.dump(xgb_new, MODEL_PATH)
    joblib.dump(le_new, ENCODER_PATH)

    # Log dans AITrainingRun
    AITrainingRun.objects.create(
        total_events=len(df_updated),
        cv_r2_mean=round(float(cv_scores.mean()), 4),
        cv_r2_std=round(float(cv_scores.std()), 4),
        triggered_by=event_name,
    )

    # Marquer l'événement coéquipier si Option A
    if event_id:
        from apps.events.models import Event

        try:
            ev = Event.objects.get(pk=event_id)
            ev.used_for_ai_training = True
            ev.ai_priority_score = priority_score
            ev.ai_updated_at = timezone.now()
            ev.save(
                update_fields=[
                    "used_for_ai_training",
                    "ai_priority_score",
                    "ai_updated_at",
                ]
            )
        except Event.DoesNotExist:
            pass

    return Response(
        {
            "message": f"✅ '{event_name}' ajouté. Modèle ré-entraîné.",
            "total_events": len(df_updated),
            "cv_r2_mean": round(float(cv_scores.mean()), 4),
            "cv_r2_std": round(float(cv_scores.std()), 4),
            "new_event": {
                "ai_type": ai_type,
                "duration_h": duration_h,
                "social_impact": social_impact,
                "cost_efficiency": cost_efficiency,
                "volunteer_intensity": volunteer_intensity,
                "priority_score": priority_score,
            },
        }
    )
