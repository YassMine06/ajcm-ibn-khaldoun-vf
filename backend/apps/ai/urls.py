# apps/ai/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('optimize/', views.optimize_activities, name='ai-optimize'),
    path('retrain/',  views.retrain_model,        name='ai-retrain'),
]
