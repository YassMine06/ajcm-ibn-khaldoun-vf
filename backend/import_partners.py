import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.files import File
from apps.partners.models import Partner

# Dossier des logos (déjà copiés dans media/partners)
MEDIA_PATH = "media/partners"

# Données des partenaires
partners_data = [
    {"name": "Al Amal", "logo": "alaml-sy.png", "url": "https://alaml-sy.com", "type": "ASSOCIATION"},
    {"name": "FNCV", "logo": "fncv.png", "url": "https://fncv.ma/", "type": "ASSOCIATION"},
    {"name": "MJCC", "logo": "mjcc.png", "url": "https://mjcc.gov.ma/", "type": "INSTITUTION"},
    {"name": "Gorara", "logo": "gorara.png", "url": "https://gorara.org", "type": "ASSOCIATION"},
    {"name": "Hawass", "logo": "hawass.png", "url": "https://web.facebook.com/Hawass.ART.Ghir.Blfen", "type": "ASSOCIATION"},
    {"name": "Mada Center", "logo": "madacenter.png", "url": "https://www.madacenter.ma", "type": "INSTITUTION"},
    {"name": "MJCC Media", "logo": "mjcc media.png", "url": "https://web.facebook.com/dpmjccmohammedia", "type": "MEDIA"},
    {"name": "UTSS", "logo": "utss.png", "url": "http://www.utss.org.tn/", "type": "ASSOCIATION"},
]

print("📥 Importation des partenaires...")
print("=" * 50)

created = 0
for item in partners_data:
    try:
        # Créer le partenaire
        partner = Partner(
            name=item['name'],
            type=item['type'],
            website=item['url'],
            is_active=True,
            description=f"Partenaire {item['name']}"
        )
        partner.save()
        
        # Ajouter le logo
        logo_path = os.path.join(MEDIA_PATH, item['logo'])
        
        if os.path.exists(logo_path):
            with open(logo_path, 'rb') as f:
                partner.logo.save(item['logo'], File(f))
            print(f"✅ {item['name']} avec logo")
        else:
            # Essayer avec un nom sans espace (pour "mjcc media.png")
            clean_name = item['logo'].replace(' ', '_')
            alt_path = os.path.join(MEDIA_PATH, clean_name)
            if os.path.exists(alt_path):
                with open(alt_path, 'rb') as f:
                    partner.logo.save(item['logo'], File(f))
                print(f"✅ {item['name']} avec logo (renommé)")
            else:
                print(f"⚠️ {item['name']} importé sans logo")
        
        created += 1
        
    except Exception as e:
        print(f"❌ Erreur {item['name']}: {e}")

print("=" * 50)
print(f"\n✅ {created} partenaires importés")