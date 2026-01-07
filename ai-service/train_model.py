import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.cluster import KMeans
import joblib
import os
import ast

def train_model():
    print("Loading dataset...")
    # Load dataset
    try:
        if not os.path.exists('dataset/resume_dataset.csv'):
            print("Dataset not found. Please run generate_dataset.py first.")
            return

        df = pd.read_csv('dataset/resume_dataset.csv')
        print(f"Dataset loaded successfully with {len(df)} records.")
        
        # Improvement 1: Handle Missing Resume Text (Safe Guard)
        df['resume_text'] = df['resume_text'].fillna('')

        # Train TF-IDF Model
        print("Training TF-IDF model...")
        # Improvement 2: Better TF-IDF Settings (ngrams capture "machine learning", "spring boot")
        vectorizer = TfidfVectorizer(
            stop_words='english', 
            max_features=5000,
            ngram_range=(1,2)
        )
        
        # Tfidf Matrix (The 'Database' of vectors)
        print("Transforming dataset...")
        # Use 'resume_text' as the primary unstructured feature
        tfidf_matrix = vectorizer.fit_transform(df['resume_text'])
        
        print(f"Model trained. Vocabulary size: {len(vectorizer.vocabulary_)}")
        print(f"Matrix shape: {tfidf_matrix.shape}")
        
        # Save the model components
        joblib.dump(vectorizer, 'tfidf_model.pkl')
        joblib.dump(tfidf_matrix, 'tfidf_matrix.pkl')
        
        # Save Feature Names
        joblib.dump(vectorizer.get_feature_names_out(), 'tfidf_features.pkl')
        
        # --- NEW: Train Supervised Fit Predictor (Random Forest) ---
        print("Training Supervised Fit Predictor...")
        X_rf = []
        y_rf = []
        
        # Helper to safely parse skills string if it's a string representation of a list
        def get_skills_count(skills_val):
            if isinstance(skills_val, list):
                return len(skills_val)
            try:
                return len(ast.literal_eval(skills_val))
            except:
                return 0

        for _, row in df.iterrows():
            skills_count = get_skills_count(row.get('skills', []))
            exp = row.get('total_experience_years', 0)
            edu = 1 if row.get('education_level') == 'Master' else 0
            X_rf.append([skills_count, exp, edu])
            # Logic for synthetic label (similar to app.py)
            y_rf.append(1 if exp > 3 else 0)
        
        fit_predictor = RandomForestClassifier(n_estimators=100)
        fit_predictor.fit(X_rf, y_rf)
        joblib.dump(fit_predictor, 'fit_predictor.pkl')
        print("Supervised Fit Predictor saved.")

        # --- NEW: Train Clustering Model (KMeans) ---
        print("Training KMeans Clustering model...")
        cluster_model = KMeans(n_clusters=5, random_state=42, n_init=10)
        cluster_model.fit(tfidf_matrix)
        joblib.dump(cluster_model, 'cluster_model.pkl')
        print("KMeans Clustering model saved.")
        
        # Save a lightweight version of dataset for lookup with hybrid fields
        lookup_data = df[['id', 'domain', 'role', 'seniority_level', 'total_experience_years', 'resume_text', 'skills', 'education_level']].to_dict('records')
        joblib.dump(lookup_data, 'dataset_lookup.pkl')
        
        print("All model and dataset assets saved.")
        
    except Exception as e:
        print(f"Error during training: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    train_model()
