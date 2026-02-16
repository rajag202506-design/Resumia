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

# Load trained model and vectorizer
MODEL_PATH = 'models/resume_model.pkl'
VECTORIZER_PATH = 'models/vectorizer.pkl'

try:
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)
    logger.info("✅ ML Model and Vectorizer loaded successfully")
except Exception as e:
    logger.error(f"❌ Failed to load ML model: {e}")
    model = None
    vectorizer = None

# Load training data for keyword extraction
TRAINING_DATA_PATH = 'data/processed/training_dataa.csv'
HIGH_SCORE_THRESHOLD = 8

try:
    training_df = pd.read_csv(TRAINING_DATA_PATH)
    high_quality_resumes = training_df[training_df['score'] >= HIGH_SCORE_THRESHOLD]['text'].tolist()

    def preprocess(text):
        text = text.lower()
        text = text.translate(str.maketrans('', '', string.punctuation))
        tokens = text.split()
        tokens = [t for t in tokens if t not in STOPWORDS and t.isalpha()]
        return " ".join(tokens)

    high_quality_processed = [preprocess(r) for r in high_quality_resumes]

    # Extract keywords from high-quality resumes
    temp_vectorizer = TfidfVectorizer(max_features=50)
    top_features_matrix = temp_vectorizer.fit_transform(high_quality_processed)
    feature_names = temp_vectorizer.get_feature_names_out()
    word_importance = np.asarray(top_features_matrix.sum(axis=0)).flatten()
    important_words = [
        word for word, _ in sorted(zip(feature_names, word_importance), key=lambda x: -x[1])[:30]
    ]
    logger.info(f"✅ Extracted {len(important_words)} important keywords")
except Exception as e:
    logger.warning(f"⚠️ Could not load training data: {e}")
    important_words = []

# Extract contact information - AGGRESSIVE APPROACH
def extract_contact_info(text):
    logger.info(f"🔍 Searching for contact info in text (length: {len(text)})")

    # Remove all whitespace/newlines for better matching
    text_clean = ' '.join(text.split())
    logger.info(f"📄 Cleaned text (first 300): {text_clean[:300]}")

    # EMAILS - Super flexible
    email_patterns = [
        r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}',
        r'[a-z0-9]+@[a-z]+\.[a-z]+',  # Simple lowercase
    ]
    emails = []
    for pattern in email_patterns:
        found = re.findall(pattern, text, re.IGNORECASE)
        emails.extend(found)
    emails = list(set([e.lower() for e in emails]))
    logger.info(f"📧 Found emails: {emails}")

    # PHONES - Every possible format
    phone_patterns = [
        r'\d{11}',  # 92312598998
        r'\d{10}',  # 9231259899
        r'\+\d{11,13}',  # +92312598998
        r'\d{5}\s?\d{6}',  # 92312 598998
        r'\d{3}[-\s]?\d{3}[-\s]?\d{4}',  # 923-125-98998
        r'\(\d{3}\)\s?\d{3}[-\s]?\d{4}',  # (923) 125-98998
    ]
    phones = []
    for pattern in phone_patterns:
        found = re.findall(pattern, text_clean)
        phones.extend(found)

    # Also try finding numbers anywhere in text
    all_numbers = re.findall(r'\d+', text)
    for num in all_numbers:
        if len(num) >= 10 and len(num) <= 13:
            phones.append(num)

    phones = list(set(phones))
    logger.info(f"📞 Found phones: {phones}")

    # LINKEDIN - Very flexible
    linkedin_patterns = [
        r'linkedin\.com[/\w-]+',
        r'linkedin[.\s]com[/\w-]+',
        r'linked[^\s]*in[^\s]*/in/[\w-]+',
    ]
    linkedin = []
    for pattern in linkedin_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        linkedin.extend(matches)
    linkedin = list(set(linkedin))
    logger.info(f"🔗 Found LinkedIn: {linkedin}")

    result = {
        'emails': emails,
        'phones': phones,
        'linkedin': linkedin
    }

    logger.info(f"✅ Contact extraction complete: {len(emails)} emails, {len(phones)} phones, {len(linkedin)} linkedin")

    return result

# Extract keywords found in resume
def extract_keywords(text, processed_text):
    keywords = {}
    text_lower = text.lower()

    # Technical skills
    tech_skills = ['python', 'java', 'javascript', 'c++', 'c', 'html', 'css', 'sql', 'react',
                   'node', 'angular', 'vue', 'django', 'flask', 'spring', 'mongodb', 'postgresql',
                   'mysql', 'aws', 'azure', 'docker', 'kubernetes', 'git', 'linux', 'windows',
                   'machine learning', 'ai', 'data science', 'tensorflow', 'pytorch', 'nlp']

    for skill in tech_skills:
        if skill in text_lower:
            keywords[skill] = text_lower.count(skill)

    # Add words from processed text
    words = processed_text.split()
    for word in set(words):
        if len(word) > 3 and word in important_words:
            keywords[word] = words.count(word)

    return keywords

# Analyze resume content for specific suggestions
def analyze_resume_content(text, keywords, contact_info):
    """Deep analysis of resume content to generate specific suggestions"""
    text_lower = text.lower()
    words = text.split()

    analysis = {
        'has_quantifiable_achievements': bool(re.findall(r'\d+%|\$\d+|increased|decreased|improved|reduced|saved', text_lower)),
        'has_action_verbs': any(verb in text_lower for verb in ['developed', 'implemented', 'managed', 'led', 'created', 'designed', 'built', 'achieved']),
        'has_weak_verbs': any(verb in text_lower for verb in ['responsible for', 'duties included', 'worked on', 'helped with']),
        'has_experience_section': 'experience' in text_lower or 'work history' in text_lower,
        'has_education_section': 'education' in text_lower or 'degree' in text_lower or 'university' in text_lower,
        'has_skills_section': 'skills' in text_lower or 'technical skills' in text_lower,
        'has_summary': 'summary' in text_lower or 'objective' in text_lower or 'profile' in text_lower,
        'has_projects': 'project' in text_lower,
        'has_certifications': 'certif' in text_lower or 'license' in text_lower,
        'word_count': len(words),
        'technical_skills_count': len(keywords),
        'has_email': len(contact_info['emails']) > 0,
        'has_phone': len(contact_info['phones']) > 0,
        'has_linkedin': len(contact_info['linkedin']) > 0,
        'has_passive_voice': bool(re.findall(r'\b(was|were|been|being)\s+\w+ed\b', text_lower)),
        'sentence_length': len(words) / max(len(re.findall(r'[.!?]+', text)), 1),
        'has_buzzwords': any(word in text_lower for word in ['synergy', 'leverage', 'paradigm', 'disruptive', 'rockstar']),
    }

    return analysis

# Generate specific, actionable suggestions
def suggest_improvements(text, processed_text, score, keywords, contact_info, issues):
    """Generate specific, actionable suggestions based on actual resume content"""
    suggestions = []
    content_analysis = analyze_resume_content(text, keywords, contact_info)

    # SPECIFIC SUGGESTIONS BASED ON ACTUAL CONTENT

    # 1. Contact Information Improvements (HIGHEST PRIORITY)
    if not content_analysis['has_email']:
        suggestions.append("✉️ ADD: Include your professional email address at the top (e.g., yourname@email.com)")

    if not content_analysis['has_phone']:
        suggestions.append("📱 ADD: Add your phone number in a standard format (e.g., +92-XXX-XXXXXXX)")

    if not content_analysis['has_linkedin']:
        suggestions.append("🔗 ADD: Include your LinkedIn profile URL (linkedin.com/in/yourname)")

    # 2. Missing Critical Sections
    if not content_analysis['has_experience_section']:
        suggestions.append("💼 ADD SECTION: Create a 'Work Experience' or 'Professional Experience' section with your job history")

    if not content_analysis['has_education_section']:
        suggestions.append("🎓 ADD SECTION: Include 'Education' section with your degree, university, and graduation year")

    if not content_analysis['has_skills_section']:
        suggestions.append("⚙️ ADD SECTION: Create a 'Skills' or 'Technical Skills' section listing your competencies")

    if not content_analysis['has_summary'] and score >= 6:
        suggestions.append("📝 ADD: Include a brief professional summary (2-3 sentences) at the top highlighting your expertise")

    # 3. Quantifiable Achievements (CRITICAL FOR HIGH SCORES)
    if not content_analysis['has_quantifiable_achievements']:
        suggestions.append("📊 IMPROVE: Add measurable achievements (e.g., 'Increased sales by 30%', 'Managed team of 5', 'Reduced costs by $10K')")
    elif score < 7:
        suggestions.append("📈 EXPAND: Add more quantifiable results - include percentages, dollar amounts, team sizes, or time saved")

    # 4. Action Verbs Improvements
    if content_analysis['has_weak_verbs'] and not content_analysis['has_action_verbs']:
        suggestions.append("💪 REPLACE: Change weak phrases ('responsible for', 'worked on') to strong action verbs ('Led', 'Developed', 'Implemented', 'Achieved')")
    elif not content_analysis['has_action_verbs']:
        suggestions.append("🎯 IMPROVE: Start each bullet point with strong action verbs (Developed, Managed, Led, Created, Designed, Implemented)")

    # 5. Technical Skills Enhancement
    if content_analysis['technical_skills_count'] < 5:
        missing_skills = []
        common_skills = ['Python', 'JavaScript', 'SQL', 'React', 'Node.js', 'AWS', 'Git', 'Docker', 'MongoDB', 'Java']
        for skill in common_skills:
            if skill.lower() not in text.lower():
                missing_skills.append(skill)

        if missing_skills:
            suggestions.append(f"🔧 ADD SKILLS: If applicable, include these in-demand skills: {', '.join(missing_skills[:5])}")
    elif content_analysis['technical_skills_count'] < 10:
        suggestions.append("🚀 EXPAND: Add more technical skills if you have them (frameworks, tools, platforms, programming languages)")

    # 6. Projects Section
    if not content_analysis['has_projects'] and score < 7:
        suggestions.append("💡 ADD SECTION: Include a 'Projects' section showcasing 2-3 relevant projects with technologies used")

    # 7. Certifications
    if not content_analysis['has_certifications'] and score < 8:
        suggestions.append("🏆 ADD: Include any relevant certifications (AWS, Google Cloud, Microsoft, etc.) if you have them")

    # 8. Length Optimization
    if content_analysis['word_count'] < 200:
        suggestions.append(f"📄 EXPAND: Your resume is too brief ({content_analysis['word_count']} words). Aim for 400-600 words with detailed descriptions")
    elif content_analysis['word_count'] > 800:
        suggestions.append(f"✂️ CONDENSE: Your resume is too long ({content_analysis['word_count']} words). Remove less relevant details and keep it under 600 words")

    # 9. Passive Voice Detection
    if content_analysis['has_passive_voice']:
        suggestions.append("✍️ REWRITE: Convert passive voice ('was responsible for') to active voice ('Led', 'Managed', 'Developed')")

    # 10. Avoid Buzzwords
    if content_analysis['has_buzzwords']:
        suggestions.append("⚠️ REMOVE: Replace vague buzzwords ('synergy', 'rockstar') with specific achievements and technical skills")

    # 11. Missing Keywords from High-Quality Resumes
    if important_words:
        missing_keywords = [kw for kw in important_words[:15] if kw not in processed_text]
        if missing_keywords and len(missing_keywords) > 3:
            suggestions.append(f"🔑 KEYWORDS: Consider adding these industry-standard terms if relevant: {', '.join(missing_keywords[:6])}")

    # 12. Sentence Length Optimization
    if content_analysis['sentence_length'] > 25:
        suggestions.append("📝 SIMPLIFY: Break down long sentences into shorter, clearer statements (aim for 15-20 words per sentence)")

    # 13. Score-Specific Guidance
    if score < 4:
        suggestions.append("🔴 CRITICAL: Your resume needs major improvements. Focus on adding quantifiable achievements, technical skills, and proper structure")
    elif score < 6:
        suggestions.append("🟡 MODERATE: Good foundation, but needs more specific details, metrics, and professional formatting")
    elif score >= 8:
        suggestions.append("🟢 EXCELLENT: Strong resume! Fine-tune with additional metrics and ensure ATS compatibility")

    # 14. ATS Optimization
    if score >= 6:
        suggestions.append("🤖 ATS TIP: Use standard section headers ('Work Experience', 'Education', 'Skills') for applicant tracking systems")

    # 15. Format and Structure
    if not any('section' in s.lower() for s in suggestions[:5]):
        suggestions.append("📋 FORMAT: Use clear section headers, bullet points, and consistent formatting throughout")

    # Return prioritized suggestions (max 10 most relevant)
    return suggestions[:10]

# Generate issues
def detect_issues(text, contact_info, keywords):
    issues = []

    if not contact_info['emails']:
        issues.append("No email found")
    if not contact_info['phones']:
        issues.append("No phone number found")
    if not contact_info['linkedin']:
        issues.append("No LinkedIn profile found")

    if len(keywords) < 5:
        issues.append("Limited technical skills mentioned - showcase your technical expertise")

    if len(text.split()) < 200:
        issues.append("Resume too brief - expand with more relevant details")
    elif len(text.split()) > 800:
        issues.append("Resume too lengthy - consider condensing content")

    # Check for common resume sections
    sections = ['experience', 'education', 'skills', 'summary', 'objective']
    missing_sections = [s for s in sections if s not in text.lower()]
    if len(missing_sections) > 2:
        issues.append(f"Missing important sections: {', '.join(missing_sections[:3])}")

    return issues

# Main analysis function
def analyze_resume_text(text):
    try:
        if not text or len(text.strip()) < 50:
            return {
                'error': 'Text too short for analysis (minimum 50 characters)'
            }

        # Preprocess text
        processed = preprocess(text)

        # Get ML score
        if model and vectorizer:
            features = vectorizer.transform([processed])
            ml_score = model.predict(features)[0]
            ml_score = float(np.clip(ml_score, 0, 10))  # Ensure score is 0-10
        else:
            ml_score = 5.0  # Fallback score

        # Extract contact info
        contact_info = extract_contact_info(text)

        # Extract keywords
        keywords = extract_keywords(text, processed)

        # Detect issues
        issues = detect_issues(text, contact_info, keywords)

        # Generate specific suggestions based on actual content
        suggestions = suggest_improvements(text, processed, ml_score, keywords, contact_info, issues)

        # Calculate metrics
        word_count = len(text.split())
        char_count = len(text)

        logger.info(f"✅ Analysis complete - Score: {ml_score:.1f}/10, Keywords: {len(keywords)}")

        return {
            'score': round(ml_score, 1),
            'keywords': keywords,
            'contactInfo': contact_info,
            'issues': issues,
            'suggestions': suggestions,
            'analysis_summary': {
                'total_keywords': len(keywords),
                'word_count': word_count,
                'character_count': char_count
            }
        }

    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        return {
            'score': 5.0,
            'keywords': {},
            'contactInfo': {'emails': [], 'phones': [], 'linkedin': []},
            'issues': ['Analysis encountered an error'],
            'suggestions': ['Try uploading a well-formatted resume'],
            'analysis_summary': {
                'total_keywords': 0,
                'word_count': len(text.split()) if text else 0,
                'character_count': len(text) if text else 0
            }
        }

# Flask routes
@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'Real ML Resume Analysis API',
        'version': '2.0.0',
        'model_loaded': model is not None,
        'features': [
            'Scikit-learn ML Model',
            'TF-IDF Vectorization',
            'Keyword Extraction',
            'Contact Info Detection',
            'Smart Suggestions'
        ]
    })

@app.route('/analyze-text', methods=['POST'])
def analyze_text():
    try:
        logger.info("📥 Received analysis request")

        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({
                'error': 'No text provided for analysis'
            }), 400

        text = data['text']
        logger.info(f"🔍 Analyzing resume text of length: {len(text)}")

        # Perform analysis
        analysis = analyze_resume_text(text)

        if 'error' in analysis:
            return jsonify(analysis), 400

        logger.info(f"✅ Analysis complete - Score: {analysis['score']}/10")

        return jsonify({
            'success': True,
            'analysis': analysis
        })

    except Exception as e:
        logger.error(f"❌ Analysis failed: {str(e)}")
        return jsonify({
            'error': 'Internal server error during analysis',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    logger.info("🚀 Starting Real ML Resume Analysis API")
    logger.info("📍 Server will be available at http://localhost:5000")
    logger.info("🤖 Using trained scikit-learn ML model")
    app.run(debug=True, host='0.0.0.0', port=5000)
