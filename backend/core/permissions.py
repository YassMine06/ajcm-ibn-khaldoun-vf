# core/permissions.py

from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Permission pour les superutilisateurs uniquement"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin


class IsMemberStandard(permissions.BasePermission):
    """Permission pour les membres standards"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'MEMBER_STANDARD'


class IsMemberBureau(permissions.BasePermission):
    """Permission pour les membres du bureau"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'MEMBER_BUREAU'


class IsMemberOrAdmin(permissions.BasePermission):
    """Permission pour tous les membres et admins"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.role in ['MEMBER_STANDARD', 'MEMBER_BUREAU'] or request.user.is_admin
        )