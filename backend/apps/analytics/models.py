# apps/analytics/models.py

from django.db import models
from core.models import TimeStampedModel


class DailyStats(TimeStampedModel):
    """Statistiques quotidiennes"""
    date = models.DateField(unique=True)
    
    # Utilisateurs
    new_members = models.IntegerField(default=0)
    total_members = models.IntegerField(default=0)
    
    # Événements
    new_events = models.IntegerField(default=0)
    total_events = models.IntegerField(default=0)
    published_events = models.IntegerField(default=0)
    
    # Inscriptions
    new_registrations = models.IntegerField(default=0)
    total_registrations = models.IntegerField(default=0)
    attendance_rate = models.FloatField(default=0.0)
    
    # Engagement
    engagement_rate = models.FloatField(default=0.0)
    
    class Meta:
        verbose_name = 'Statistique journalière'
        verbose_name_plural = 'Statistiques journalières'
        ordering = ['-date']
    
    def __str__(self):
        return f"Stats du {self.date}"