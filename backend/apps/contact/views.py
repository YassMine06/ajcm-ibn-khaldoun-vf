from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from core.permissions import IsAdmin
from .models import ContactMessage
from .serializers import ContactMessageSerializer


class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    
    def get_serializer_class(self):
        return ContactMessageSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdmin()]
    
    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(
                user=self.request.user,
                name=self.request.user.full_name,
                email=self.request.user.email
            )
        else:
            serializer.save()
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        message = self.get_object()
        message.mark_as_read()
        return Response({'status': 'marked_as_read'})