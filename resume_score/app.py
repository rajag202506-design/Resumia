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

# Generate suggestions
def suggest_improvements(processed_text, score):
    suggestions = []

    missing_keywords = [kw for kw in important_words[:10] if kw not in processed_text]

    if score < 5:
        suggestions.append("Resume needs significant improvement - consider professional resume writing services")
        suggestions.append("Add more quantifiable achievements and results")
        suggestions.append("Include relevant technical skills and certifications")
    elif score < 7:
        suggestions.append("Good resume, but can be improved with more specific details")
        suggestions.append("Add measurable achievements (numbers, percentages, metrics)")
    else:
        suggestions.append("Excellent resume! Just minor tweaks needed")

    if missing_keywords:
        suggestions.append(f"Consider adding relevant keywords: {', '.join(missing_keywords[:5])}")

    suggestions.append("Use strong action verbs (developed, implemented, managed, led)")
    suggestions.append("Tailor your resume to match the job description")
    suggestions.append("Keep resume concise and well-formatted")

    return suggestions[:8]

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

        # Generate suggestions
        suggestions = suggest_improvements(processed, ml_score)

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
