import pandas as pd
import random

# Controlled Vocabularies
domains = {
    "Engineering": ["Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "DevOps Engineer"],
    "Data Science": ["Data Scientist", "Machine Learning Engineer", "Data Analyst"],
    "Product": ["Product Manager", "Project Manager"]
}

skills_repo = {
    "Engineering": ["Java", "Python", "C++", "JavaScript", "React", "Node.js", "Spring Boot", "SQL", "NoSQL", "AWS", "Docker", "Kubernetes", "Git", "CI/CD"],
    "Data Science": ["Python", "R", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn", "SQL", "Tableau", "Big Data"],
    "Product": ["Agile", "Scrum", "JIRA", "Roadmapping", "Stakeholder Management", "User Research", "Data Analysis"]
}

soft_skills = ["Communication", "Leadership", "Problem Solving", "Teamwork", "Adaptability", "Critical Thinking", "Time Management", "Mentoring"]

education_levels = ["Bachelor's Degree", "Master's Degree", "PhD"]

seniority_map = {
    "Junior": (0, 2),
    "Mid-level": (3, 5),
    "Senior": (5, 8),
    "Lead": (8, 12),
    "Principal": (12, 20)
}

# Generate synthetic dataset
data = []

print("Generating 25000 records...")

try:
    # Generate 25000 synthetic resume/job descriptions
    for i in range(25000):
        # Select Domain and Role
        domain = random.choice(list(domains.keys()))
        role = random.choice(domains[domain])
        
        # Select Seniority and Experience
        level = random.choice(list(seniority_map.keys()))
        min_exp, max_exp = seniority_map[level]
        experience_years = random.randint(min_exp, max_exp)
        
        # Education
        education = random.choice(education_levels)
        
        # Skills (Hard & Soft)
        num_hard_skills = random.randint(4, 10)
        # Handle case where sample user asks for more items than available
        available_skills = skills_repo[domain]
        hard_skills = random.sample(available_skills, min(num_hard_skills, len(available_skills)))
        
        num_soft_skills = random.randint(2, 5)
        abilities = random.sample(soft_skills, num_soft_skills)
        
        all_skills = hard_skills + abilities
        
        # Past Roles (Synthetic History)
        num_past_roles = random.randint(1, 3) if experience_years > 2 else 0
        past_roles = [f"{random.choice(['Junior', 'Associate', ''])} {role}" for _ in range(num_past_roles)]
        
        # Unstructured Text Generation
        text = f"Candidate_{i:04d}\n" \
               f"Profile Summary: {level} {role} with {experience_years} years of experience in the {domain} domain. " \
               f"Proven track record in {', '.join(hard_skills[:3])}. \n" \
               f"Education: {education} in Computer Science or related field.\n" \
               f"Technical Skills: {', '.join(hard_skills)}.\n" \
               f"Key Competencies: {', '.join(abilities)}.\n" \
               f"Professional Experience: Previously worked as {', '.join(past_roles)}."

        data.append({
            "id": f"CAND-{i:04d}",
            "resume_text": text,
            "job_description_text": text,
            "domain": domain,
            "role": role,
            "seniority_level": level,
            "total_experience_years": experience_years,
            "education_level": education,
            "skills": hard_skills,
            "abilities": abilities,
            "past_roles": past_roles
        })

    # Create DataFrame and save to CSV
    df = pd.DataFrame(data)
    # Save as CSV
    df.to_csv('dataset/resume_dataset.csv', index=False)
    # Also save as JSON
    df.to_json('dataset/resume_dataset.json', orient='records')

    print("Dataset generated successfully: dataset/resume_dataset.csv with 25000 samples")

except Exception as e:
    print(f"Error: {e}")
