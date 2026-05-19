from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from core.permissions import IsAdmin
from .models import MembershipRequest, EventRegistrationRequest
from .serializers import (
    MembershipRequestCreateSerializer, MembershipRequestSerializer,
    EventRegistrationRequestCreateSerializer, EventRegistrationRequestSerializer
)
from .services import MembershipRequestService


# --- Public APIs ---
class CreateMembershipRequestView(generics.CreateAPIView):
    """Soumettre une demande d'adhésion"""
    queryset = MembershipRequest.objects.all()
    serializer_class = MembershipRequestCreateSerializer
    permission_classes = [AllowAny]


class CreateEventRegistrationRequestView(generics.CreateAPIView):
    """Soumettre une demande d'inscription à un événement (vérification auto)"""
    queryset = EventRegistrationRequest.objects.all()
    serializer_class = EventRegistrationRequestCreateSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        event = serializer.validated_data['event']
        # Vérifications avant création
        if event.is_full:
            return Response({"error": "Plus de places disponibles."}, status=status.HTTP_400_BAD_REQUEST)
        if event.is_past:
            return Response({"error": "Cet événement est déjà passé."}, status=status.HTTP_400_BAD_REQUEST)
        if EventRegistrationRequest.objects.filter(event=event, email=serializer.validated_data['email']).exists():
            return Response({"error": "Vous êtes déjà inscrit à cet événement."}, status=status.HTTP_400_BAD_REQUEST)

        # Création (le save() du modèle passe le statut à CONFIRMED automatiquement)
        if request.user.is_authenticated:
            instance = serializer.save(user=request.user, status='PENDING')
        else:
            instance = serializer.save(status='PENDING')

        # Récupérer le statut final (CONFIRMED ou éventuellement PENDING si erreur)
        return Response({
            "status": instance.status,
            "message": "Inscription enregistrée." if instance.status == 'CONFIRMED' else "Demande en attente.",
            "data": self.get_serializer(instance).data
        }, status=status.HTTP_201_CREATED)


# --- Admin APIs ---
class AdminMembershipRequestListView(generics.ListAPIView):
    """Liste toutes les demandes d'adhésion"""
    queryset = MembershipRequest.objects.all()
    serializer_class = MembershipRequestSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


class AdminMembershipRequestActionView(generics.GenericAPIView):
    """Approuver ou rejeter une demande d'adhésion"""
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        try:
            req = MembershipRequest.objects.get(pk=pk)
        except MembershipRequest.DoesNotExist:
            return Response({'error': 'Demande non trouvée'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')
        if action == 'approve':
            if MembershipRequestService.approve(req):
                return Response({'status': 'approved'})
            return Response({'error': 'Impossible d\'approuver'}, status=status.HTTP_400_BAD_REQUEST)
        elif action == 'reject':
            if MembershipRequestService.reject(req):
                return Response({'status': 'rejected'})
            return Response({'error': 'Impossible de rejeter'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'Action invalide'}, status=status.HTTP_400_BAD_REQUEST)


class AdminEventRegistrationRequestListView(generics.ListAPIView):
    """Liste toutes les demandes d'inscription aux événements"""
    queryset = EventRegistrationRequest.objects.all()
    serializer_class = EventRegistrationRequestSerializer
    permission_classes = [IsAuthenticated, IsAdmin]