# apps/ai/models.py
# ==================
# Your own table — completely independent from apps/events/models.py
# This is the Django version of your Data_new_LABELED.xlsx

from django.db import models
from django.utils import timezone


class AIEventHistory(models.Model):
    """
    Your training dataset stored in the database.
    One row = one historical event used to train the XGBoost model.
    This is YOUR table — independent from your teammates' Event table.
    """

    TYPE_CHOICES = [
        ('Art',                  'Art'),
        ('Camping',              'Camping'),
        ('Conférence',           'Conférence'),
        ('Culture',              'Culture'),
        ('Formation',            'Formation'),
        ('Medical Convoy',       'Medical Convoy'),
        ('Table Ronde',          'Table Ronde'),
        ('Workshop',             'Workshop'),
        ('solidarity_donation',  'Solidarity — Donation'),
        ('solidarity_material',  'Solidarity — Material'),
    ]

    # ── Basic info ────────────────────────────────────────────────────────────
    event_name   = models.CharField('Nom événement', max_length=200)
    type         = models.CharField('Type IA', max_length=50, choices=TYPE_CHOICES)
    duration     = models.CharField('Durée (ex: 2h, 24h)', max_length=20)
    duration_h   = models.FloatField('Durée en heures')

    # ── Raw inputs ────────────────────────────────────────────────────────────
    cost         = models.FloatField('Coût réel (MAD)')
    volunteers   = models.IntegerField('Nombre de volontaires')

    # ── Computed features (calculated automatically on save) ──────────────────
    social_impact       = models.FloatField('Impact social (0-1)')
    cost_efficiency     = models.FloatField('Efficacité coût (0-1)')
    volunteer_intensity = models.FloatField('Intensité volontaires (0-1)')
    priority_score      = models.FloatField('Score de priorité (0-1)')

    # ── Metadata ──────────────────────────────────────────────────────────────
    # Link to teammates' event (optional — useful to know which real event this came from)
    source_event_id  = models.IntegerField(
        'ID événement source (apps.events)',
        null=True, blank=True,
        help_text="ID de l'événement dans la table Event de tes coéquipiers"
    )
    added_at = models.DateTimeField('Ajouté le', default=timezone.now)
    used_for_training = models.BooleanField('Utilisé pour entraînement', default=True)

    class Meta:
        verbose_name = 'Historique IA'
        verbose_name_plural = 'Historique IA'
        ordering = ['-added_at']
        db_table = 'ai_event_history'   # exact table name in SQLite

    def __str__(self):
        return f"{self.event_name} ({self.type}) — score {self.priority_score:.3f}"


class AITrainingRun(models.Model):
    """
    Logs every time the model was retrained.
    Useful to track model improvement over time.
    """
    trained_at     = models.DateTimeField('Entraîné le', default=timezone.now)
    total_events   = models.IntegerField('Nombre d\'événements utilisés')
    cv_r2_mean     = models.FloatField('CV-R² moyen')
    cv_r2_std      = models.FloatField('CV-R² écart-type')
    triggered_by   = models.CharField(
        'Déclenché par',
        max_length=200,
        blank=True,
        help_text="Nom de l'événement qui a déclenché le ré-entraînement"
    )

    class Meta:
        verbose_name = 'Entraînement IA'
        verbose_name_plural = 'Entraînements IA'
        ordering = ['-trained_at']
        db_table = 'ai_training_run'

    def __str__(self):
        return f"Training {self.trained_at.strftime('%Y-%m-%d %H:%M')} — CV-R²={self.cv_r2_mean:.4f}"
