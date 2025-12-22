from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import json
from datetime import datetime, timezone

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

import PyPDF2
import docx
import re

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
    # Basic phone pattern covering common formats
    phone_pattern = r'(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}'
    match = re.search(phone_pattern, text)
    return match.group(0) if match else None

def extract_skills(text):
    # Common skills to look for
    common_skills = [
        "Java", "Python", "C++", "JavaScript", "React", "Angular", "Vue",
        "Spring Boot", "Node.js", "Django", "Flask", "SQL", "NoSQL",
        "MongoDB", "PostgreSQL", "AWS", "Azure", "Docker", "Kubernetes",
        "Git", "Rest API", "GraphQL", "HTML", "CSS", "TypeScript"
    ]
    
    found_skills = []
    text_lower = text.lower()
    for skill in common_skills:
        if re.search(r'\b' + re.escape(skill.lower()) + r'\b', text_lower):
            found_skills.append(skill)
            
    return list(set(found_skills)) # Deduplicate

def extract_text_from_resume(file_path):
    ext = file_path.rsplit('.', 1)[1].lower()
    text = ""
    
    if ext == 'pdf':
        text = extract_text_from_pdf(file_path)
    elif ext in ['doc', 'docx']:
        text = extract_text_from_docx(file_path)
        
    # Extract details using regex/logic on 'text'
    email = extract_email(text)
    phone = extract_phone(text)
    skills = extract_skills(text)
    
    # Try to extract name (very basic heuristic: first line or near email)
    # This is a simple fallback.
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    name = lines[0] if lines else "Unknown Candidate"
    
    return {
        "name": name,
        "email": email if email else "Not Found",
        "phone": phone if phone else "Not Found",
        "skills": skills,
        "experience": [], # Complex to extract reliably with regex alone
        "education": [],   # Complex to extract reliably with regex alone
        "raw_text_preview": text[:500] # For debugging
    }

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
            # Process the resume
            result = extract_text_from_resume(filepath)
            
            # Add metadata
            result.update({
                "parsed_at": datetime.now(timezone.utc).isoformat(),
                "original_filename": filename,
                "file_size": os.path.getsize(filepath),
                "status": "success"
            })
            
            return jsonify(result)
            
        except Exception as e:
            return jsonify({
                "error": f"Error processing file: {str(e)}",
                "status": "error"
            }), 500
    
    return jsonify({"error": "File type not allowed"}), 400

@app.route('/api/v1/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "resume-parser"
    })


@app.route('/api/v1/recommend-jobs', methods=['POST'])
def recommend_jobs():
    data = request.json
    resume_data = data.get('resumeData', {})
    skills = set(s.lower() for s in resume_data.get('skills', []))
    
    recommendations = []
    
    # Simple rule-based recommendations
    if 'java' in skills or 'spring boot' in skills:
        recommendations.append({
            "title": "Senior Java Developer",
            "company": "Tech Solutions Inc.",
            "score": 0.95,
            "reason": "Strong match with Java and Spring Boot experience"
        })
    
    if 'python' in skills or 'flask' in skills or 'django' in skills:
        recommendations.append({
            "title": "Python Backend Engineer",
            "company": "DataCorp",
            "score": 0.92,
            "reason": "Good fit for Python-based microservices role"
        })
        
    if 'react' in skills or 'javascript' in skills:
        recommendations.append({
            "title": "Frontend Developer",
            "company": "Creative Web Studio",
            "score": 0.88,
            "reason": "Matches frontend skill requirement"
        })

    # Default recommendation if no skills matched specific rules
    if not recommendations:
        recommendations.append({
            "title": "Software Engineer",
            "company": "General Tech",
            "score": 0.75,
            "reason": "General match based on profile"
        })

    return jsonify({"jobs": recommendations})

@app.route('/api/v1/skill-gap-analysis', methods=['POST'])
def skill_gap_analysis():
    # Note: Backend only sends ID, not requirements. Mocking results.
    return jsonify({
        "missingSkills": ["Cloud Architecture", "System Design"],
        "matchingSkills": ["Java", "Spring Boot", "SQL"],
        "learningResources": [
            {"title": "AWS Certified Solutions Architect", "url": "https://aws.amazon.com/"},
            {"title": "System Design Primer", "url": "https://github.com/donnemartin/system-design-primer"}
        ],
        "overallMatch": 0.75
    })

@app.route('/api/v1/career-path-suggestions', methods=['POST'])
def career_path_suggestions():
    return jsonify({
        "careerPaths": [
            {
                "title": "Technical Lead",
                "description": "Lead a team of developers and oversee technical architecture",
                "growthPotential": "High",
                "timeToAchieve": "2-3 years",
                "requiredSkills": ["Leadership", "System Design", "Mentoring"]
            },
            {
                "title": "Software Architect",
                "description": "Design high-level software structures and standards",
                "growthPotential": "Very High",
                "timeToAchieve": "3-5 years",
                "requiredSkills": ["Enterprise Patterns", "Cloud Native", "Security"]
            }
        ]
    })

@app.route('/api/v1/screen-candidates', methods=['POST'])
def screen_candidates():
    data = request.json
    requirements = data.get('jobRequirements', '').lower()
    candidates = data.get('candidates', {})
    
    results = []
    
    for candidate_id, resume_data in candidates.items():
        skills = [s.lower() for s in resume_data.get('skills', [])]
        original_skills = resume_data.get('skills', [])
        score = 0
        matched_keywords = []
        
        # Very basic keyword matching
        req_words = requirements.split()
        total_keywords = len(req_words)
        
        for req in req_words:
            if req in skills or any(req in s for s in skills):
                score += 1
                matched_keywords.append(req)
        
        final_score = (score / total_keywords * 10) if total_keywords > 0 else 5
        final_score = min(10, final_score) # Cap at 10
        
        results.append({
            "candidateId": candidate_id,
            "score": round(final_score, 1),
            "summary": f"Matched {len(matched_keywords)} keywords. Found skills: {', '.join(original_skills[:3])}..."
        })
        
    return jsonify(results)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
