from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from apps.users.models import User
from apps.events.models import Event
from apps.announcements.models import Announcement
from apps.registrations.models import EventRegistrationRequest  # Utiliser le nouveau modèle

class AnalyticsService:
    @staticmethod
    def get_dashboard_stats():
        now = timezone.now()
        last_7_days = now - timedelta(days=7)

        total_members = User.objects.filter(role__in=['MEMBER_STANDARD', 'MEMBER_BUREAU']).count()
        new_members_last_7d = User.objects.filter(role__in=['MEMBER_STANDARD', 'MEMBER_BUREAU'], date_joined__gte=last_7_days).count()
        growth_rate = (new_members_last_7d / total_members * 100) if total_members > 0 else 0

        total_events = Event.objects.count()
        upcoming_events = Event.objects.filter(start_date__gt=now, status='PUBLISHED').count()

        total_registrations = EventRegistrationRequest.objects.filter(status='CONFIRMED').count()
        new_registrations_last_7d = EventRegistrationRequest.objects.filter(status='CONFIRMED', created_at__gte=last_7_days).count()

        engagement_rate = (total_registrations / total_members * 100) if total_members > 0 else 0

        active_announcements = Announcement.objects.filter(is_active=True).count()

        return {
            'members': {'total': total_members, 'new_last_7d': new_members_last_7d, 'growth_rate': round(growth_rate, 1)},
            'events': {'total': total_events, 'upcoming': upcoming_events},
            'registrations': {'total': total_registrations, 'new_last_7d': new_registrations_last_7d},
            'engagement_rate': round(engagement_rate, 1),
            'announcements': {'active': active_announcements}
        }

    @staticmethod
    def get_weekly_activity():
        from django.db.models.functions import ExtractWeekDay
        registrations_by_day = EventRegistrationRequest.objects.filter(status='CONFIRMED').annotate(
            weekday=ExtractWeekDay('created_at')
        ).values('weekday').annotate(count=Count('id'))
        days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
        activity = {day: 0 for day in days}
        day_mapping = {2: 'Lun', 3: 'Mar', 4: 'Mer', 5: 'Jeu', 6: 'Ven', 7: 'Sam', 1: 'Dim'}
        for item in registrations_by_day:
            day_name = day_mapping.get(item['weekday'])
            if day_name:
                activity[day_name] = item['count']
        return [{'day': day, 'count': activity[day]} for day in days]

    @staticmethod
    def get_events_by_type():
        events_by_type = Event.objects.values('type').annotate(count=Count('id')).order_by('-count')
        type_labels = {
            'CULTURE': 'Culture', 'JEUNESSE': 'Jeunesse', 'FORMATION': 'Formation',
            'SPORT': 'Sport', 'ART': 'Art', 'SOLIDARITE': 'Solidarité',
            'SANTE': 'Santé', 'CITOYENNETE': 'Citoyenneté',
        }
        return [{'type': type_labels.get(item['type'], item['type']), 'count': item['count']} for item in events_by_type]