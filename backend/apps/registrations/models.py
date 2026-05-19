from django.db import models
from django.utils import timezone
from core.models import TimeStampedModel
from apps.users.models import User
from apps.events.models import Event


class MembershipRequest(TimeStampedModel):
    """
    Demande d'adhésion à l'association (devenir membre)
    """
    STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('APPROVED', 'Approuvé'),
        ('REJECTED', 'Rejeté'),
    ]

    first_name = models.CharField('Prénom', max_length=150)
    last_name = models.CharField('Nom', max_length=150)
    email = models.EmailField('Email')
    phone = models.CharField('Téléphone', max_length=20)
    age = models.PositiveIntegerField('Âge')
    city = models.CharField('Ville', max_length=100)
    motivation = models.TextField('Motivation')

    status = models.CharField('Statut', max_length=20, choices=STATUS_CHOICES, default='PENDING')
    processed_at = models.DateTimeField('Date de traitement', null=True, blank=True)

    created_user = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='membership_request'
    )

    class Meta:
        verbose_name = 'Demande d\'adhésion'
        verbose_name_plural = 'Demandes d\'adhésion'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.email}"


class EventRegistrationRequest(TimeStampedModel):
    """
    Demande d'inscription à un événement
    """
    STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('CONFIRMED', 'Confirmé'),
        ('REJECTED', 'Rejeté'),
        ('CANCELLED', 'Annulé'),
    ]

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='registration_requests')
    full_name = models.CharField('Nom complet', max_length=200)
    email = models.EmailField('Email')
    phone = models.CharField('Téléphone', max_length=20, blank=True)
    notes = models.TextField('Notes', blank=True)

    status = models.CharField('Statut', max_length=20, choices=STATUS_CHOICES, default='CONFIRMED')
    confirmed_at = models.DateTimeField('Date de confirmation', null=True, blank=True)

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='event_registration_requests'
    )

    class Meta:
        verbose_name = 'Inscription à un événement'
        verbose_name_plural = 'Inscriptions aux événements'
        ordering = ['-created_at']
        unique_together = [['event', 'email']]

    def __str__(self):
        return f"{self.full_name} - {self.event.Event_Name}"

    def save(self, *args, **kwargs):
        if not self.pk and self.status == 'PENDING':
            event = self.event
            if not event.is_full and not event.is_past:
                self.status = 'CONFIRMED'
                self.confirmed_at = timezone.now()
        super().save(*args, **kwargs)