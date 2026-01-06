import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib
import os

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
        
        # Improvement 3: Save Feature Names (Debugging / PPT)
        # You can show actual learned skills in review.
        joblib.dump(vectorizer.get_feature_names_out(), 'tfidf_features.pkl')
        
        # Save a lightweight version of dataset for lookup with hybrid fields
        lookup_data = df[['id', 'domain', 'role', 'seniority_level', 'total_experience_years', 'resume_text', 'skills', 'education_level']].to_dict('records')
        joblib.dump(lookup_data, 'dataset_lookup.pkl')
        
        print("Model and dataset assets saved.")
        
    except Exception as e:
        print(f"Error during training: {e}")

if __name__ == "__main__":
    train_model()
