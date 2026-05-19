"""
import_ai_history.py
====================
Run ONCE after migration to populate your AIEventHistory table
from your existing Data_new_LABELED.xlsx.

Run from the project root:
    python import_ai_history.py
"""

import os
import sys
import django

# ── Setup Django ──────────────────────────────────────────────────────────────
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

import pandas as pd
from apps.ai.models import AIEventHistory

HISTORY_PATH = os.path.join('apps', 'ai', 'ml', 'Data_new_LABELED.xlsx')

def run():
    df = pd.read_excel(HISTORY_PATH)

    # Parse duration to hours
    df['Duration_h'] = df['Duration'].str.extract(r'(\d+)').astype(float)

    created = 0
    skipped = 0

    for _, row in df.iterrows():
        # Skip if already in DB (avoid duplicates if run twice)
        exists = AIEventHistory.objects.filter(
            event_name=row['Event Name'],
            type=row['Type'],
            cost=row['Cost'],
        ).exists()

        if exists:
            skipped += 1
            continue

        AIEventHistory.objects.create(
            event_name          = row['Event Name'],
            type                = row['Type'],
            duration            = row['Duration'],
            duration_h          = float(row['Duration_h']),
            cost                = float(row['Cost']),
            volunteers          = int(row['Volunteers']),
            social_impact       = float(row['Social Impact']),
            cost_efficiency     = float(row['Cost Efficiency']),
            volunteer_intensity = float(row['Volunteer Intensity']),
            priority_score      = float(row['Priority Score']),
            used_for_training   = True,
        )
        created += 1

    print(f"✅ Import terminé : {created} événements ajoutés, {skipped} ignorés (déjà présents).")
    print(f"   Total dans la DB : {AIEventHistory.objects.count()} événements.")

if __name__ == '__main__':
    run()
