# apps/announcements/models.py

from django.db import models
from django.utils import timezone
from core.models import TimeStampedModel
from apps.users.models import User
from apps.events.models import Event


class Announcement(TimeStampedModel):
    """
    Modèle Announcement - Annonces publiques
    """
    
    TYPE_CHOICES = [
        ('NEWS', 'Actualité'),
        ('ALERT', 'Alerte'),
        ('PROMO', 'Promotion'),
        ('INFO', 'Information'),
        ('EVENT', 'Événement'),
    ]
    
    # ==========================================
    # CHAMPS PRINCIPAUX
    # ==========================================
    
    title = models.CharField(
        'Titre',
        max_length=200,
        help_text="Titre accrocheur de l'annonce"
    )
    
    content = models.TextField(
        'Contenu',
        help_text="Contenu détaillé de l'annonce"
    )
    
    type = models.CharField(
        'Type',
        max_length=20,
        choices=TYPE_CHOICES,
        default='NEWS',
        help_text="Type d'annonce (détermine l'apparence)"
    )
    
    # ==========================================
    # IMAGE (OBLIGATOIRE)
    # ==========================================
    
    image = models.ImageField(
        'Image',
        upload_to='announcements/',
        help_text="Image de l'annonce (obligatoire pour l'affichage visuel)"
    )
    
    # ==========================================
    # DATES (SAISIES PAR L'ADMIN)
    # ==========================================
    
    start_date = models.DateTimeField(
        'Date et heure de début',
        null=True, blank=True,
        help_text="Date et heure de début de l'annonce (ex: 15/05/2025 14:30)"
    )
    
    end_date = models.DateTimeField(
        'Date et heure de fin',
        null=True, blank=True,
        help_text="Date et heure de fin de l'annonce (ex: 20/05/2025 18:00)"
    )
    
    # Pour compatibilité avec l'ancien code (expires_at = end_date)
    expires_at = models.DateTimeField(
        'Date d\'expiration',
        null=True, blank=True,
        help_text="Alias pour date de fin"
    )
    
    # ==========================================
    # LIEU
    # ==========================================
    
    location = models.CharField(
        'Lieu',
        max_length=200,
        blank=True,
        default='',
        help_text="Lieu de l'événement ou de l'annonce"
    )
    
    # ==========================================
    # VISIBILITÉ
    # ==========================================
    
    is_active = models.BooleanField(
        'Active',
        default=True,
        help_text="Cochez pour afficher l'annonce sur le site"
    )
    
    is_featured = models.BooleanField(
        'À la une',
        default=False,
        help_text="Les annonces à la une apparaissent en premier"
    )
    
    # ==========================================
    # LIENS
    # ==========================================
    
    event = models.ForeignKey(
        Event,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='announcements',
        verbose_name='Événement lié',
        help_text="Lien optionnel vers un événement"
    )
    
    author = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='announcements',
        verbose_name='Auteur',
        help_text="Administrateur qui a créé l'annonce"
    )
    
    # ==========================================
    # MÉTADONNÉES
    # ==========================================
    
    class Meta:
        verbose_name = 'Annonce'
        verbose_name_plural = 'Annonces'
        ordering = ['-is_featured', '-start_date']
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['is_featured']),
            models.Index(fields=['start_date']),
            models.Index(fields=['end_date']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        """Synchronise expires_at avec end_date pour compatibilité"""
        if self.end_date and not self.expires_at:
            self.expires_at = self.end_date
        elif self.expires_at and not self.end_date:
            self.end_date = self.expires_at
        super().save(*args, **kwargs)
    
    @property
    def is_expired(self):
        """Vérifie si l'annonce est expirée"""
        if self.end_date:
            return timezone.now() > self.end_date
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False
    
    @property
    def is_visible(self):
        """Vérifie si l'annonce doit être affichée sur le site"""
        return self.is_active and not self.is_expired
    
    @property
    def type_color(self):
        colors = {
            'NEWS': '#2196F3',
            'ALERT': '#F44336',
            'PROMO': '#4CAF50',
            'INFO': '#9E9E9E',
            'EVENT': '#9C27B0',
        }
        return colors.get(self.type, '#2196F3')
    
    @property
    def type_icon(self):
        icons = {
            'NEWS': '📰',
            'ALERT': '⚠️',
            'PROMO': '🏷️',
            'INFO': 'ℹ️',
            'EVENT': '📅',
        }
        return icons.get(self.type, '📰')