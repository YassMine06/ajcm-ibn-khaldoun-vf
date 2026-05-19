from django.db import models

class TimeStampedModel(models.Model):
    """Ajoute automatiquement created_at et updated_at"""
    created_at = models.DateTimeField('Date de création', auto_now_add=True)
    updated_at = models.DateTimeField('Date de modification', auto_now=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']