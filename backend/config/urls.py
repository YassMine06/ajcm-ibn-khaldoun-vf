from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)


def api_root(request):
    return JsonResponse(
        {
            "message": "Bienvenue sur l'API AJCM Ibn Khaldoun",
            "version": "1.0.0",
            "documentation": {
                "swagger": "/api/docs/",
                "redoc": "/api/redoc/",
                "schema": "/api/schema/",
            },
            "endpoints": {
                "auth": "/api/auth/",
                "users": "/api/users/",
                "events": "/api/events/",
                "registrations": "/api/registrations/",
                "announcements": "/api/announcements/",
                "contact": "/api/contact/",
                "partners": "/api/partners/",
            },
            "status": "operational",
        }
    )


urlpatterns = [
    # API Root
    path("api/", api_root, name="api-root"),
    # Swagger / OpenAPI
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    # Admin
    path("admin/", admin.site.urls),
    # API Routes
    path("api/auth/", include("apps.users.urls_auth")),
    path("api/users/", include("apps.users.urls")),
    path("api/events/", include("apps.events.urls")),
    path("api/registrations/", include("apps.registrations.urls")),
    path("api/announcements/", include("apps.announcements.urls")),
    path("api/contact/", include("apps.contact.urls")),
    path("api/partners/", include("apps.partners.urls")),
    path("api/admin/stats/", include("apps.analytics.urls")),
    # AI
    path("api/ai/", include("apps.ai.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
