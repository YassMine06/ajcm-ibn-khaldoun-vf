# apps/users/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.text import slugify
from core.models import TimeStampedModel


class User(AbstractUser, TimeStampedModel):
    """
    Modèle utilisateur personnalisé pour AJCM
    """
    
    # ==========================================
    # NOUVEAUX RÔLES (sans VISITOR ni ADMIN)
    # ==========================================
    
    ROLE_CHOICES = [
        ('MEMBER_STANDARD', 'Membre Standard'),
        ('MEMBER_BUREAU', 'Membre de Bureau'),
    ]
    
    # Champs principaux
    email = models.EmailField('Email', unique=True)
    username = models.CharField('Nom d\'utilisateur', max_length=150, unique=True, blank=True)
    first_name = models.CharField('Prénom', max_length=150)
    last_name = models.CharField('Nom', max_length=150)
    
    # Contact
    phone = models.CharField('Téléphone', max_length=20, blank=True)
    
    # ==========================================
    # NOUVEAUX CHAMPS POUR LE FRONTEND
    # ==========================================
    
    birth_date = models.DateField(
        'Date de naissance',
        null=True, blank=True,
        help_text="Date de naissance du membre (JJ/MM/AAAA)"
    )
    
    cin = models.CharField(
        'CIN (Carte d\'Identité Nationale)',
        max_length=20,
        blank=True,
        help_text="Numéro de la carte d'identité"
    )
    
    address = models.TextField(
        'Adresse',
        blank=True,
        help_text="Adresse complète"
    )
    
    # Métadonnées
    age = models.PositiveIntegerField('Âge', null=True, blank=True)
    city = models.CharField('Ville', max_length=100, blank=True)
    bio = models.TextField('Biographie', blank=True)
    photo = models.ImageField('Photo de profil', upload_to='profile_pics/', null=True, blank=True)
    
    # Rôle (modifié)
    role = models.CharField('Rôle', max_length=20, choices=ROLE_CHOICES, default='MEMBER_STANDARD')
    
    # Statut
    is_active = models.BooleanField('Actif', default=True)
    must_change_password = models.BooleanField('Doit changer mot de passe', default=True)
    
    # Configuration pour l'authentification par email
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    class Meta:
        verbose_name = 'Membre'
        verbose_name_plural = 'Membres'
        ordering = ['-date_joined']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    def save(self, *args, **kwargs):
        if self.email:
            self.email = self.email.lower()
        if not self.username:
            base_username = slugify(f"{self.first_name}.{self.last_name}")
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            self.username = username
        super().save(*args, **kwargs)
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    @property
    def is_member_standard(self):
        return self.role == 'MEMBER_STANDARD'
    
    @property
    def is_member_bureau(self):
        return self.role == 'MEMBER_BUREAU'
    
    @property
    def is_admin(self):
        """Pour compatibilité avec les permissions existantes"""
        return self.is_superuser or self.is_staff
    
    @property
    def member_id(self):
        """Génère un identifiant unique pour le membre (ex: M-2026-001)"""
        year = self.date_joined.year if self.date_joined else 2026
        return f"M-{year}-{self.id:03d}"