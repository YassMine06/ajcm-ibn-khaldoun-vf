from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import MembershipRequest

User = get_user_model()


class MembershipRequestService:
    @staticmethod
    def approve(request_obj):
        if request_obj.status != 'PENDING':
            return False

        temp_password = User.objects.make_random_password(length=12)

        user = User.objects.create(
            email=request_obj.email,
            first_name=request_obj.first_name,
            last_name=request_obj.last_name,
            phone=request_obj.phone,
            age=request_obj.age,
            city=request_obj.city,
            role='MEMBER_STANDARD',
            is_active=True,
            must_change_password=True,
            bio=request_obj.motivation
        )
        user.set_password(temp_password)
        user.save()

        request_obj.created_user = user
        request_obj.status = 'APPROVED'
        request_obj.processed_at = timezone.now()
        request_obj.save()

        subject = "Bienvenue à l'AJCM - Vos identifiants de connexion"
        message = f"""
        Bonjour {user.first_name},

        Votre demande d'adhésion a été acceptée.

        Identifiants :
        Email : {user.email}
        Mot de passe temporaire : {temp_password}

        Connectez-vous ici : http://localhost:3000/membre/login

        Cordialement,
        L'équipe AJCM
        """
        send_mail(subject, '', settings.DEFAULT_FROM_EMAIL, [user.email], html_message=message)
        return True

    @staticmethod
    def reject(request_obj):
        if request_obj.status != 'PENDING':
            return False
        request_obj.status = 'REJECTED'
        request_obj.processed_at = timezone.now()
        request_obj.save()

        subject = "Votre demande d'adhésion à l'AJCM"
        message = f"""
        Bonjour {request_obj.first_name},

        Nous avons examiné votre demande. Malheureusement, elle n'a pas été retenue.

        Cordialement,
        L'équipe AJCM
        """
        send_mail(subject, '', settings.DEFAULT_FROM_EMAIL, [request_obj.email], html_message=message)
        return True