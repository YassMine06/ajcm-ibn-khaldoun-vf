from django.urls import path
from .views import (
    DashboardStatsView,
    WeeklyActivityView,
    EventsByTypeView
)

urlpatterns = [
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('weekly-activity/', WeeklyActivityView.as_view(), name='weekly-activity'),
    path('events-by-type/', EventsByTypeView.as_view(), name='events-by-type'),
]