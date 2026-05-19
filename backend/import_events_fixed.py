import os
import django
from datetime import datetime, timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.files import File
from apps.events.models import Event, EventImage
from apps.users.models import User

admin = User.objects.filter(role='ADMIN').first()
if not admin:
    print("❌ Aucun administrateur trouvé")
    exit()

FRONTEND_PATH = "C:/Users/PC/ajcm-ibn-khaldoun/public/Evenements"

# Mapping des catégories
type_mapping = {
    "cat-1": "CULTURE", "cat-2": "SOLIDARITE", "cat-3": "FORMATION",
    "cat-4": "EVENEMENT", "cat-5": "ART", "cat-6": "SPORT",
    "cat-7": "SOLIDARITE", "cat-8": "SANTE", "cat-9": "CITOYENNETE",
}

# Liste des événements (version simplifiée)
events_data = [
    {"folder": "مهرجان الانشودة", "title": "Festival de l'Anashid", "lieu": "دار الشباب العربي", "categoryId": "cat-1", "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg"]},
    {"folder": "مخيم إيموزار", "title": "Camp Imouzzer", "lieu": "", "categoryId": "cat-2", "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg"]},
    {"folder": "الجامعة لصيفية للشباب", "title": "Université d'Été", "lieu": "", "categoryId": "cat-3", "media": ["poster1.jpg", "poster2.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg", "13.jpg", "14.jpg", "15.jpg", "16.jpg", "17.jpg", "18.jpg", "19.jpg"]},
    {"folder": "masterclass", "title": "Masterclass", "lieu": "", "categoryId": "cat-3", "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg"]},
    {"folder": "ربيع شباب المواطنة", "title": "Printemps de la Jeunesse Citoyenne", "lieu": "دار الشباب ابن خلدون", "categoryId": "cat-4", "media": ["poster.jpg"]},
    {"folder": "مخيم المنظر الجميل العالية المحمدية", "title": "Camp Beau Paysage", "lieu": "", "categoryId": "cat-2", "media": ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg"]},
    {"folder": "دورة تكوينية في المسرح", "title": "Formation en Art Théâtral", "lieu": "", "categoryId": "cat-5", "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg"]},
    {"folder": "دورة تكوينية في الأنشودة التربوية", "title": "Formation en Anashid Éducatif", "lieu": "دار الشباب العربي", "categoryId": "cat-3", "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg"]},
    {"folder": "التدريب الوطني للأنشودة", "title": "Stage National de l'Anashid", "lieu": "مركز التخييم بوزنيقة", "categoryId": "cat-3", "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg", "13.jpg", "14.jpg", "15.jpg"]},
    {"folder": "بيداغوجية تسيير الاناشيد", "title": "Pédagogie de Gestion des Anashid", "lieu": "", "categoryId": "cat-3", "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg"]},
    {"folder": "ورشة في المسرح", "title": "Atelier Théâtre", "lieu": "", "categoryId": "cat-5", "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg"]},
    {"folder": "ورشة في الارتجال المسرحي", "title": "Atelier d'Improvisation", "lieu": "دار الشباب ابن خلدون", "categoryId": "cat-5", "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg"]},
    {"folder": "مدخل الى مسرح المنتدى", "title": "Introduction au Théâtre Forum", "lieu": "دار الشباب ابن خلدون", "categoryId": "cat-5", "media": ["poster.jpg"]},
    {"folder": "عين وحكاية", "title": "Œil et Histoire", "lieu": "دار الشباب ابن خلدون", "categoryId": "cat-5", "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg"]},
    {"folder": "رسم حنتك", "title": "Atelier Dessin", "lieu": "دار الشباب ابن خلدون", "categoryId": "cat-5", "media": ["poster.jpg", "1.jpg", "2.jpg"]},
    {"folder": "حصة في الشطرنج 1", "title": "Session d'Échecs 1", "lieu": "دار الشباب ابن خلدون", "categoryId": "cat-6", "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg"]},
    {"folder": "حصة في الشطرنج 2", "title": "Session d'Échecs 2", "lieu": "دار الشباب ابن خلدون", "categoryId": "cat-6", "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg"]},
    {"folder": "اليوم العالمي للعب", "title": "Journée Mondiale du Jeu", "lieu": "", "categoryId": "cat-2", "media": ["poster1.jpg", "poster2.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg"]},
    {"folder": "تبرع بالدم 1", "title": "Campagne de Don du Sang 1", "lieu": "", "categoryId": "cat-7", "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg"]},
    {"folder": "قافلة الأمل للتبرع بالدم 1", "title": "Caravane Don du Sang 1", "lieu": "قرب مسرح عبد الرحيم بوعبيد", "categoryId": "cat-7", "media": ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg", "13.jpg", "14.jpg", "15.jpg", "16.jpg", "17.jpg", "18.jpg", "19.jpg", "20.jpg"]},
    {"folder": "قافلة الأمل للتبرع   2 بالدم", "title": "Caravane Don du Sang 2", "lieu": "قرب مسرح عبد الرحيم بوعبيد", "categoryId": "cat-7", "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg", "13.jpg", "14.jpg", "15.jpg", "16.jpg", "17.jpg", "18.jpg", "19.jpg", "20.jpg"]},
    {"folder": "توزيع قفف رمضان", "title": "Distribution des Paniers de Ramadan", "lieu": "", "categoryId": "cat-7", "media": ["poster.jpg", "2.jpg", "3.jpg", "4.jpg"]},
    {"folder": "حملة طبية للكشف عن داء سرطان الثدي وعنق الرحم 1", "title": "Campagne Dépistage Cancer 1", "lieu": "دار الشباب الشلالات", "categoryId": "cat-8", "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg"]},
    {"folder": "قافلة الكشف المبكر عن سرطان الثدي و عنق الرحم 2", "title": "Caravane Dépistage Cancer 2", "lieu": "المستوصف الصحي عين تكي", "categoryId": "cat-8", "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg"]},
    {"folder": "أمسية روحانية", "title": "Soirée Spirituelle", "lieu": "دار الشباب ابن خلدون", "categoryId": "cat-1", "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg"]},
    {"folder": "أمسية قرانية", "title": "Soirée Coranique", "lieu": "دار الشباب ابن خلدون", "categoryId": "cat-1", "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg", "13.jpg", "14.jpg", "15.jpg", "16.jpg"]},
    {"folder": "مائدة مستديرة تحت عنوان الشباب والمشاركة السياسية", "title": "Table Ronde Participation Politique", "lieu": "", "categoryId": "cat-9", "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg", "13.jpg"]},
    {"folder": "العرض الوطني لتنشيط مؤسسات الشباب بين التنزيل والتحديات", "title": "Présentation Nationale", "lieu": "", "categoryId": "cat-9", "media": ["1.jpg", "2.jpg"]},
    {"folder": "ندوة مستجدات العرض الوطني للتخييم", "title": "Séminaire Programme National Camping", "lieu": "", "categoryId": "cat-3", "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg"]},
]

print("📥 Importation des événements...")

created = 0
for item in events_data:
    try:
        event_type = type_mapping.get(item.get('categoryId', 'cat-3'), 'FORMATION')
        now = timezone.now()
        
        event = Event(
            Event_Name=item['title'],
            type=event_type,
            Duration=timedelta(hours=4),
            Cost=0,
            Volunteers=0,
            description=item['title'],
            start_date=now,
            end_date=now + timedelta(hours=4),
            location=item.get('lieu', 'Dar Chabab Ibn Khaldoun'),
            city="Mohammedia",
            max_places=100,
            status="PUBLISHED",
            created_by=admin
        )
        event.save()
        
        # Ajouter les images
        event_folder = os.path.join(FRONTEND_PATH, item['folder'])
        images_count = 0
        
        if os.path.exists(event_folder):
            for img_name in item.get('media', []):
                img_path = os.path.join(event_folder, img_name)
                if os.path.exists(img_path) and img_name.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                    event_image = EventImage(event=event, order=images_count)
                    with open(img_path, 'rb') as f:
                        event_image.image.save(img_name, File(f))
                        event_image.save()
                        images_count += 1
            print(f"✅ {event.Event_Name} : {images_count} images")
        else:
            print(f"⚠️ Dossier manquant : {item['folder']}")
        
        created += 1
    except Exception as e:
        print(f"❌ Erreur {item.get('title')}: {e}")

print(f"\n✅ {created} événements importés")