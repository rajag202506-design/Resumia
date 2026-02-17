from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import joblib
import fitz  # PyMuPDF
import nltk
import string
import numpy as np
import pandas as pd
import re
from sklearn.feature_extraction.text import TfidfVectorizer
import logging

# Setup Flask app
app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Download stopwords
try:
    nltk.download('stopwords', quiet=True)
    from nltk.corpus import stopwords
    STOPWORDS = set(stopwords.words('english'))
except:
    STOPWORDS = set()
    logger.warning("NLTK stopwords not available")

def preprocess(text):
    text = text.lower()
    text = text.translate(str.maketrans('', '', string.punctuation))
    tokens = text.split()
    tokens = [t for t in tokens if t not in STOPWORDS and t.isalpha()]
    return " ".join(tokens)

# Extract contact information
def extract_contact_info(text):
    text_clean = ' '.join(text.split())

    # EMAILS
    email_patterns = [
        r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}',
    ]
    emails = []
    for pattern in email_patterns:
        found = re.findall(pattern, text, re.IGNORECASE)
        emails.extend(found)
    emails = list(set([e.lower() for e in emails]))

    # PHONES - Multiple formats
    phone_patterns = [
        r'\+\d{1,3}[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}',  # International
        r'\(\d{3}\)\s?\d{3}[-\s]?\d{4}',  # (123) 456-7890
        r'\d{3}[-\s]?\d{3}[-\s]?\d{4}',  # 123-456-7890
        r'\d{10,12}',  # 1234567890
    ]
    phones = []
    for pattern in phone_patterns:
        found = re.findall(pattern, text_clean)
        phones.extend(found)
    phones = list(set(phones))

    # LINKEDIN
    linkedin_patterns = [
        r'linkedin\.com/in/[\w-]+',
        r'linkedin\.com[\w/-]+',
    ]
    linkedin = []
    for pattern in linkedin_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        linkedin.extend(matches)
    linkedin = list(set(linkedin))

    # GITHUB
    github_patterns = [
        r'github\.com/[\w-]+',
    ]
    github = []
    for pattern in github_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        github.extend(matches)
    github = list(set(github))

    return {
        'emails': emails,
        'phones': phones,
        'linkedin': linkedin,
        'github': github
    }

# Comprehensive skill detection
def extract_skills(text):
    text_lower = text.lower()

    # Programming Languages
    programming_languages = {
        'python': ['python', 'py'],
        'javascript': ['javascript', 'js', 'es6', 'es7'],
        'java': ['java'],
        'c++': ['c++', 'cpp'],
        'c#': ['c#', 'csharp'],
        'c': [' c '],
        'php': ['php'],
        'ruby': ['ruby'],
        'go': ['golang', ' go '],
        'swift': ['swift'],
        'kotlin': ['kotlin'],
        'typescript': ['typescript', 'ts'],
        'rust': ['rust'],
        'scala': ['scala'],
        'dart': ['dart', 'flutter'],
        'r': [' r '],
        'sql': ['sql', 'mysql', 'postgresql', 'mssql'],
        'html': ['html', 'html5'],
        'css': ['css', 'css3', 'scss', 'sass', 'tailwind'],
    }

    # Frameworks & Libraries
    frameworks = {
        'react': ['react', 'reactjs', 'react.js'],
        'angular': ['angular', 'angularjs'],
        'vue': ['vue', 'vuejs', 'vue.js'],
        'node.js': ['node', 'nodejs', 'node.js', 'express'],
        'django': ['django'],
        'flask': ['flask'],
        'spring': ['spring', 'spring boot'],
        'laravel': ['laravel'],
        'rails': ['rails', 'ruby on rails'],
        'next.js': ['next', 'nextjs', 'next.js'],
        '.net': ['.net', 'dotnet', 'asp.net'],
        'flutter': ['flutter'],
        'react native': ['react native'],
    }

    # Databases
    databases = {
        'mysql': ['mysql'],
        'postgresql': ['postgresql', 'postgres'],
        'mongodb': ['mongodb', 'mongo'],
        'redis': ['redis'],
        'elasticsearch': ['elasticsearch'],
        'oracle': ['oracle'],
        'sqlite': ['sqlite'],
        'firebase': ['firebase'],
    }

    # Cloud & DevOps
    cloud_devops = {
        'aws': ['aws', 'amazon web services', 'ec2', 's3', 'lambda'],
        'azure': ['azure', 'microsoft azure'],
        'gcp': ['gcp', 'google cloud'],
        'docker': ['docker'],
        'kubernetes': ['kubernetes', 'k8s'],
        'jenkins': ['jenkins'],
        'git': ['git', 'github', 'gitlab', 'bitbucket'],
        'ci/cd': ['ci/cd', 'continuous integration', 'continuous deployment'],
        'linux': ['linux', 'ubuntu', 'centos'],
        'nginx': ['nginx'],
        'terraform': ['terraform'],
    }

    # Data & ML
    data_ml = {
        'machine learning': ['machine learning', 'ml'],
        'deep learning': ['deep learning', 'neural network'],
        'tensorflow': ['tensorflow'],
        'pytorch': ['pytorch'],
        'pandas': ['pandas'],
        'numpy': ['numpy'],
        'scikit-learn': ['scikit-learn', 'sklearn'],
        'data analysis': ['data analysis', 'data analytics'],
        'nlp': ['nlp', 'natural language processing'],
        'computer vision': ['computer vision', 'opencv'],
    }

    # Soft Skills
    soft_skills = {
        'leadership': ['leadership', 'led', 'leading', 'team lead'],
        'communication': ['communication', 'communicated'],
        'problem solving': ['problem solving', 'problem-solving'],
        'teamwork': ['teamwork', 'team player', 'collaboration'],
        'project management': ['project management', 'agile', 'scrum'],
    }

    found_skills = {
        'programming_languages': [],
        'frameworks': [],
        'databases': [],
        'cloud_devops': [],
        'data_ml': [],
        'soft_skills': [],
    }

    for skill, keywords in programming_languages.items():
        if any(kw in text_lower for kw in keywords):
            found_skills['programming_languages'].append(skill)

    for skill, keywords in frameworks.items():
        if any(kw in text_lower for kw in keywords):
            found_skills['frameworks'].append(skill)

    for skill, keywords in databases.items():
        if any(kw in text_lower for kw in keywords):
            found_skills['databases'].append(skill)

    for skill, keywords in cloud_devops.items():
        if any(kw in text_lower for kw in keywords):
            found_skills['cloud_devops'].append(skill)

    for skill, keywords in data_ml.items():
        if any(kw in text_lower for kw in keywords):
            found_skills['data_ml'].append(skill)

    for skill, keywords in soft_skills.items():
        if any(kw in text_lower for kw in keywords):
            found_skills['soft_skills'].append(skill)

    return found_skills

# Analyze resume sections
def analyze_sections(text):
    text_lower = text.lower()

    sections = {
        'has_contact': False,
        'has_summary': False,
        'has_experience': False,
        'has_education': False,
        'has_skills': False,
        'has_projects': False,
        'has_certifications': False,
        'has_achievements': False,
    }

    # Contact section indicators
    contact_indicators = ['email', 'phone', 'linkedin', '@', '+92', '+1', 'contact']
    sections['has_contact'] = any(ind in text_lower for ind in contact_indicators)

    # Summary/Profile/Objective
    summary_indicators = ['summary', 'profile', 'objective', 'about me', 'professional summary']
    sections['has_summary'] = any(ind in text_lower for ind in summary_indicators)

    # Experience section
    exp_indicators = ['experience', 'work history', 'employment', 'professional experience', 'work experience']
    sections['has_experience'] = any(ind in text_lower for ind in exp_indicators)

    # Education section
    edu_indicators = ['education', 'academic', 'degree', 'university', 'college', 'bachelor', 'master', 'bs ', 'ms ', 'phd', 'cgpa', 'gpa']
    sections['has_education'] = any(ind in text_lower for ind in edu_indicators)

    # Skills section
    skills_indicators = ['skills', 'technical skills', 'competencies', 'technologies', 'proficiencies']
    sections['has_skills'] = any(ind in text_lower for ind in skills_indicators)

    # Projects section
    project_indicators = ['project', 'portfolio', 'personal project', 'side project']
    sections['has_projects'] = any(ind in text_lower for ind in project_indicators)

    # Certifications
    cert_indicators = ['certification', 'certificate', 'certified', 'license', 'accreditation']
    sections['has_certifications'] = any(ind in text_lower for ind in cert_indicators)

    # Achievements/Awards
    achievement_indicators = ['achievement', 'award', 'honor', 'recognition', 'accomplishment', 'hackathon']
    sections['has_achievements'] = any(ind in text_lower for ind in achievement_indicators)

    return sections

# Analyze experience quality
def analyze_experience_quality(text):
    text_lower = text.lower()

    # Strong action verbs
    strong_verbs = [
        'developed', 'implemented', 'designed', 'created', 'built', 'architected',
        'led', 'managed', 'directed', 'supervised', 'coordinated',
        'increased', 'improved', 'enhanced', 'optimized', 'reduced',
        'achieved', 'delivered', 'launched', 'deployed', 'automated',
        'analyzed', 'researched', 'evaluated', 'resolved', 'transformed',
        'collaborated', 'mentored', 'trained', 'presented', 'negotiated'
    ]

    # Weak phrases to avoid
    weak_phrases = [
        'responsible for', 'duties included', 'worked on', 'helped with',
        'assisted with', 'was involved in', 'participated in'
    ]

    # Quantifiable metrics patterns
    metric_patterns = [
        r'\d+%',  # Percentages
        r'\$[\d,]+[kmb]?',  # Dollar amounts
        r'\d+\s*(users|customers|clients|employees|team members)',  # User/team counts
        r'(increased|reduced|improved|decreased|grew|saved)\s*\w*\s*by\s*\d+',  # Impact metrics
        r'\d+\s*(projects|applications|features|systems)',  # Project counts
        r'\d+x\s*(faster|improvement|increase)',  # Multiplier improvements
    ]

    analysis = {
        'strong_verbs_count': sum(1 for verb in strong_verbs if verb in text_lower),
        'weak_phrases_count': sum(1 for phrase in weak_phrases if phrase in text_lower),
        'has_metrics': any(re.search(pattern, text_lower) for pattern in metric_patterns),
        'metrics_count': sum(len(re.findall(pattern, text_lower)) for pattern in metric_patterns),
        'strong_verbs_found': [verb for verb in strong_verbs if verb in text_lower],
        'weak_phrases_found': [phrase for phrase in weak_phrases if phrase in text_lower],
    }

    return analysis

# Calculate comprehensive score
def calculate_score(text, contact_info, skills, sections, experience_quality):
    score = 0
    max_score = 100
    breakdown = {}

    word_count = len(text.split())

    # 1. Contact Information (15 points)
    contact_score = 0
    if contact_info['emails']:
        contact_score += 5
    if contact_info['phones']:
        contact_score += 5
    if contact_info['linkedin']:
        contact_score += 3
    if contact_info['github']:
        contact_score += 2
    breakdown['contact_info'] = min(contact_score, 15)
    score += breakdown['contact_info']

    # 2. Resume Sections (20 points)
    section_score = 0
    if sections['has_summary']:
        section_score += 3
    if sections['has_experience']:
        section_score += 5
    if sections['has_education']:
        section_score += 4
    if sections['has_skills']:
        section_score += 4
    if sections['has_projects']:
        section_score += 2
    if sections['has_certifications']:
        section_score += 1
    if sections['has_achievements']:
        section_score += 1
    breakdown['sections'] = min(section_score, 20)
    score += breakdown['sections']

    # 3. Technical Skills (20 points)
    skill_score = 0
    total_tech_skills = (
        len(skills['programming_languages']) +
        len(skills['frameworks']) +
        len(skills['databases']) +
        len(skills['cloud_devops']) +
        len(skills['data_ml'])
    )

    if total_tech_skills >= 10:
        skill_score = 20
    elif total_tech_skills >= 7:
        skill_score = 16
    elif total_tech_skills >= 5:
        skill_score = 12
    elif total_tech_skills >= 3:
        skill_score = 8
    elif total_tech_skills >= 1:
        skill_score = 4

    breakdown['technical_skills'] = skill_score
    score += skill_score

    # 4. Experience Quality (25 points)
    exp_score = 0

    # Strong action verbs (up to 10 points)
    if experience_quality['strong_verbs_count'] >= 8:
        exp_score += 10
    elif experience_quality['strong_verbs_count'] >= 5:
        exp_score += 7
    elif experience_quality['strong_verbs_count'] >= 3:
        exp_score += 5
    elif experience_quality['strong_verbs_count'] >= 1:
        exp_score += 2

    # Quantifiable metrics (up to 10 points)
    if experience_quality['metrics_count'] >= 5:
        exp_score += 10
    elif experience_quality['metrics_count'] >= 3:
        exp_score += 7
    elif experience_quality['metrics_count'] >= 1:
        exp_score += 4

    # Penalty for weak phrases (up to -5 points)
    exp_score -= min(experience_quality['weak_phrases_count'] * 2, 5)

    breakdown['experience_quality'] = max(exp_score, 0)
    score += breakdown['experience_quality']

    # 5. Content Length & Quality (10 points)
    length_score = 0
    if 300 <= word_count <= 700:
        length_score = 10
    elif 200 <= word_count <= 300 or 700 <= word_count <= 900:
        length_score = 7
    elif 150 <= word_count <= 200 or 900 <= word_count <= 1100:
        length_score = 4
    elif word_count >= 100:
        length_score = 2

    breakdown['content_length'] = length_score
    score += length_score

    # 6. Soft Skills (10 points)
    soft_score = min(len(skills['soft_skills']) * 2, 10)
    breakdown['soft_skills'] = soft_score
    score += soft_score

    # Convert to 10-point scale
    final_score = round((score / max_score) * 10, 1)
    final_score = min(max(final_score, 0), 10)

    return final_score, breakdown

# Generate specific, actionable suggestions
def generate_suggestions(text, contact_info, skills, sections, experience_quality, score, score_breakdown):
    suggestions = []
    text_lower = text.lower()
    word_count = len(text.split())

    # Priority 1: Critical Missing Elements
    if not contact_info['emails']:
        suggestions.append({
            'priority': 'critical',
            'category': 'Contact Information',
            'issue': 'Missing email address',
            'suggestion': 'Add your professional email address at the top of your resume (e.g., yourname@gmail.com)',
            'impact': '+5 points'
        })

    if not contact_info['phones']:
        suggestions.append({
            'priority': 'critical',
            'category': 'Contact Information',
            'issue': 'Missing phone number',
            'suggestion': 'Add your phone number in international format (e.g., +92 332 4462464)',
            'impact': '+5 points'
        })

    if not contact_info['linkedin']:
        suggestions.append({
            'priority': 'high',
            'category': 'Contact Information',
            'issue': 'Missing LinkedIn profile',
            'suggestion': 'Add your LinkedIn profile URL (linkedin.com/in/yourname) - recruiters frequently check LinkedIn',
            'impact': '+3 points'
        })

    # Priority 2: Missing Sections
    if not sections['has_experience']:
        suggestions.append({
            'priority': 'critical',
            'category': 'Resume Structure',
            'issue': 'Missing Work Experience section',
            'suggestion': 'Add a "Professional Experience" or "Work Experience" section with your job history, including company name, role, dates, and responsibilities',
            'impact': '+5 points'
        })

    if not sections['has_education']:
        suggestions.append({
            'priority': 'high',
            'category': 'Resume Structure',
            'issue': 'Missing Education section',
            'suggestion': 'Include your "Education" section with degree, university name, graduation year, and GPA if above 3.0',
            'impact': '+4 points'
        })

    if not sections['has_skills']:
        suggestions.append({
            'priority': 'high',
            'category': 'Resume Structure',
            'issue': 'Missing Skills section',
            'suggestion': 'Add a dedicated "Technical Skills" section listing your programming languages, frameworks, tools, and technologies',
            'impact': '+4 points'
        })

    if not sections['has_summary']:
        suggestions.append({
            'priority': 'medium',
            'category': 'Resume Structure',
            'issue': 'Missing Professional Summary',
            'suggestion': 'Add a brief 2-3 sentence professional summary at the top highlighting your experience, key skills, and career goals',
            'impact': '+3 points'
        })

    if not sections['has_projects'] and score < 7:
        suggestions.append({
            'priority': 'medium',
            'category': 'Resume Structure',
            'issue': 'No Projects section',
            'suggestion': 'Add a "Projects" section showcasing 2-3 personal or academic projects with technologies used and outcomes achieved',
            'impact': '+2 points'
        })

    # Priority 3: Experience Quality Issues
    if experience_quality['metrics_count'] == 0:
        suggestions.append({
            'priority': 'high',
            'category': 'Experience Quality',
            'issue': 'No quantifiable achievements',
            'suggestion': 'Add measurable results to your experience bullet points. Examples:\n  • "Developed web application serving 1000+ users"\n  • "Reduced page load time by 40%"\n  • "Led team of 5 developers"\n  • "Increased test coverage from 60% to 95%"',
            'impact': '+10 points (significant)'
        })
    elif experience_quality['metrics_count'] < 3:
        suggestions.append({
            'priority': 'medium',
            'category': 'Experience Quality',
            'issue': 'Limited quantifiable achievements',
            'suggestion': 'Add more metrics and numbers to demonstrate impact. Include percentages, user counts, team sizes, time saved, or cost reduced',
            'impact': '+3-6 points'
        })

    if experience_quality['weak_phrases_count'] > 0:
        weak_found = experience_quality['weak_phrases_found'][:2]
        suggestions.append({
            'priority': 'high',
            'category': 'Experience Quality',
            'issue': f'Using weak phrases: "{", ".join(weak_found)}"',
            'suggestion': 'Replace weak phrases with strong action verbs:\n  • "Responsible for" → "Managed" or "Led"\n  • "Worked on" → "Developed" or "Implemented"\n  • "Helped with" → "Contributed to" or "Collaborated on"',
            'impact': '+2-5 points'
        })

    if experience_quality['strong_verbs_count'] < 5:
        suggestions.append({
            'priority': 'medium',
            'category': 'Experience Quality',
            'issue': 'Limited use of action verbs',
            'suggestion': 'Start each bullet point with a strong action verb: Developed, Implemented, Designed, Led, Managed, Created, Built, Optimized, Delivered, Achieved',
            'impact': '+3-7 points'
        })

    # Priority 4: Skills Enhancement
    total_tech_skills = (
        len(skills['programming_languages']) +
        len(skills['frameworks']) +
        len(skills['databases']) +
        len(skills['cloud_devops'])
    )

    if total_tech_skills < 5:
        missing_skills = []
        essential_skills = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git', 'AWS', 'Docker']
        current_skills = (
            skills['programming_languages'] +
            skills['frameworks'] +
            skills['databases'] +
            skills['cloud_devops']
        )
        current_skills_lower = [s.lower() for s in current_skills]

        for skill in essential_skills:
            if skill.lower() not in current_skills_lower:
                missing_skills.append(skill)

        if missing_skills:
            suggestions.append({
                'priority': 'medium',
                'category': 'Technical Skills',
                'issue': f'Limited technical skills listed ({total_tech_skills} found)',
                'suggestion': f'If applicable, add these in-demand skills to boost your profile: {", ".join(missing_skills[:5])}',
                'impact': '+4-8 points'
            })

    if not skills['cloud_devops'] and score >= 5:
        suggestions.append({
            'priority': 'low',
            'category': 'Technical Skills',
            'issue': 'No cloud/DevOps skills mentioned',
            'suggestion': 'Consider adding cloud (AWS, Azure, GCP) or DevOps skills (Docker, Kubernetes, CI/CD) if you have experience with them',
            'impact': '+2-4 points'
        })

    # Priority 5: Content Length
    if word_count < 200:
        suggestions.append({
            'priority': 'high',
            'category': 'Content',
            'issue': f'Resume too short ({word_count} words)',
            'suggestion': 'Expand your resume to 400-600 words. Add more details about your responsibilities, achievements, and projects',
            'impact': '+3-6 points'
        })
    elif word_count > 800:
        suggestions.append({
            'priority': 'medium',
            'category': 'Content',
            'issue': f'Resume may be too long ({word_count} words)',
            'suggestion': 'Consider condensing to under 700 words. Focus on most relevant and recent experiences. Remove older or less relevant positions',
            'impact': '+2-4 points'
        })

    # Priority 6: Additional Enhancements
    if not sections['has_certifications'] and score >= 6:
        suggestions.append({
            'priority': 'low',
            'category': 'Certifications',
            'issue': 'No certifications listed',
            'suggestion': 'Add relevant certifications to stand out (e.g., AWS Certified, Google Cloud, Microsoft Azure, Coursera certificates)',
            'impact': '+1-2 points'
        })

    if not contact_info['github'] and 'developer' in text_lower or 'engineer' in text_lower:
        suggestions.append({
            'priority': 'low',
            'category': 'Portfolio',
            'issue': 'No GitHub profile',
            'suggestion': 'Add your GitHub profile URL to showcase your code and projects to potential employers',
            'impact': '+1-2 points'
        })

    # Sort by priority
    priority_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
    suggestions.sort(key=lambda x: priority_order.get(x['priority'], 4))

    return suggestions[:10]  # Return top 10 most important suggestions

# Detect issues for quick overview
def detect_issues(contact_info, sections, experience_quality, word_count):
    issues = []

    if not contact_info['emails']:
        issues.append('❌ Missing email address')
    if not contact_info['phones']:
        issues.append('❌ Missing phone number')
    if not contact_info['linkedin']:
        issues.append('⚠️ No LinkedIn profile')

    if not sections['has_experience']:
        issues.append('❌ Missing Experience section')
    if not sections['has_education']:
        issues.append('❌ Missing Education section')
    if not sections['has_skills']:
        issues.append('⚠️ Missing Skills section')

    if experience_quality['metrics_count'] == 0:
        issues.append('⚠️ No quantifiable achievements')
    if experience_quality['weak_phrases_count'] > 0:
        issues.append('⚠️ Contains weak phrases')

    if word_count < 200:
        issues.append('⚠️ Resume too short')
    elif word_count > 900:
        issues.append('⚠️ Resume may be too long')

    return issues

# Generate strengths
def detect_strengths(contact_info, skills, sections, experience_quality):
    strengths = []

    if contact_info['emails'] and contact_info['phones']:
        strengths.append('✅ Complete contact information')
    if contact_info['linkedin']:
        strengths.append('✅ LinkedIn profile included')
    if contact_info['github']:
        strengths.append('✅ GitHub profile included')

    if sections['has_summary']:
        strengths.append('✅ Professional summary present')
    if sections['has_experience']:
        strengths.append('✅ Work experience section')
    if sections['has_education']:
        strengths.append('✅ Education section')
    if sections['has_projects']:
        strengths.append('✅ Projects section showcases work')
    if sections['has_certifications']:
        strengths.append('✅ Certifications listed')

    total_tech = (
        len(skills['programming_languages']) +
        len(skills['frameworks']) +
        len(skills['databases'])
    )
    if total_tech >= 5:
        strengths.append(f'✅ Good technical skills ({total_tech} technologies)')

    if experience_quality['strong_verbs_count'] >= 5:
        strengths.append('✅ Strong action verbs used')
    if experience_quality['metrics_count'] >= 3:
        strengths.append('✅ Quantifiable achievements included')

    return strengths

# Main analysis function
def analyze_resume_text(text):
    try:
        if not text or len(text.strip()) < 50:
            return {'error': 'Text too short for analysis (minimum 50 characters)'}

        word_count = len(text.split())

        # Extract all information
        contact_info = extract_contact_info(text)
        skills = extract_skills(text)
        sections = analyze_sections(text)
        experience_quality = analyze_experience_quality(text)

        # Calculate score
        score, score_breakdown = calculate_score(text, contact_info, skills, sections, experience_quality)

        # Generate suggestions
        suggestions = generate_suggestions(text, contact_info, skills, sections, experience_quality, score, score_breakdown)

        # Detect issues and strengths
        issues = detect_issues(contact_info, sections, experience_quality, word_count)
        strengths = detect_strengths(contact_info, skills, sections, experience_quality)

        # Flatten skills for output
        all_skills = []
        for category, skill_list in skills.items():
            all_skills.extend(skill_list)

        logger.info(f"✅ Analysis complete - Score: {score}/10")

        return {
            'score': score,
            'score_breakdown': score_breakdown,
            'skills': skills,
            'all_skills': all_skills,
            'contactInfo': contact_info,
            'sections': sections,
            'experience_quality': {
                'strong_verbs_count': experience_quality['strong_verbs_count'],
                'weak_phrases_count': experience_quality['weak_phrases_count'],
                'metrics_count': experience_quality['metrics_count'],
                'has_metrics': experience_quality['has_metrics'],
            },
            'issues': issues,
            'strengths': strengths,
            'suggestions': suggestions,
            'analysis_summary': {
                'total_skills': len(all_skills),
                'word_count': word_count,
                'sections_complete': sum(sections.values()),
                'sections_total': len(sections),
            }
        }

    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        return {
            'error': f'Analysis failed: {str(e)}',
            'score': 5.0,
            'suggestions': [{'priority': 'high', 'suggestion': 'Please try uploading your resume again'}]
        }

# Flask routes
@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'Resume Analysis API v3.0',
        'features': [
            'Comprehensive skill detection',
            'Section analysis',
            'Experience quality scoring',
            'Actionable suggestions',
            'Quantifiable metrics detection'
        ]
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

@app.route('/analyze-text', methods=['POST'])
def analyze_text():
    try:
        logger.info("📥 Received analysis request")

        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400

        text = data['text']
        logger.info(f"🔍 Analyzing resume ({len(text)} chars)")

        analysis = analyze_resume_text(text)

        if 'error' in analysis and analysis.get('score') is None:
            return jsonify(analysis), 400

        return jsonify({
            'success': True,
            'analysis': analysis
        })

    except Exception as e:
        logger.error(f"❌ Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"🚀 Starting Resume Analysis API on port {port}")
    app.run(debug=False, host='0.0.0.0', port=port)
