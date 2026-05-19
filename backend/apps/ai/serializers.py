"""
serializers.py — Validation des entrées/sorties pour l'API IA
=============================================================
Valide les données envoyées par le frontend avant de les passer
aux fonctions du module predictor.py.
"""

from rest_framework import serializers

# Types d'événements autorisés (correspondent aux notebooks et au modèle Event)
EVENT_TYPES = [
    'Culture', 'Jeunesse', 'Formation', 'Evenement',
    'Art', 'Sport', 'Solidarite', 'Sante', 'Citoyennete',
    'Medical Convoy', 'Autre',
]


# ── Sérialiser : Prédiction du Priority Score ─────────────────────────────────

class PredictRequestSerializer(serializers.Serializer):
    """
    Données attendues depuis le frontend pour /api/ai/predict/

    Exemple :
        {
            "type": "Art",
            "duration": "3h",
            "cost": 600,
            "volunteers": 3
        }
    """
    type       = serializers.ChoiceField(choices=EVENT_TYPES)
    duration   = serializers.CharField(
        max_length=20,
        help_text="Durée de l'événement (ex: '3h', '90min', '2h30')"
    )
    cost       = serializers.FloatField(
        min_value=0,
        help_text="Coût de l'événement en MAD"
    )
    volunteers = serializers.IntegerField(
        min_value=0,
        help_text="Nombre de bénévoles nécessaires"
    )


class PredictResponseSerializer(serializers.Serializer):
    """
    Réponse de /api/ai/predict/

    Exemple :
        {
            "priority_score": 0.72,
            "social_impact": 0.68,
            "cost_efficiency": 0.88,
            "volunteer_intensity": 0.17,
            "duration_hours": 3.0
        }
    """
    priority_score      = serializers.FloatField()
    social_impact       = serializers.FloatField()
    cost_efficiency     = serializers.FloatField()
    volunteer_intensity = serializers.FloatField()
    duration_hours      = serializers.FloatField()


# ── Sérialiser : Optimisation mensuelle ──────────────────────────────────────

class EventRequestItemSerializer(serializers.Serializer):
    """
    Un type d'événement avec son nombre.
    Exemple : { "type": "Art", "count": 2 }
    """
    type  = serializers.ChoiceField(choices=EVENT_TYPES)
    count = serializers.IntegerField(min_value=1, default=1)


class OptimizeRequestSerializer(serializers.Serializer):
    """
    Données attendues depuis le frontend pour /api/ai/optimize/

    Exemple :
        {
            "budget": 8000,
            "volunteers": 15,
            "events": [
                {"type": "Art",       "count": 2},
                {"type": "Formation", "count": 1}
            ]
        }
    """
    budget     = serializers.FloatField(
        min_value=0,
        help_text="Budget total disponible ce mois (en MAD)"
    )
    volunteers = serializers.IntegerField(
        min_value=1,
        help_text="Nombre total de bénévoles disponibles ce mois"
    )
    events     = EventRequestItemSerializer(
        many=True,
        help_text="Liste des types d'événements à planifier avec leur quantité"
    )

    def validate_events(self, value):
        if len(value) == 0:
            raise serializers.ValidationError(
                "Veuillez fournir au moins un type d'événement."
            )
        return value


# ── Sérialiser : Ré-entraînement ─────────────────────────────────────────────

class RetrainResponseSerializer(serializers.Serializer):
    """Réponse de /api/ai/retrain/"""
    success    = serializers.BooleanField()
    message    = serializers.CharField(required=False)
    n_events   = serializers.IntegerField(required=False)
    cv_r2_mean = serializers.FloatField(required=False)
    cv_r2_std  = serializers.FloatField(required=False)
    model_path = serializers.CharField(required=False)
