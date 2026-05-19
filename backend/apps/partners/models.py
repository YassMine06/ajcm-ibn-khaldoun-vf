from django.db import models
from core.models import TimeStampedModel


class Partner(TimeStampedModel):
    """
    Modèle Partner - Gestion des partenaires et sponsors
    """
    
    TYPE_CHOICES = [
        ('SPONSOR', 'Sponsor'),
        ('MEDIA', 'Média'),
        ('INSTITUTION', 'Institution'),
        ('ASSOCIATION', 'Association'),
        ('COMPANY', 'Entreprise'),
        ('OTHER', 'Autre'),
    ]
    
    # ==========================================
    # INFORMATIONS PRINCIPALES
    # ==========================================
    
    name = models.CharField(
        'Nom du partenaire',
        max_length=200,
        help_text="Nom complet du partenaire ou sponsor"
    )
    
    type = models.CharField(
        'Type',
        max_length=20,
        choices=TYPE_CHOICES,
        default='OTHER',
        help_text="Catégorie du partenaire"
    )
    
    logo = models.ImageField(
        'Logo',
        upload_to='partners/',
        help_text="Logo du partenaire (format PNG ou JPEG recommandé)"
    )
    
    # ==========================================
    # CONTACT ET LIENS
    # ==========================================
    
    website = models.URLField(
        'Site web',
        blank=True,
        help_text="URL du site web du partenaire (ex: https://www.exemple.com)"
    )
    
    email = models.EmailField(
        'Email de contact',
        blank=True,
        help_text="Email de contact pour le partenaire"
    )
    
    phone = models.CharField(
        'Téléphone',
        max_length=20,
        blank=True,
        help_text="Numéro de téléphone du partenaire"
    )
    
    # ==========================================
    # DESCRIPTION
    # ==========================================
    
    description = models.TextField(
        'Description',
        blank=True,
        help_text="Description courte du partenaire et de son rôle"
    )
    
    # ==========================================
    # VISIBILITÉ ET AFFICHAGE
    # ==========================================
    
    is_active = models.BooleanField(
        'Actif',
        default=True,
        help_text="Cochez pour afficher ce partenaire sur le site"
    )
    
    order = models.PositiveIntegerField(
        'Ordre d\'affichage',
        default=0,
        help_text="Les partenaires avec un ordre plus petit apparaissent en premier"
    )
    
    # ==========================================
    # MÉTADONNÉES
    # ==========================================
    
    class Meta:
        verbose_name = 'Partenaire'
        verbose_name_plural = 'Partenaires'
        ordering = ['order', 'name']  # Tri par ordre d'abord, puis par nom
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['type']),
            models.Index(fields=['order']),
        ]
    
    def __str__(self):
        return self.name
    
    @property
    def is_sponsor(self):
        """Vérifie si c'est un sponsor"""
        return self.type == 'SPONSOR'
    
    @property
    def is_media(self):
        """Vérifie si c'est un média"""
        return self.type == 'MEDIA'
    
    @property
    def logo_url(self):
        """Retourne l'URL du logo"""
        if self.logo:
            return self.logo.url
        return None
    
    @property
    def type_display_colored(self):
        """Retourne le type avec une couleur pour l'affichage"""
        colors = {
            'SPONSOR': '#4caf50',      # Vert
            'MEDIA': '#2196f3',        # Bleu
            'INSTITUTION': '#9c27b0',  # Violet
            'ASSOCIATION': '#ff9800',  # Orange
            'COMPANY': '#00bcd4',      # Cyan
            'OTHER': '#9e9e9e',        # Gris
        }
        return {
            'label': self.get_type_display(),
            'color': colors.get(self.type, '#9e9e9e')
        }