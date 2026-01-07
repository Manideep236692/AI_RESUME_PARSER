from datetime import datetime, timezone
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import json
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sentence_transformers import SentenceTransformer
import numpy as np
import pandas as pd
import PyPDF2
import docx
import re
import traceback

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Global ML Models
tfidf_vectorizer = None
tfidf_matrix = None
dataset_lookup = []
bert_model = None
fit_predictor = None
cluster_model = None

def load_models():
    global tfidf_vectorizer, tfidf_matrix, dataset_lookup, bert_model, fit_predictor, cluster_model
    try:
        # Classical TF-IDF
        if os.path.exists('tfidf_model.pkl'):
            tfidf_vectorizer = joblib.load('tfidf_model.pkl')
            print("Loaded pre-trained TF-IDF model.")
        
        if os.path.exists('tfidf_matrix.pkl'):
            tfidf_matrix = joblib.load('tfidf_matrix.pkl')
            print("Loaded pre-trained TF-IDF matrix.")
            
        if os.path.exists('dataset_lookup.pkl'):
            dataset_lookup = joblib.load('dataset_lookup.pkl')
            print(f"Loaded dataset lookup with {len(dataset_lookup)} records.")

        # Deep Learning BERT Embeddings
        print("Loading BERT model (all-MiniLM-L6-v2)...")
        bert_model = SentenceTransformer('all-MiniLM-L6-v2')
        print("BERT model loaded.")

        # Train Supervised Model (Random Forest) if we have enough data
        if len(dataset_lookup) > 10:
            print("Training Supervised Fit Predictor...")
            # Simulate training data: Fit = 1 if experience > 3 and domain matches
            X = []
            y = []
            for record in dataset_lookup:
                # Feature engineering: skills count, experience
                features = [
                    len(record.get('skills', [])),
                    record.get('total_experience_years', 0),
                    1 if record.get('education_level') == 'Master' else 0
                ]
                X.append(features)
                # target: high fit if experience > 3
                y.append(1 if record.get('total_experience_years', 0) > 3 else 0)
            
            fit_predictor = RandomForestClassifier(n_estimators=100)
            fit_predictor.fit(X, y)
            print("Supervised Fit Predictor trained.")

            # Clustering (KMeans)
            print("Performing KMeans Clustering...")
            cluster_model = KMeans(n_clusters=5, random_state=42, n_init=10)
            # Use TF-IDF matrix for clustering if available
            if tfidf_matrix is not None:
                cluster_model.fit(tfidf_matrix)
                print("KMeans Clustering completed.")

    except Exception as e:
        print(f"Error loading models: {e}")
        traceback.print_exc()

load_models()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(filepath):
    text = ""
    try:
        with open(filepath, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text += page.extract_text() + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text

def extract_text_from_docx(filepath):
    text = ""
    try:
        doc = docx.Document(filepath)
        for para in doc.paragraphs:
            text += para.text + "\n"
    except Exception as e:
        print(f"Error reading DOCX: {e}")
    return text

def extract_email(text):
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    match = re.search(email_pattern, text)
    return match.group(0) if match else None

def extract_phone(text):
    phone_pattern = r'(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}'
    match = re.search(phone_pattern, text)
    return match.group(0) if match else None

def extract_skills(text):
    common_skills = [
        "Java", "Python", "C++", "JavaScript", "React", "Angular", "Vue",
        "Spring Boot", "Node.js", "Django", "Flask", "SQL", "NoSQL",
        "MongoDB", "PostgreSQL", "AWS", "Azure", "Docker", "Kubernetes",
        "Git", "Rest API", "GraphQL", "HTML", "CSS", "TypeScript",
        "Machine Learning", "Data Science", "BERT", "Transformers", "NLP"
    ]
    found_skills = []
    text_lower = text.lower()
    for skill in common_skills:
        if re.search(r'\b' + re.escape(skill.lower()) + r'\b', text_lower):
            found_skills.append(skill)
    return list(set(found_skills))

def extract_text_from_resume(file_path):
    ext = file_path.rsplit('.', 1)[1].lower()
    text = ""
    if ext == 'pdf':
        text = extract_text_from_pdf(file_path)
    elif ext in ['doc', 'docx']:
        text = extract_text_from_docx(file_path)
    
    email = extract_email(text)
    phone = extract_phone(text)
    skills = extract_skills(text)
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    name = lines[0] if lines else "Unknown Candidate"
    
    return {
        "name": name,
        "email": email if email else "Not Found",
        "phone": phone if phone else "Not Found",
        "skills": skills,
        "text": text,
        "raw_text_preview": text[:500]
    }

@app.route('/api/v1/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "models_loaded": {
            "tfidf": tfidf_vectorizer is not None,
            "bert": bert_model is not None,
            "fit_predictor": fit_predictor is not None,
            "cluster_model": cluster_model is not None
        }
    })

# 1. TF-IDF with Cosine Similarity (Enhanced)
@app.route('/api/v1/match-tfidf', methods=['POST'])
def match_tfidf():
    data = request.json
    job_desc = data.get('jobDescription', '')
    resumes = data.get('resumes', []) # List of text or resume objects
    
    if not job_desc or not resumes:
        return jsonify({"error": "Missing job description or resumes"}), 400
    
    try:
        texts = [job_desc] + [r if isinstance(r, str) else r.get('text', '') for r in resumes]
        vectorizer = TfidfVectorizer(stop_words='english')
        matrix = vectorizer.fit_transform(texts)
        
        job_vec = matrix[0:1]
        resume_vecs = matrix[1:]
        
        similarities = cosine_similarity(job_vec, resume_vecs).flatten()
        
        results = []
        for i, score in enumerate(similarities):
            results.append({
                "index": i,
                "score": float(score),
                "rank": i + 1
            })
        
        results.sort(key=lambda x: x['score'], reverse=True)
        return jsonify({"matches": results})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 2. BERT / Transformer Embeddings
@app.route('/api/v1/match-bert', methods=['POST'])
def match_bert():
    data = request.json
    job_desc = data.get('jobDescription', '')
    resumes = data.get('resumes', [])
    
    if not bert_model:
        return jsonify({"error": "BERT model not loaded"}), 503
    
    try:
        job_emb = bert_model.encode([job_desc])
        resume_texts = [r if isinstance(r, str) else r.get('text', '') for r in resumes]
        resume_embs = bert_model.encode(resume_texts)
        
        similarities = cosine_similarity(job_emb, resume_embs).flatten()
        
        results = []
        for i, score in enumerate(similarities):
            results.append({
                "index": i,
                "score": float(score),
                "method": "BERT"
            })
        
        results.sort(key=lambda x: x['score'], reverse=True)
        return jsonify({"matches": results})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 3. Supervised ML Fit Prediction
@app.route('/api/v1/predict-fit', methods=['POST'])
def predict_fit():
    data = request.json
    resume_features = data.get('features', {}) # skills_count, experience, education_level_binary
    
    if not fit_predictor:
        return jsonify({"error": "Fit predictor not trained"}), 503
    
    try:
        # Expected features: [skills_count, experience, education_master]
        X = [[
            resume_features.get('skills_count', 0),
            resume_features.get('experience', 0),
            1 if resume_features.get('education') == 'Master' else 0
        ]]
        
        prediction = fit_predictor.predict(X)[0]
        probability = fit_predictor.predict_proba(X)[0][1]
        
        return jsonify({
            "fit_likelihood": float(probability),
            "recommendation": "High" if prediction == 1 else "Medium/Low"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 4. Clustering Candidates
@app.route('/api/v1/cluster-candidates', methods=['POST'])
def cluster_candidates():
    if not cluster_model or tfidf_matrix is None:
        return jsonify({"error": "Clustering model or data not available"}), 503
    
    try:
        clusters = cluster_model.labels_
        results = {}
        for i, cluster_id in enumerate(clusters):
            cid = dataset_lookup[i]['id']
            if int(cluster_id) not in results:
                results[int(cluster_id)] = []
            results[int(cluster_id)].append(cid)
            
        return jsonify({
            "clusters": results,
            "total_clusters": int(cluster_model.n_clusters)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/v1/parse', methods=['POST'])
def parse_resume():
    if 'resume' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['resume']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        try:
            result = extract_text_from_resume(filepath)
            result.update({
                "parsed_at": datetime.now(timezone.utc).isoformat(),
                "original_filename": filename,
                "file_size": os.path.getsize(filepath),
                "status": "success"
            })
            return jsonify(result)
        except Exception as e:
            return jsonify({"error": str(e), "status": "error"}), 500
    return jsonify({"error": "File type not allowed"}), 400

# ... existing search-candidate-pool, recommend-jobs etc ...
@app.route('/api/v1/search-candidate-pool', methods=['POST'])
def search_candidate_pool():
    data = request.json
    requirements = data.get('query', '') or data.get('jobRequirements', '')
    top_k = data.get('top_k', 10)
    
    if not requirements or not tfidf_vectorizer or tfidf_matrix is None:
        return jsonify({"results": [], "status": "error", "message": "Model not loaded or empty query"})
    
    try:
        query_vec = tfidf_vectorizer.transform([requirements])
        similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()
        top_indices = similarities.argsort()[-top_k:][::-1]
        
        results = []
        for idx in top_indices:
            score = float(similarities[idx])
            record = dataset_lookup[idx]
            req_tokens = set(requirements.lower().split())
            text_tokens = set(record['resume_text'].lower().split())
            matched_terms = list(req_tokens.intersection(text_tokens))[:5]
            results.append({
                "id": record['id'],
                "role": record['role'],
                "domain": record['domain'],
                "experience": record['total_experience_years'],
                "education": record['education_level'],
                "matchScore": round(score * 100, 1),
                "preview": record['resume_text'][:200] + "...",
                "matchedTerms": matched_terms,
                "skills": record['skills'][:5]
            })
        return jsonify({
            "results": results, 
            "total_pool_size": len(dataset_lookup),
            "status": "success"
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
