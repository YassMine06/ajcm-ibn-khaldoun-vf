from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.permissions import IsAdmin
from .services import AnalyticsService


class DashboardStatsView(APIView):
    """Statistiques du tableau de bord"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get(self, request):
        stats = AnalyticsService.get_dashboard_stats()
        return Response(stats)


class WeeklyActivityView(APIView):
    """Activité hebdomadaire"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get(self, request):
        data = AnalyticsService.get_weekly_activity()
        return Response(data)


class EventsByTypeView(APIView):
    """Événements par type"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get(self, request):
        data = AnalyticsService.get_events_by_type()
        return Response(data)