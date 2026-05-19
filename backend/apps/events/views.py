from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from core.permissions import IsAdmin
from .models import Event
from .serializers import EventSerializer, EventCreateUpdateSerializer


class EventViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des événements
    """
    queryset = Event.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'city']
    search_fields = ['Event_Name', 'description', 'location']
    ordering_fields = ['start_date', 'created_at', 'Event_Name']
    ordering = ['-start_date']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return EventCreateUpdateSerializer
        return EventSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [IsAuthenticatedOrReadOnly()]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publier un événement"""
        event = self.get_object()
        if event.status == 'DRAFT':
            event.status = 'PUBLISHED'
            event.save()
            return Response({'status': 'published'})
        return Response({'error': 'Impossible de publier cet événement'}, status=400)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Liste des événements à venir"""
        from django.utils import timezone
        events = Event.objects.filter(
            status='PUBLISHED',
            start_date__gt=timezone.now()
        ).order_by('start_date')
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)