import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os
import ast
import re
import numpy as np
import json

def clean_text(text):
    """
    Enhanced text cleaning for better generalization and noise reduction.
    """
    if not isinstance(text, str):
        return ""
    # Remove email addresses
    text = re.sub(r'\S+@\S+', '', text)
    # Remove special characters and numbers, keeping only letters
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    # Convert to lowercase
    text = text.lower()
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def normalize_skills(skills_val):
    """
    Standardize skill lists from various noisy formats.
    """
    if pd.isna(skills_val) or skills_val == '':
        return []
    if isinstance(skills_val, list):
        return skills_val
    try:
        # Try parsing as list string (e.g., "['Java', 'Python']")
        val = ast.literal_eval(skills_val)
        return val if isinstance(val, list) else [str(val)]
    except:
        # Fallback: split by comma or semicolon if it's a plain string
        delimiters = [',', ';', '|']
        for d in delimiters:
            if d in str(skills_val):
                return [s.strip() for s in str(skills_val).split(d) if s.strip()]
        return [str(skills_val).strip()]

def train_model():
    print("=== AI Model Training Pipeline ===")
    print("Goal: Performance Optimization & Robust Generalization")
    
    try:
        dataset_path = 'dataset/resume_dataset.csv'
        if not os.path.exists(dataset_path):
            print(f"Error: Dataset not found at {dataset_path}")
            return

        df = pd.read_csv(dataset_path)
        print(f"Dataset loaded: {len(df)} records.")
        
        # --- 1. ROBUST PREPROCESSING (Handling Noisy/Missing/Invalid Values) ---
        print("Preprocessing data with noise filtering...")
        
        # Missing Text Handling
        df['resume_text'] = df['resume_text'].fillna('no content').apply(clean_text)
        
        # Invalid Experience Handling
        df['total_experience_years'] = pd.to_numeric(df['total_experience_years'], errors='coerce').fillna(0)
        # Constraint: Experience must be realistic (0-50 years)
        df['total_experience_years'] = df['total_experience_years'].clip(0, 50)
        
        # Skills Normalization
        df['skills'] = df['skills'].apply(normalize_skills)
        
        # Education Mapping
        edu_map = {'High School': 0, 'Bachelor': 1, 'Master': 2, 'PhD': 3}
        df['edu_score'] = df['education_level'].map(edu_map).fillna(1) # Default to Bachelor if missing

        # --- 2. TF-IDF VECTORIZATION (Generalization) ---
        print("Optimizing TF-IDF for generalization...")
        vectorizer = TfidfVectorizer(
            stop_words='english', 
            max_features=3000, # Reduced for performance
            ngram_range=(1,2),
            min_df=5, # Ignore noise (words appearing in < 5 resumes)
            max_df=0.7 # Ignore overly common words
        )
        
        tfidf_matrix = vectorizer.fit_transform(df['resume_text'])
        print(f"TF-IDF Matrix: {tfidf_matrix.shape}")
        
        # --- 3. SUPERVISED LEARNING WITH TRAIN-TEST SPLIT ---
        print("Training Fit Predictor (Random Forest) with Evaluation...")
        
        # Feature Engineering: Skills Count, Experience, Education
        X = []
        for _, row in df.iterrows():
            X.append([
                len(row['skills']), 
                row['total_experience_years'], 
                row['edu_score']
            ])
        X = np.array(X)
        
        # Business Point of View: Labeling "Fit" based on ROI potential
        # (Exp > 3 AND Skills > 5) OR (Education >= Master)
        y = []
        for _, row in df.iterrows():
            is_fit = 1 if (row['total_experience_years'] >= 3 and len(row['skills']) >= 4) or (row['edu_score'] >= 2) else 0
            y.append(is_fit)
        y = np.array(y)
        
        # Train-Test Split (Requirement: Performance evaluation)
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        clf = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
        clf.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred = clf.predict(X_test_scaled)
        acc = accuracy_score(y_test, y_pred)
        print(f"Model Performance (Accuracy): {acc:.4f}")
        print("\nClassification Report (Business Transparency):")
        print(classification_report(y_test, y_pred))
        
        # --- 4. CLUSTERING FOR TALENT POOL DISCOVERY ---
        print("Updating Talent Pool Clusters...")
        kmeans = KMeans(n_clusters=6, random_state=42, n_init=5)
        kmeans.fit(tfidf_matrix)
        
        # --- 5. PERSISTENCE ---
        print("Saving assets...")
        joblib.dump(vectorizer, 'tfidf_model.pkl')
        joblib.dump(tfidf_matrix, 'tfidf_matrix.pkl')
        joblib.dump(scaler, 'scaler.pkl')
        joblib.dump(clf, 'fit_predictor.pkl')
        joblib.dump(kmeans, 'cluster_model.pkl')
        
        # Save metrics for business insights
        with open('metrics.json', 'w') as f:
            json.dump({
                'accuracy': float(acc),
                'last_training_date': pd.Timestamp.now().strftime('%Y-%m-%d'),
                'records': int(len(df))
            }, f)
        
        # Save dataset lookup with business metrics
        df['business_fit_score'] = clf.predict_proba(scaler.transform(X))[:, 1]
        lookup_data = df[['id', 'domain', 'role', 'seniority_level', 'total_experience_years', 'resume_text', 'skills', 'education_level', 'business_fit_score']].to_dict('records')
        joblib.dump(lookup_data, 'dataset_lookup.pkl')
        
        print("=== Training Complete Successfully ===")
        print(f"Metrics: Accuracy={acc:.2%}, Records={len(df)}")
        
    except Exception as e:
        print(f"CRITICAL ERROR in training: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    train_model()
