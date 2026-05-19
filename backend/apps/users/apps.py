from django.apps import AppConfig

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'  # Important : chemin complet
    label = 'users'  # Ajoutez ceci
    verbose_name = 'Utilisateurs'