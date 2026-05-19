"""
train.py — Script d'entraînement du modèle XGBoost
=====================================================
Ce script reproduit exactement les cellules de 02_2_xgboost.ipynb.
Il lit les données depuis My_Part_AI/Data_new_LABELED.xlsx et
sauvegarde les fichiers modèle dans apps/ai/ml/ (là où Django les cherche).

Usage (depuis la racine du projet Django) :
    python apps/ai/ml/train.py

Ce script doit être lancé UNE SEULE FOIS pour générer :
    apps/ai/ml/xgb_model.pkl
    apps/ai/ml/xgb_label_encoder.pkl
"""

import sys
import os
from pathlib import Path

# ── Chemins ──────────────────────────────────────────────────────────────────
# Ce fichier est dans  apps/ai/ml/train.py
# La racine du projet est 3 niveaux au-dessus
ML_DIR      = Path(__file__).parent                        # apps/ai/ml/
PROJECT_DIR = ML_DIR.parent.parent.parent                  # racine Django

DATA_PATH    = PROJECT_DIR / 'My_Part_AI' / 'Data_new_LABELED.xlsx'
MODEL_PATH   = ML_DIR / 'xgb_model.pkl'
ENCODER_PATH = ML_DIR / 'xgb_label_encoder.pkl'

print("=" * 55)
print("  ENTRAÎNEMENT DU MODÈLE XGBOOST — AJCM")
print("=" * 55)
print(f"  Données   : {DATA_PATH}")
print(f"  Modèle    : {MODEL_PATH}")
print(f"  Encodeur  : {ENCODER_PATH}")
print()

# ── Vérification du fichier de données ───────────────────────────────────────
if not DATA_PATH.exists():
    print(f"ERREUR : Fichier de données introuvable : {DATA_PATH}")
    print("Assurez-vous que 'Data_new_LABELED.xlsx' est bien dans My_Part_AI/")
    sys.exit(1)

# ── Imports ───────────────────────────────────────────────────────────────────
try:
    import pandas as pd
    import numpy as np
    import joblib
    from xgboost import XGBRegressor
    from sklearn.model_selection import train_test_split, cross_val_score
    from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
    from sklearn.preprocessing import LabelEncoder
except ImportError as e:
    print(f"ERREUR d'import : {e}")
    print()
    print("Installez les dépendances :")
    print("  pip install xgboost scikit-learn joblib openpyxl pandas numpy")
    sys.exit(1)

# ── 1. Chargement et préparation (notebook 02_2, cellule 1) ──────────────────
print("▶ Chargement des données...")
df = pd.read_excel(DATA_PATH)
df = df.drop_duplicates().reset_index(drop=True)

le = LabelEncoder()
df['Type_enc']   = le.fit_transform(df['Type'])
df['Duration_h'] = df['Duration'].str.extract(r'(\d+)').astype(float)

features = ['Type_enc', 'Duration_h', 'Social Impact', 'Cost Efficiency', 'Volunteer Intensity']
X = df[features]
y = df['Priority Score']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print(f"  ✓ {len(df)} événements chargés")
print(f"  ✓ Train : {len(X_train)} lignes | Test : {len(X_test)} lignes")
print()

# ── 2. Entraînement XGBoost (notebook 02_2, cellule 3) ───────────────────────
print("▶ Entraînement du modèle XGBoost...")
xgb = XGBRegressor(
    n_estimators=200,
    max_depth=3,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    verbosity=0,
)
xgb.fit(X_train, y_train)
print("  ✓ XGBoost entraîné avec succès")
print()

# ── 3. Évaluation (notebook 02_2, cellule 5) ─────────────────────────────────
print("▶ Évaluation du modèle...")
xgb_pred = xgb.predict(X_test)
xgb_cv   = cross_val_score(xgb, X, y, cv=5, scoring='r2')

xgb_r2   = r2_score(y_test, xgb_pred)
xgb_rmse = float(np.sqrt(mean_squared_error(y_test, xgb_pred)))
xgb_mae  = float(mean_absolute_error(y_test, xgb_pred))

print("=" * 45)
print("  RÉSULTATS")
print("=" * 45)
print(f"  R²  test         : {xgb_r2:.4f}")
print(f"  RMSE test        : {xgb_rmse:.4f}")
print(f"  MAE  test        : {xgb_mae:.4f}")
print(f"  CV-R² moyen      : {xgb_cv.mean():.4f}")
print(f"  CV-R² écart-type : {xgb_cv.std():.4f}")
print("=" * 45)
print()

# ── 4. Sauvegarde (notebook 02_2, cellule 6) ─────────────────────────────────
print("▶ Sauvegarde des fichiers modèle...")
joblib.dump(xgb, MODEL_PATH)
joblib.dump(le,  ENCODER_PATH)

print(f"  ✓ Modèle sauvegardé    : {MODEL_PATH}")
print(f"  ✓ Encodeur sauvegardé  : {ENCODER_PATH}")
print()
print("=" * 55)
print("  ENTRAÎNEMENT TERMINÉ — le backend IA est prêt !")
print("  Lancez : python manage.py runserver")
print("  Testez : http://localhost:8000/api/docs/")
print("=" * 55)

# ── 5. Classes connues du modèle ──────────────────────────────────────────────
print()
print("  Types d'événements appris par le modèle :")
for cls in le.classes_:
    print(f"    - {cls}")
