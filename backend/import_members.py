import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.files import File
from apps.users.models import User

# Dossier des photos
PHOTOS_DIR = "C:/Users/PC/Desktop/ajcm_backend/media/profile_pics"

# Données des membres (uniquement ceux avec email)
members_data = [
    {"name": "Mohammed Ouatiq", "email": "simoouatiq29@gmail.com", "role": "membre", "phone": "612292922", "age": 22, "photo": "Mohammed Ouatiq.png"},
    {"name": "Farouk Sargha", "email": "farouksargha8@gmail.com", "role": "membre", "phone": "771635852", "age": 21, "photo": "Farouk sargha.png"},
    {"name": "Yahya Fikrine", "email": "yahyaoffon12@gmail.com", "role": "membre", "phone": "773275830", "age": 17, "photo": "Yahya Fikrine.png"},
    {"name": "Amal chit", "email": "chitamal2022@gmail.com", "role": "membre", "phone": "644347994", "age": None, "photo": "Amal chit.png"},
    {"name": "Rachida chit", "email": "rachidachit.1995@gmail.com", "role": "membre de bureau", "phone": "606472123", "age": 30, "photo": None},
    {"name": "abd elbasset tijani", "email": "abdelbassettijani2001@gmail.com", "role": "membre", "phone": "701788763", "age": None, "photo": "abd elbasset tijani.png"},
    {"name": "Aya aydouni", "email": "aydouniaya83@gmail.com", "role": "membre", "phone": "670398212", "age": 21, "photo": "Aya aydouni.png"},
    {"name": "jihane adakiri", "email": "adakirijihane@gmail.com", "role": "membre", "phone": "634728147", "age": 20, "photo": "jihane adakiri.png"},
    {"name": "aya sargha", "email": "ayasargha8@gmail.com", "role": "membre", "phone": "645660561", "age": 18, "photo": None},
    {"name": "hiba Touil", "email": "helmabtoul3@gmail.com", "role": "membre", "phone": "713371182", "age": 16, "photo": None},
    {"name": "Amina Salimi", "email": "salimisalimi575@gmail.com", "role": "membre", "phone": "619760117", "age": 20, "photo": None},
    {"name": "Rabab boudlal", "email": "r72412110@gmail.com", "role": "membre", "phone": "707863020", "age": None, "photo": None},
    {"name": "Jawad Hadi", "email": "jawad.hadi@ajcm.ma", "role": "membre de bureau", "phone": "660057425", "age": 36, "photo": "Jawad Hadi.png"},
    {"name": "Said Fikrine", "email": "said@ajcm.ma", "role": "president", "phone": "667015703", "age": None, "photo": "Saaid Fikrine.png"},
]

def split_name(full_name):
    parts = full_name.strip().split()
    if len(parts) >= 2:
        first_name = " ".join(parts[:-1])
        last_name = parts[-1]
    else:
        first_name = full_name
        last_name = ""
    return first_name, last_name

def get_role(role_str):
    if role_str == "president":
        return "ADMIN"
    elif role_str == "membre de bureau":
        return "MEMBER_BUREAU"
    else:
        return "MEMBER_STANDARD"

print("📥 Importation des membres avec email...")
print("=" * 50)

created = 0
updated = 0
errors = 0

for item in members_data:
    try:
        first_name, last_name = split_name(item['name'])
        
        # Vérifier si l'utilisateur existe déjà
        existing = User.objects.filter(email=item['email']).first()
        
        if existing:
            existing.first_name = first_name
            existing.last_name = last_name
            existing.phone = item.get('phone', '')
            existing.age = item.get('age')
            existing.role = get_role(item['role'])
            existing.save()
            user = existing
            print(f"🔄 Membre mis à jour : {first_name} {last_name}")
            updated += 1
        else:
            user = User(
                email=item['email'],
                first_name=first_name,
                last_name=last_name,
                phone=item.get('phone', ''),
                age=item.get('age'),
                role=get_role(item['role']),
                is_active=True,
                must_change_password=True
            )
            user.set_password('ajcm123')
            user.save()
            print(f"✅ Membre créé : {first_name} {last_name} ({item['email']})")
            created += 1
        
        # Ajouter la photo
        photo_filename = item.get('photo')
        if photo_filename:
            photo_path = os.path.join(PHOTOS_DIR, photo_filename)
            if os.path.exists(photo_path):
                with open(photo_path, 'rb') as f:
                    user.photo.save(photo_filename, File(f))
                    user.save()
                print(f"   📸 Photo ajoutée : {photo_filename}")
            else:
                print(f"   ⚠️ Photo non trouvée : {photo_filename}")
                
    except Exception as e:
        errors += 1
        print(f"❌ Erreur {item['name']}: {e}")

print("=" * 50)
print(f"\n📊 Résultat :")
print(f"   ✨ Nouveaux membres : {created}")
print(f"   🔄 Membres mis à jour : {updated}")
print(f"   ❌ Erreurs : {errors}")
print(f"   📋 Total membres dans la BDD : {User.objects.count()}")