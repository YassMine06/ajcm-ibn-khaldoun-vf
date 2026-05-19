import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.files import File
from apps.announcements.models import Announcement
from apps.users.models import User

admin = User.objects.filter(role='ADMIN').first()
if not admin:
    print("❌ Aucun administrateur trouvé")
    exit()

# TOUTES TES ANNONCES (avec ou sans texte)
annonces_data = [
    {"id": "72", "text": "", "image": "72.jpg"},
    {"id": "71", "text": "", "image": "71.jpg"},
    {"id": "69", "text": "", "image": "69.jpg"},
    {"id": "68", "text": "", "image": "68.jpg"},
    {"id": "67", "text": "", "image": "67.jpg"},
    {"id": "66", "text": "", "image": "66.jpg"},
    {"id": "65", "text": "💙🤍| بمناسبة اليوم العالمي للمرأة...", "image": "8.webp"},
    {"id": "64", "text": "موعد جديد مع السينما...", "image": "9.webp"},
    {"id": "63", "text": "", "image": "63.jpg"},
    {"id": "62", "text": "", "image": "62.jpg"},
    {"id": "61", "text": "", "image": "61.jpg"},
    {"id": "60", "text": "", "image": "60.jpg"},
    {"id": "59", "text": "", "image": "59.jpg"},
    {"id": "58", "text": "", "image": "58.jpg"},
    {"id": "57", "text": "", "image": "57.jpg"},
    {"id": "56", "text": "", "image": "56.jpg"},
    {"id": "55", "text": "", "image": "55.jpg"},
    {"id": "54", "text": "", "image": "54.jpg"},
    {"id": "53", "text": "", "image": "53.jpg"},
    {"id": "52", "text": "💙🤍| بمناسبة حلول السنة الأمازيغية الجديدة...", "image": "21.jpg"},
    {"id": "51", "text": "💙🤍| بمناسبة تخليد ذكرى 11 يناير...", "image": "22.webp"},
    {"id": "50", "text": "", "image": "50.jpg"},
    {"id": "49", "text": "", "image": "49.jpg"},
    {"id": "48", "text": "", "image": "48.jpg"},
    {"id": "47", "text": "🌟✨ جاهزين لموسم جديد من الإبداع والتعلم؟ ✨🌟...", "image": "26.jpg"},
    {"id": "46", "text": "", "image": "46.jpg"},
    {"id": "45", "text": "⁨ 💙🤍|بمناسبة تخليد الشعب المغربي لذكرى عيد الاستقلال...", "image": "28.jpg"},
    {"id": "44", "text": "", "image": "44.jpg"},
    {"id": "43", "text": "", "image": "43.jpg"},
    {"id": "42", "text": "بمناسبة تخليد الشعب المغربي للذكرى الخمسين للمسيرة الخضراء...", "image": "31.jpg"},
    {"id": "41", "text": "", "image": "41.jpg"},
    {"id": "40", "text": "", "image": "40.jpg"},
    {"id": "39", "text": "", "image": "39.jpg"},
    {"id": "38", "text": "", "image": "38.jpg"},
    {"id": "37", "text": "", "image": "37.jpg"},
    {"id": "36", "text": "", "image": "36.jpg"},
    {"id": "35", "text": "", "image": "35.jpg"},
    {"id": "34", "text": "💙🤍| في هذا اليوم الذي نحتفي فيه بصُنّاع الأجيال...", "image": "39.jpg"},
    {"id": "33", "text": "", "image": "33.jpg"},
    {"id": "32", "text": "💙🤍|جمعية شباب المواطنة المغربية فرع المحمدية ابن خلدون بالترند الجديد🆕", "image": "41.jpg"},
    {"id": "31", "text": "✨ بمناسبة ذكرى المولد النبوي الشريف ✨🌙...", "image": "42.jpg"},
    {"id": "30", "text": "", "image": "30.jpg"},
    {"id": "29", "text": "في مثل هذا اليوم من سنة 1979، سطّر المغاربة ملحمة جديدة...", "image": "44.jpg"},
    {"id": "28", "text": "media\r\n•\r\n\r\nفي هذا اليوم المميز، نحتفل بطاقة الشباب...", "image": "45.jpg"},
    {"id": "27", "text": "", "image": "27.jpg"},
    {"id": "26", "text": "", "image": "26.jpg"},
    {"id": "25", "text": "•\r\n\r\nبقلوب خاشعة ومؤمنة بقضاء الله وقدره...", "image": "48.jpg"},
    {"id": "24", "text": "", "image": "24.jpg"},
    {"id": "23", "text": "", "image": "23.webp"},
    {"id": "22", "text": "", "image": "22.webp"},
    {"id": "21", "text": "", "image": "21.jpg"},
    {"id": "20", "text": "بمناسبة حلول عيد الأضحى المبارك...", "image": "53.jpg"},
    {"id": "19", "text": "", "image": "19.jpg"},
    {"id": "18", "text": "", "image": "18.jpg"},
    {"id": "17", "text": "", "image": "17.jpg"},
    {"id": "16", "text": "", "image": "16.jpg"},
    {"id": "15", "text": ",جمعية شباب المواطنة المغربية فرع المحمدية ابن خلدون برئاسة السيد سعيد فيكرين تتمنى لمنسق الجمعية السيد Jawad Hadi عيد ميلاد سعيد", "image": "58.jpg"},
    {"id": "14", "text": "•\r\n\r\nيسرنا أن نعلن عن تأسيس فرقة كورال فنية تحت إشراف الجمعية", "image": "59.jpg"},
    {"id": "13", "text": "", "image": "13.jpg"},
    {"id": "12", "text": "", "image": "12.webp"},
    {"id": "11", "text": "", "image": "11.webp"},
    {"id": "10", "text": "", "image": "10.webp"},
    {"id": "9", "text": "", "image": "9.webp"},
    {"id": "8", "text": "", "image": "8.webp"},
    {"id": "7", "text": "", "image": "7.jpg"},
    {"id": "6", "text": "", "image": "6.webp"},
    {"id": "5", "text": "", "image": "5.webp"},
    {"id": "4", "text": "", "image": "4.webp"},
    {"id": "3", "text": "", "image": "3.webp"},
    {"id": "2", "text": "", "image": "2.webp"},
    {"id": "1", "text": "", "image": "1.webp"},
]

print("📥 Importation de TOUTES les annonces...")

created = 0
for item in annonces_data:
    try:
        # Déterminer le titre et le contenu
        title = f"Annonce {item['id']}"
        content = item['text'] if item.get('text') else ""  # Peut être vide
        
        annonce = Announcement(
            title=title,
            content=content,
            type='NEWS',
            is_active=True,
            author=admin
        )
        annonce.save()
        
        # Chercher l'image
        image_filename = item['image']
        image_path = f"media/announcements/{image_filename}"
        
        if os.path.exists(image_path):
            with open(image_path, 'rb') as f:
                annonce.image.save(image_filename, File(f))
            print(f"✅ Annonce {item['id']} avec image: {image_filename}")
        else:
            print(f"⚠️ Annonce {item['id']} SANS image: {image_filename}")
        
        created += 1
    except Exception as e:
        print(f"❌ Erreur {item['id']}: {e}")

print(f"\n✅ {created} annonces importées (avec ou sans texte)")