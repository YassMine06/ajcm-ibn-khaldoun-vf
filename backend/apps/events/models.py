from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from core.models import TimeStampedModel
from apps.users.models import User


class Event(TimeStampedModel):
    """
    Modèle Event - Événements de l'association
    """
    
    TYPE_CHOICES = [
        ('CULTURE', 'Culture'),
        ('JEUNESSE', 'Jeunesse'),
        ('FORMATION', 'Formation'),
        ('EVENEMENT', 'Événement'),
        ('ART', 'Art'),
        ('SPORT', 'Sport'),
        ('SOLIDARITE', 'Solidarité'),
        ('SANTE', 'Santé'),
        ('CITOYENNETE', 'Citoyenneté'),
        ('AUTRE', 'Autre'),
    ]
    
    STATUS_CHOICES = [
        ('DRAFT', 'Brouillon'),
        ('PUBLISHED', 'Publié'),
        ('CANCELLED', 'Annulé'),
        ('COMPLET', 'Complet'),
    ]
    
    # ==========================================
    # CHAMPS PRINCIPAUX
    # ==========================================
    
    Event_Name = models.CharField('Nom de l\'événement', max_length=200)
    type = models.CharField('Type', max_length=20, choices=TYPE_CHOICES)
    Duration = models.DurationField('Durée')
    Cost = models.DecimalField('Coût', max_digits=10, decimal_places=2, default=0)
    Volunteers = models.IntegerField('Bénévoles nécessaires', default=0)
    description = models.TextField('Description')
    start_date = models.DateTimeField('Date de début')
    end_date = models.DateTimeField('Date de fin')
    location = models.CharField('Lieu', max_length=200)
    city = models.CharField('Ville', max_length=100)
    max_places = models.PositiveIntegerField('Nombre de places', default=0)
    status = models.CharField('Statut', max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_events')
    
    # ==========================================
    # POSTER (image principale) - BIEN PRÉSENT
    # ==========================================
    
    poster = models.ImageField(
        'Poster principal',
        upload_to='events/posters/',
        null=True,
        blank=True,
        help_text="Image principale de l'événement (affiche)"
    )
    
    # ==========================================
    # AUTRES CHAMPS POUR LE FRONTEND
    # ==========================================
    
    start_time = models.TimeField(
        'Heure de début',
        null=True, blank=True,
        help_text="Heure de début (ex: 14:30)"
    )
    
    guests = models.TextField(
        'Invités / Guests',
        blank=True,
        help_text="Liste des invités séparés par des virgules"
    )
    
    # ==========================================
    # CHAMPS POUR L'IA (APPRENTISSAGE CONTINU)
    # ==========================================
    
    predicted_social_impact = models.FloatField(
        'Impact social prédit',
        default=0.7,
        help_text="Valeur par défaut basée sur le type d'événement (0-1)"
    )
    
    actual_social_impact = models.FloatField(
        'Impact social réel',
        null=True, blank=True,
        help_text="Évalué après l'événement par l'admin (0-1)"
    )
    
    actual_participants_count = models.IntegerField(
        'Nombre réel de participants',
        null=True, blank=True,
        help_text="Nombre réel de participants (après l'événement)"
    )
    
    member_satisfaction = models.FloatField(
        'Satisfaction membres',
        null=True, blank=True,
        help_text="Note moyenne de satisfaction (0-1)"
    )
    
    used_for_ai_training = models.BooleanField(
        'Utilisé pour entraînement IA',
        default=False,
        help_text="True si cet événement a déjà été utilisé pour ré-entraîner l'IA"
    )
    
    ai_priority_score = models.FloatField(
        'Score de priorité IA',
        null=True, blank=True,
        help_text="Score calculé par l'IA (0-1) pour recommander l'événement"
    )
    
    ai_updated_at = models.DateTimeField(
        'Dernière mise à jour IA',
        null=True, blank=True,
        help_text="Date du dernier calcul par l'IA"
    )
    
    class Meta:
        verbose_name = 'Événement'
        verbose_name_plural = 'Événements'
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['type']),
            models.Index(fields=['start_date']),
            models.Index(fields=['city']),
            models.Index(fields=['used_for_ai_training']),
            models.Index(fields=['ai_priority_score']),
        ]
    
    def __str__(self):
        return self.Event_Name
    
    def clean(self):
        if self.end_date and self.start_date:
            if self.end_date <= self.start_date:
                raise ValidationError({
                    'end_date': 'La date de fin doit être après la date de début'
                })
        
        if self.Duration and self.Duration.total_seconds() <= 0:
            raise ValidationError({
                'Duration': 'La durée doit être positive'
            })
    
    # ==========================================
    # PROPRIÉTÉS
    # ==========================================
    
    @property
    def is_published(self):
        return self.status == 'PUBLISHED'
    
    @property
    def is_cancelled(self):
        return self.status == 'CANCELLED'
    
    @property
    def is_complete(self):
        return self.status == 'COMPLET'
    
    @property
    def is_draft(self):
        return self.status == 'DRAFT'
    
    @property
    def is_upcoming(self):
        return self.start_date > timezone.now()
    
    @property
    def is_ongoing(self):
        now = timezone.now()
        return self.start_date <= now <= self.end_date if self.end_date else self.start_date <= now
    
    @property
    def is_past(self):
        return self.end_date < timezone.now() if self.end_date else self.start_date < timezone.now()
    
    @property
    def formatted_duration(self):
        total_seconds = self.Duration.total_seconds()
        hours = int(total_seconds // 3600)
        minutes = int((total_seconds % 3600) // 60)
        
        if hours > 0 and minutes > 0:
            return f"{hours}h{minutes}"
        elif hours > 0:
            return f"{hours}h"
        else:
            return f"{minutes}min"
    
    @property
    def registrations_count(self):
        """Nombre d'inscriptions confirmées (depuis EventRegistrationRequest)"""
        from apps.registrations.models import EventRegistrationRequest
        return EventRegistrationRequest.objects.filter(
            event=self,
            status='CONFIRMED'
        ).count()
    
    @property
    def places_remaining(self):
        if self.max_places == 0:
            return 999999
        return max(0, self.max_places - self.registrations_count)
    
    @property
    def is_full(self):
        if self.max_places == 0:
            return False
        return self.registrations_count >= self.max_places
    
    @property
    def poster_url(self):
        """Retourne l'URL du poster"""
        if self.poster:
            return self.poster.url
        return None
    
    # ==========================================
    # PROPRIÉTÉS POUR L'IA
    # ==========================================
    
    @property
    def duration_hours(self):
        return self.Duration.total_seconds() / 3600
    
    @property
    def cost_value(self):
        return float(self.Cost)
    
    @property
    def cost_efficiency(self):
        max_cost = 5000
        if max_cost > 0:
            return 1 - (float(self.Cost) / max_cost)
        return 1.0
    
    @property
    def volunteer_intensity(self):
        max_volunteers = 18
        if max_volunteers > 0:
            return self.Volunteers / max_volunteers
        return 0
    
    @property
    def calculated_priority_score(self):
        score = (
            0.5 * (self.predicted_social_impact or 0.7) +
            0.3 * self.cost_efficiency +
            0.2 * self.volunteer_intensity
        )
        return round(score, 2)
    
    def update_ai_score(self):
        self.ai_priority_score = self.calculated_priority_score
        self.ai_updated_at = timezone.now()
        self.save(update_fields=['ai_priority_score', 'ai_updated_at'])
    
    def update_status_based_on_capacity(self):
        if self.status == 'PUBLISHED' and self.is_full:
            self.status = 'COMPLET'
            self.save()
        elif self.status == 'COMPLET' and not self.is_full:
            self.status = 'PUBLISHED'
            self.save()


class EventImage(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField('Image', upload_to='events/gallery/')
    caption = models.CharField('Légende', max_length=200, blank=True)
    order = models.PositiveIntegerField('Ordre', default=0)
    uploaded_at = models.DateTimeField('Date d\'upload', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Photo d\'événement'
        verbose_name_plural = 'Photos d\'événements'
        ordering = ['order', 'uploaded_at']
    
    def __str__(self):
        return f"Photo de {self.event.Event_Name} - Ordre {self.order}"