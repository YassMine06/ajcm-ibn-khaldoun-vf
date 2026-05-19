import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User

print("Recherche de l'admin existant...")

# Supprimer l'ancien s'il existe
deleted = User.objects.filter(email='admin@ajcm.ma').delete()
print(f"Anciens comptes supprimés: {deleted[0]}")

# Créer le superuser
user = User(
    email='admin@ajcm.ma',
    username='admin',
    first_name='Admin',
    last_name='System',
    is_staff=True,
    is_superuser=True,
    is_active=True,
    role='ADMIN',
    must_change_password=False
)
user.set_password('admin123')
user.save()

print("=" * 50)
print("✅ ADMIN CRÉÉ AVEC SUCCÈS !")
print("=" * 50)
print("Email    : admin@ajcm.ma")
print("Password : admin123")
print("=" * 50)

# Vérification
count = User.objects.filter(email='admin@ajcm.ma').count()
print(f"Vérification: {count} compte(s) trouvé(s)")