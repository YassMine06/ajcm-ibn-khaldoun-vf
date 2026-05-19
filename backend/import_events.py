import os
import django
from datetime import datetime, timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.files import File
from apps.events.models import Event, EventImage
from apps.users.models import User

# Récupérer l'admin
admin = User.objects.filter(role='ADMIN').first()
if not admin:
    print("❌ Aucun administrateur trouvé")
    exit()

# Chemins
FRONTEND_PATH = "C:/Users/PC/ajcm-ibn-khaldoun/public/Evenements"
BACKEND_MEDIA = "media/events/gallery"
os.makedirs(BACKEND_MEDIA, exist_ok=True)

# Mapping des catégories
type_mapping = {
    "cat-1": "CULTURE",
    "cat-2": "SOLIDARITE",
    "cat-3": "FORMATION",
    "cat-4": "EVENEMENT",
    "cat-5": "ART",
    "cat-6": "SPORT",
    "cat-7": "SOLIDARITE",
    "cat-8": "SANTE",
    "cat-9": "CITOYENNETE",
}

# Liste des événements (à garder ABSOLUMENT)
events_data = [
    {
        "folder": "مهرجان الانشودة",
        "title": "Festival de l'Anashid",
        "desc": "Festival dédié à l'art de l'Anashid islamique",
        "date": "السبت 03 ماي",
        "lieu": "دار الشباب العربي، بالمحمدية",
        "description_fr": "La première édition du Festival de Chant",
        "categoryId": "cat-1",
        "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg"]
    },
    {
        "folder": "مخيم إيموزار",
        "title": "Camp Imouzzer",
        "desc": "Colonie de vacances estivale",
        "date": "",
        "lieu": "",
        "description_fr": "Colonie de vacances estivale",
        "categoryId": "cat-2",
        "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg"]
    },
    {
        "folder": "الجامعة لصيفية للشباب",
        "title": "Université d'Été de la Jeunesse",
        "desc": "Programme estival de formation",
        "date": "",
        "lieu": "",
        "description_fr": "Programme estival de formation",
        "categoryId": "cat-3",
        "media": ["poster1.jpg", "poster2.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg", "13.jpg", "14.jpg", "15.jpg", "16.jpg", "17.jpg", "18.jpg", "19.jpg"]
    },
    {
        "folder": "masterclass",
        "title": "Masterclass",
        "desc": "Sessions de formation intensive",
        "date": "",
        "lieu": "",
        "description_fr": "Sessions de formation intensive",
        "categoryId": "cat-3",
        "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg"]
    },
    {
        "folder": "ربيع شباب المواطنة",
        "title": "Printemps de la Jeunesse Citoyenne",
        "desc": "Événement annuel",
        "date": "من 12 إلى 25 أبريل 2026",
        "lieu": "دار الشباب ابن خلدون",
        "description_fr": "Festival avec ateliers artistiques",
        "categoryId": "cat-4",
        "media": ["poster.jpg"]
    },
    {
        "folder": "مخيم المنظر الجميل العالية المحمدية",
        "title": "Camp Beau Paysage — Al Aaliya",
        "desc": "Colonie d'été",
        "date": "",
        "lieu": "",
        "description_fr": "Colonie d'été",
        "categoryId": "cat-2",
        "media": ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg"]
    },
    {
        "folder": "دورة تكوينية في المسرح",
        "title": "Formation en Art Théâtral",
        "desc": "Cycle de formation",
        "date": "",
        "lieu": "",
        "description_fr": "Cycle de formation",
        "categoryId": "cat-5",
        "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg"]
    },
    {
        "folder": "دورة تكوينية في الأنشودة التربوية",
        "title": "Formation en Anashid Éducatif",
        "desc": "Atelier de formation",
        "date": "السبت 12 أبريل",
        "lieu": "دار الشباب العربي",
        "description_fr": "Session de formation en chant éducatif",
        "categoryId": "cat-3",
        "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg"]
    },
    {
        "folder": "التدريب الوطني للأنشودة",
        "title": "Stage National de l'Anashid",
        "desc": "Stage de formation nationale",
        "date": "14، 15 و16 نونبر",
        "lieu": "مركز التخييم بوزنيقة",
        "description_fr": "Formation nationale sur le chant",
        "categoryId": "cat-3",
        "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg", "13.jpg", "14.jpg", "15.jpg"]
    },
    {
        "folder": "بيداغوجية تسيير الاناشيد",
        "title": "Pédagogie de Gestion des Anashid",
        "desc": "Session pédagogique",
        "date": "",
        "lieu": "",
        "description_fr": "Session pédagogique",
        "categoryId": "cat-3",
        "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg"]
    },
    {
        "folder": "ورشة في المسرح",
        "title": "Atelier Théâtre",
        "desc": "Atelier pratique",
        "date": "",
        "lieu": "",
        "description_fr": "Atelier pratique d'initiation aux arts de la scène",
        "categoryId": "cat-5",
        "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg"]
    },
    {
        "folder": "ورشة في الارتجال المسرحي",
        "title": "Atelier d'Improvisation Théâtrale",
        "desc": "Atelier d'improvisation",
        "date": "الأحد 01 فبراير 2026",
        "lieu": "دار الشباب ابن خلدون",
        "description_fr": "Atelier ouvert sur l'art de l'improvisation théâtrale",
        "categoryId": "cat-5",
        "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg"]
    },
    {
        "folder": "مدخل الى مسرح المنتدى",
        "title": "Introduction au Théâtre Forum",
        "desc": "Théâtre forum",
        "date": "",
        "lieu": "دار الشباب ابن خلدون",
        "description_fr": "Atelier de formation sur le théâtre forum",
        "categoryId": "cat-5",
        "media": ["poster.jpg"]
    },
    {
        "folder": "عين وحكاية",
        "title": "Œil et Histoire",
        "desc": "Atelier créatif",
        "date": "الأربعاء 18 مارس 2026",
        "lieu": "دار الشباب ابن خلدون",
        "description_fr": "Projection et débat",
        "categoryId": "cat-5",
        "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg"]
    },
    {
        "folder": "رسم حنتك",
        "title": "Atelier Dessin",
        "desc": "Atelier artistique",
        "date": "",
        "lieu": "دار الشباب ابن خلدون",
        "description_fr": "Activité artistique mêlant dessin et henné",
        "categoryId": "cat-5",
        "media": ["poster.jpg", "1.jpg", "2.jpg"]
    },
    {
        "folder": "حصة في الشطرنج 1",
        "title": "Session d'Échecs 1",
        "desc": "Initiation aux échecs",
        "date": "",
        "lieu": "دار الشباب ابن خلدون",
        "description_fr": "Séance d'entraînement aux échecs",
        "categoryId": "cat-6",
        "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg"]
    },
    {
        "folder": "حصة في الشطرنج 2",
        "title": "Session d'Échecs 2",
        "desc": "Initiation aux échecs",
        "date": "",
        "lieu": "دار الشباب ابن خلدون",
        "description_fr": "Deuxième séance d'entraînement aux échecs",
        "categoryId": "cat-6",
        "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg"]
    },
    {
        "folder": "اليوم العالمي للعب",
        "title": "Journée Mondiale du Jeu",
        "desc": "Célébration du jeu",
        "date": "",
        "lieu": "",
        "description_fr": "Activité ludique pour les enfants",
        "categoryId": "cat-2",
        "media": ["poster1.jpg", "poster2.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg"]
    },
    {
        "folder": "تبرع بالدم 1",
        "title": "Campagne de Don du Sang 1",
        "desc": "Campagne de don du sang",
        "date": "",
        "lieu": "",
        "description_fr": "Campagne solidaire de don du sang",
        "categoryId": "cat-7",
        "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg"]
    },
    {
        "folder": "قافلة الأمل للتبرع بالدم 1",
        "title": "Caravane de l'Espoir — Don du Sang 1",
        "desc": "Caravane humanitaire",
        "date": "رمضان 1446 هـ – 2025 م",
        "lieu": "قرب مسرح عبد الرحيم بوعبيد – المحمدية",
        "description_fr": "Campagne de don de sang",
        "categoryId": "cat-7",
        "media": ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg", "13.jpg", "14.jpg", "15.jpg", "16.jpg", "17.jpg", "18.jpg", "19.jpg", "20.jpg"]
    },
    {
        "folder": "قافلة الأمل للتبرع   2 بالدم",
        "title": "Caravane de l'Espoir — Don du Sang 2",
        "desc": "Caravane humanitaire",
        "date": "كل خميس، جمعة، سبت وأحد، طيلة شهر رمضان",
        "lieu": "قرب مسرح عبد الرحيم بوعبيد – المحمدية",
        "description_fr": "Deuxième édition de la caravane",
        "categoryId": "cat-7",
        "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg", "13.jpg", "14.jpg", "15.jpg", "16.jpg", "17.jpg", "18.jpg", "19.jpg", "20.jpg"]
    },
    {
        "folder": "توزيع قفف رمضان",
        "title": "Distribution des Paniers de Ramadan",
        "desc": "Action caritative",
        "date": "",
        "lieu": "",
        "description_fr": "Distribution de paniers de Ramadan",
        "categoryId": "cat-7",
        "media": ["poster.jpg", "2.jpg", "3.jpg", "4.jpg"]
    },
    {
        "folder": "حملة طبية للكشف عن داء سرطان الثدي وعنق الرحم 1",
        "title": "Campagne de Dépistage du Cancer 1",
        "desc": "Campagne médicale",
        "date": "",
        "lieu": "دار الشباب الشلالات، إقليم المحمدية",
        "description_fr": "Campagne de dépistage précoce",
        "categoryId": "cat-8",
        "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg"]
    },
    {
        "folder": "قافلة الكشف المبكر عن سرطان الثدي و عنق الرحم 2",
        "title": "Caravane de Dépistage du Cancer 2",
        "desc": "Caravane médicale",
        "date": "",
        "lieu": "المستوصف الصحي عين تكي",
        "description_fr": "Caravane médicale itinérante",
        "categoryId": "cat-8",
        "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg"]
    },
    {
        "folder": "أمسية روحانية",
        "title": "Soirée Spirituelle",
        "desc": "Soirée de recueillement",
        "date": "",
        "lieu": "دار الشباب ابن خلدون",
        "description_fr": "Soirée spirituelle",
        "categoryId": "cat-1",
        "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg"]
    },
    {
        "folder": "أمسية قرانية",
        "title": "Soirée Coranique",
        "desc": "Soirée de récitation du Coran",
        "date": "7 مارس 2026",
        "lieu": "دار الشباب ابن خلدون",
        "description_fr": "Soirée coranique",
        "categoryId": "cat-1",
        "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg", "13.jpg", "14.jpg", "15.jpg", "16.jpg"]
    },
    {
        "folder": "مائدة مستديرة تحت عنوان الشباب والمشاركة السياسية",
        "title": "Table Ronde : Jeunesse et Participation Politique",
        "desc": "Débat sur l'engagement politique",
        "date": "نونبر",
        "lieu": "",
        "description_fr": "Table ronde sur la participation politique",
        "categoryId": "cat-9",
        "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg", "13.jpg"]
    },
    {
        "folder": "العرض الوطني لتنشيط مؤسسات الشباب بين التنزيل والتحديات",
        "title": "Présentation Nationale",
        "desc": "Présentation sur l'animation des maisons de jeunes",
        "date": "",
        "lieu": "",
        "description_fr": "Présentation nationale",
        "categoryId": "cat-9",
        "media": ["1.jpg", "2.jpg"]
    },
    {
        "folder": "ندوة مستجدات العرض الوطني للتخييم",
        "title": "Séminaire : Actualités du Programme National de Camping",
        "desc": "Séminaire sur le programme de camping",
        "date": "",
        "lieu": "",
        "description_fr": "Séminaire de présentation",
        "categoryId": "cat-3",
        "media": ["poster.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg"]
    }
]

print("📥 Importation des événements...")
print("=" * 50)

created = 0
for item in events_data:
    try:
        event_type = type_mapping.get(item.get('categoryId', 'cat-3'), 'FORMATION')
        now = timezone.now()
        
        # Créer l'événement (SANS image directe)
        event = Event(
            Event_Name=item['title'],
            type=event_type,
            Duration=timedelta(hours=4),
            Cost=0,
            Volunteers=0,
            description=item.get('description_fr', item.get('desc', '')),
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
                        print(f"  📸 Image {images_count}: {img_name}")
            print(f"✅ Événement importé : {event.Event_Name} ({images_count} images)")
        else:
            print(f"⚠️ Dossier non trouvé : {item['folder']}")
            print(f"✅ Événement importé sans images : {event.Event_Name}")
        
        created += 1
        
    except Exception as e:
        print(f"❌ Erreur {item.get('title', 'unknown')}: {e}")

print("=" * 50)
print(f"\n✅ {created} événements importés sur {len(events_data)}")