import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import joblib
import os
import ast
import re

def clean_text(text):
    if not isinstance(text, str):
        return ""
    # Remove special characters and numbers
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    # Convert to lowercase
    text = text.lower()
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def train_model():
    print("Loading dataset...")
    try:
        if not os.path.exists('dataset/resume_dataset.csv'):
            print("Dataset not found. Please run generate_dataset.py first.")
            return

        df = pd.read_csv('dataset/resume_dataset.csv')
        print(f"Dataset loaded successfully with {len(df)} records.")
        
        # --- PREPROCESSING & CLEANING ---
        print("Cleaning and preprocessing data...")
        
        # 1. Handle Missing Resume Text & Clean
        df['resume_text'] = df['resume_text'].fillna('').apply(clean_text)
        
        # 2. Generalize Noisy/Invalid Experience Values
        # Ensure experience is numeric and within reasonable bounds (0-50)
        df['total_experience_years'] = pd.to_numeric(df['total_experience_years'], errors='coerce').fillna(0)
        df['total_experience_years'] = df['total_experience_years'].clip(0, 50)
        
        # 3. Handle Missing/Invalid Skills
        def normalize_skills(skills_val):
            if pd.isna(skills_val) or skills_val == '':
                return []
            if isinstance(skills_val, list):
                return skills_val
            try:
                # Try parsing as list string
                val = ast.literal_eval(skills_val)
                return val if isinstance(val, list) else [str(val)]
            except:
                # Fallback: split by comma if it's a plain string
                return [s.strip() for s in str(skills_val).split(',') if s.strip()]

        df['skills'] = df['skills'].apply(normalize_skills)

        # Train TF-IDF Model
        print("Training TF-IDF model...")
        vectorizer = TfidfVectorizer(
            stop_words='english', 
            max_features=5000,
            ngram_range=(1,2),
            min_df=2 # Generalize by ignoring very rare words
        )
        
        tfidf_matrix = vectorizer.fit_transform(df['resume_text'])
        
        print(f"Model trained. Vocabulary size: {len(vectorizer.vocabulary_)}")
        print(f"Matrix shape: {tfidf_matrix.shape}")
        
        joblib.dump(vectorizer, 'tfidf_model.pkl')
        joblib.dump(tfidf_matrix, 'tfidf_matrix.pkl')
        joblib.dump(vectorizer.get_feature_names_out(), 'tfidf_features.pkl')
        
        # --- Train Supervised Fit Predictor (Random Forest) ---
        print("Training Supervised Fit Predictor...")
        X_rf = []
        y_rf = []
        
        for _, row in df.iterrows():
            skills_count = len(row['skills'])
            exp = row['total_experience_years']
            edu = 1 if row.get('education_level') == 'Master' else (2 if row.get('education_level') == 'PhD' else 0)
            X_rf.append([skills_count, exp, edu])
            # Synthetic Business-Oriented Label: "Good Fit" based on experience and education
            # Higher experience and master/phd = 1
            y_rf.append(1 if (exp >= 2 and edu >= 1) or (exp >= 5) else 0)
        
        # Scale features for better performance
        scaler = StandardScaler()
        X_rf_scaled = scaler.fit_transform(X_rf)
        joblib.dump(scaler, 'scaler.pkl')
        
        fit_predictor = RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42)
        fit_predictor.fit(X_rf_scaled, y_rf)
        joblib.dump(fit_predictor, 'fit_predictor.pkl')
        print("Supervised Fit Predictor saved.")

        # --- Train Clustering Model (KMeans) ---
        print("Training KMeans Clustering model...")
        cluster_model = KMeans(n_clusters=8, random_state=42, n_init=10)
        cluster_model.fit(tfidf_matrix)
        joblib.dump(cluster_model, 'cluster_model.pkl')
        print("KMeans Clustering model saved.")
        
        # Save a lightweight version of dataset for lookup
        lookup_data = df[['id', 'domain', 'role', 'seniority_level', 'total_experience_years', 'resume_text', 'skills', 'education_level']].to_dict('records')
        joblib.dump(lookup_data, 'dataset_lookup.pkl')
        
        print("All model and dataset assets saved.")
        
    except Exception as e:
        print(f"Error during training: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    train_model()
