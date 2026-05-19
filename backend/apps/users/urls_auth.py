from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views_auth import LoginView, LogoutView, ChangePasswordView, MeView, MemberRegisterView, AdminLoginView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('admin-login/', AdminLoginView.as_view(), name='admin-login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('me/', MeView.as_view(), name='me'),
    path('register/', MemberRegisterView.as_view(), name='register'),
]