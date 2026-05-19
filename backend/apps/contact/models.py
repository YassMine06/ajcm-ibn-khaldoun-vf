from django.db import models
from core.models import TimeStampedModel
from apps.users.models import User


class ContactMessage(TimeStampedModel):
    """
    Modèle ContactMessage - Messages envoyés via le formulaire de contact
    """
    
    STATUS_CHOICES = [
        ('UNREAD', 'Non lu'),
        ('READ', 'Lu'),
        ('REPLIED', 'Répondu'),
        ('ARCHIVED', 'Archivé'),
    ]
    
    name = models.CharField('Nom complet', max_length=100)
    email = models.EmailField('Adresse e-mail')
    subject = models.CharField('Sujet', max_length=200)
    message = models.TextField('Message')
    
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='contact_messages'
    )
    
    status = models.CharField(
        'Statut',
        max_length=20,
        choices=STATUS_CHOICES,
        default='UNREAD'
    )
    
    admin_reply = models.TextField('Réponse', blank=True)
    replied_at = models.DateTimeField('Date de réponse', null=True, blank=True)
    
    class Meta:
        verbose_name = 'Message de contact'
        verbose_name_plural = 'Messages de contact'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.subject} - {self.name}"
    
    def mark_as_read(self):
        if self.status == 'UNREAD':
            self.status = 'READ'
            self.save(update_fields=['status'])