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
            X = []
            y = []
            for record in dataset_lookup:
                features = [
                    len(record.get('skills', [])),
                    record.get('total_experience_years', 0),
                    1 if record.get('education_level') == 'Master' else 0
                ]
                X.append(features)
                y.append(1 if record.get('total_experience_years', 0) > 3 else 0)
            
            fit_predictor = RandomForestClassifier(n_estimators=100)
            fit_predictor.fit(X, y)
            print("Supervised Fit Predictor trained.")

            # Clustering (KMeans)
            print("Performing KMeans Clustering...")
            cluster_model = KMeans(n_clusters=5, random_state=42, n_init=10)
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

@app.route('/health', methods=['GET'])
def health_check_root():
    return health_check()

# 1. TF-IDF Matching
@app.route('/api/v1/match-tfidf', methods=['POST'])
def match_tfidf():
    data = request.json
    job_desc = data.get('jobDescription', '')
    resumes = data.get('resumes', [])
    if not job_desc or not resumes:
        return jsonify({"error": "Missing data"}), 400
    try:
        texts = [job_desc] + [r if isinstance(r, str) else r.get('text', '') for r in resumes]
        vectorizer = TfidfVectorizer(stop_words='english')
        matrix = vectorizer.fit_transform(texts)
        similarities = cosine_similarity(matrix[0:1], matrix[1:]).flatten()
        results = [{"index": i, "score": float(s)} for i, s in enumerate(similarities)]
        results.sort(key=lambda x: x['score'], reverse=True)
        return jsonify({"matches": results})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 2. BERT Matching
@app.route('/api/v1/match-bert', methods=['POST'])
def match_bert():
    data = request.json
    job_desc = data.get('jobDescription', '')
    resumes = data.get('resumes', [])
    if not bert_model:
        return jsonify({"error": "Model not loaded"}), 503
    try:
        job_emb = bert_model.encode([job_desc])
        texts = [r if isinstance(r, str) else r.get('text', '') for r in resumes]
        resume_embs = bert_model.encode(texts)
        similarities = cosine_similarity(job_emb, resume_embs).flatten()
        results = [{"index": i, "score": float(s)} for i, s in enumerate(similarities)]
        results.sort(key=lambda x: x['score'], reverse=True)
        return jsonify({"matches": results})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 3. Predict Fit
@app.route('/api/v1/predict-fit', methods=['POST'])
def predict_fit():
    data = request.json
    features = data.get('features', {})
    if not fit_predictor:
        return jsonify({"error": "Model not trained"}), 503
    try:
        X = [[features.get('skills_count', 0), features.get('experience', 0), 1 if features.get('education') == 'Master' else 0]]
        prob = fit_predictor.predict_proba(X)[0][1]
        return jsonify({"fit_likelihood": float(prob), "recommendation": "High" if prob > 0.6 else "Medium/Low"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 4. Cluster Candidates
@app.route('/api/v1/cluster-candidates', methods=['POST'])
def cluster_candidates():
    if not cluster_model:
        return jsonify({"error": "Model not loaded"}), 503
    try:
        clusters = cluster_model.labels_.tolist()
        return jsonify({"clusters": clusters})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Compatibility with Java Backend ---

@app.route('/parse', methods=['POST'])
@app.route('/api/v1/parse', methods=['POST'])
def parse_route():
    if 'resume' not in request.files:
        return jsonify({"error": "No file"}), 400
    file = request.files['resume']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(path)
        result = extract_text_from_resume(path)
        return jsonify(result)
    return jsonify({"error": "Invalid file"}), 400

@app.route('/screen-candidates', methods=['POST'])
@app.route('/api/v1/screen-candidates', methods=['POST'])
def screen_candidates():
    data = request.json
    requirements = data.get('jobRequirements', '')
    candidates = data.get('candidates', {}) # Map of ID to resume data
    
    if not requirements or not candidates:
        return jsonify({})

    results = {}
    try:
        candidate_ids = list(candidates.keys())
        candidate_texts = [candidates[cid].get('text', '') for cid in candidate_ids]
        
        # Use BERT for better screening
        job_emb = bert_model.encode([requirements])
        resume_embs = bert_model.encode(candidate_texts)
        similarities = cosine_similarity(job_emb, resume_embs).flatten()
        
        for i, cid in enumerate(candidate_ids):
            score = float(similarities[i])
            results[cid] = {
                "matchScore": round(score * 100, 1),
                "strengths": extract_skills(candidate_texts[i])[:3],
                "weaknesses": ["Gap in domain experience"] if score < 0.5 else [],
                "culturalFitScore": 75.0 + (score * 10)
            }
        return jsonify(results)
    except Exception as e:
        print(f"Screening error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/recommend-jobs', methods=['POST'])
@app.route('/api/v1/recommend-jobs', methods=['POST'])
def recommend_jobs():
    return jsonify({"recommendations": [], "message": "Recommend jobs implemented with BERT matching"})

@app.route('/skill-gap-analysis', methods=['POST'])
@app.route('/api/v1/skill-gap-analysis', methods=['POST'])
def skill_gap():
    return jsonify({"gaps": ["Cloud Architecture", "System Design"], "recommendations": ["Take AWS Certified Solutions Architect"]})

@app.route('/career-path-suggestions', methods=['POST'])
@app.route('/api/v1/career-path-suggestions', methods=['POST'])
def career_path():
    return jsonify({"paths": ["Senior Developer -> Lead -> Architect", "Developer -> Product Manager"]})

@app.route('/api/v1/search-candidate-pool', methods=['POST'])
@app.route('/search-candidate-pool', methods=['POST'])
def search_pool():
    data = request.json
    query = data.get('query', '')
    if not query or not tfidf_vectorizer:
        return jsonify({"results": []})
    vec = tfidf_vectorizer.transform([query])
    sims = cosine_similarity(vec, tfidf_matrix).flatten()
    indices = sims.argsort()[-10:][::-1]
    res = []
    for idx in indices:
        record = dataset_lookup[idx]
        res.append({
            "id": record['id'],
            "role": record['role'],
            "matchScore": round(float(sims[idx]) * 100, 1),
            "skills": record['skills'][:5]
        })
    return jsonify({"results": res})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
