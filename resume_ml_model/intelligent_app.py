from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import traceback
import re
import json
import nltk
import spacy
from collections import Counter, defaultdict
import numpy as np
from textstat import flesch_reading_ease, flesch_kincaid_grade
import sys
import os

# Add src directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

try:
    from src.data_processing.feature_extraction import FeatureExtractor
    from src.models.ensemble_model import EnsembleResumeModel
    from src.models.suggestion_engine import SuggestionEngine
    from src.utils.text_utils import TextProcessor
except ImportError as e:
    print(f"⚠️ Could not import custom modules: {e}")
    print("🔄 Falling back to built-in NLP analysis")

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Download required NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
    nltk.download('wordnet', quiet=True)
except:
    pass

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
    logger.info("✅ spaCy model loaded successfully")
except OSError:
    nlp = None
    logger.warning("⚠️ spaCy model not found - using fallback analysis")

class IntelligentResumeAnalyzer:
    def __init__(self):
        self.setup_models()
        self.setup_patterns()

    def setup_models(self):
        """Initialize ML models and processors"""
        try:
            self.feature_extractor = FeatureExtractor()
            self.ensemble_model = EnsembleResumeModel()
            self.suggestion_engine = SuggestionEngine()
            self.text_processor = TextProcessor()
            self.use_advanced_models = True
            logger.info("✅ Advanced ML models initialized")
        except:
            self.use_advanced_models = False
            logger.info("🔄 Using built-in intelligent analysis")

    def setup_patterns(self):
        """Setup regex patterns for intelligent extraction"""
        # Technical skills with context
        self.tech_patterns = {
            'programming': r'\b(?:python|java|javascript|typescript|c\+\+|c#|php|ruby|go|rust|kotlin|swift|scala|r|matlab)\b',
            'web_frameworks': r'\b(?:react|angular|vue|node\.js|django|flask|express|spring|laravel|rails)\b',
            'databases': r'\b(?:mysql|postgresql|mongodb|redis|elasticsearch|oracle|sqlite|cassandra)\b',
            'cloud_aws': r'\b(?:aws|amazon web services|ec2|s3|lambda|rds|dynamodb|cloudformation)\b',
            'cloud_azure': r'\b(?:azure|microsoft azure|azure functions|cosmos db|azure sql)\b',
            'cloud_gcp': r'\b(?:gcp|google cloud|firebase|big query|cloud functions)\b',
            'devops': r'\b(?:docker|kubernetes|jenkins|git|gitlab|github|ci/cd|terraform|ansible)\b',
            'ml_ai': r'\b(?:machine learning|deep learning|tensorflow|pytorch|scikit-learn|pandas|numpy|opencv)\b',
            'mobile': r'\b(?:android|ios|react native|flutter|xamarin|swift|kotlin)\b'
        }

        # Soft skills with variations
        self.soft_skills = [
            'leadership', 'communication', 'teamwork', 'collaboration', 'problem solving',
            'analytical thinking', 'creative', 'adaptable', 'organized', 'detail oriented',
            'time management', 'project management', 'critical thinking', 'innovation',
            'mentoring', 'training', 'presentation', 'negotiation', 'customer service'
        ]

        # Action verbs for experience evaluation
        self.strong_verbs = [
            'achieved', 'implemented', 'developed', 'created', 'designed', 'built',
            'managed', 'led', 'coordinated', 'organized', 'optimized', 'improved',
            'increased', 'reduced', 'streamlined', 'automated', 'delivered', 'launched'
        ]

        self.weak_verbs = ['responsible for', 'worked on', 'helped with', 'assisted', 'involved in']

        # Resume sections
        self.section_patterns = {
            'experience': r'(?i)\b(?:experience|employment|work history|professional experience)\b',
            'education': r'(?i)\b(?:education|academic|qualification|degree)\b',
            'skills': r'(?i)\b(?:skills|technical skills|competencies|expertise)\b',
            'projects': r'(?i)\b(?:projects|portfolio|work samples)\b',
            'certifications': r'(?i)\b(?:certification|certificate|license)\b',
            'achievements': r'(?i)\b(?:achievement|accomplishment|award|honor)\b'
        }

    def extract_technical_skills(self, text):
        """Extract technical skills using NLP and pattern matching"""
        text_lower = text.lower()
        skills = defaultdict(list)

        if nlp:
            doc = nlp(text)
            # Extract entities that might be technologies
            for ent in doc.ents:
                if ent.label_ in ['ORG', 'PRODUCT']:
                    skills['entities'].append(ent.text)

        # Pattern-based extraction
        for category, pattern in self.tech_patterns.items():
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            if matches:
                skills[category].extend(matches)

        # Remove duplicates
        for category in skills:
            skills[category] = list(set(skills[category]))

        return dict(skills)

    def extract_soft_skills(self, text):
        """Extract soft skills with context analysis"""
        text_lower = text.lower()
        found_skills = []

        for skill in self.soft_skills:
            if skill.lower() in text_lower:
                # Check for context (not just keyword matching)
                skill_pattern = rf'\b{re.escape(skill.lower())}\b'
                if re.search(skill_pattern, text_lower):
                    found_skills.append(skill)

        return found_skills

    def analyze_experience_quality(self, text):
        """Analyze the quality of experience descriptions"""
        text_lower = text.lower()

        # Count strong vs weak action verbs
        strong_verb_count = sum(1 for verb in self.strong_verbs if verb in text_lower)
        weak_verb_count = sum(1 for verb in self.weak_verbs if verb in text_lower)

        # Look for quantified achievements
        numbers_pattern = r'\b\d+(?:\.\d+)?(?:\s*(?:%|percent|k|million|billion|years?|months?|days?|hours?))\b'
        quantified_achievements = len(re.findall(numbers_pattern, text_lower))

        # Analyze sentence structure
        sentences = re.split(r'[.!?]+', text)
        avg_sentence_length = np.mean([len(s.split()) for s in sentences if s.strip()])

        return {
            'strong_verbs': strong_verb_count,
            'weak_verbs': weak_verb_count,
            'quantified_achievements': quantified_achievements,
            'avg_sentence_length': avg_sentence_length,
            'total_sentences': len([s for s in sentences if s.strip()])
        }

    def detect_resume_sections(self, text):
        """Detect which resume sections are present"""
        detected_sections = {}

        for section, pattern in self.section_patterns.items():
            if re.search(pattern, text):
                detected_sections[section] = True
            else:
                detected_sections[section] = False

        return detected_sections

    def calculate_ats_compatibility(self, text):
        """Calculate ATS compatibility score"""
        issues = []
        score = 100

        # Check for problematic formatting
        if len(re.findall(r'[^\w\s\-.,()@:/]', text)) > 50:
            issues.append("Contains special characters that may confuse ATS")
            score -= 10

        # Check for standard sections
        sections = self.detect_resume_sections(text)
        missing_sections = [s for s, present in sections.items() if not present and s in ['experience', 'education']]
        if missing_sections:
            issues.append(f"Missing critical sections: {', '.join(missing_sections)}")
            score -= 15 * len(missing_sections)

        # Check for contact information
        if not re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text):
            issues.append("Email address not found")
            score -= 10

        # Check readability
        try:
            readability = flesch_reading_ease(text)
            if readability < 30:
                issues.append("Text is too complex - simplify language for ATS")
                score -= 10
        except:
            pass

        return max(0, score), issues

    def detect_specific_issues(self, text, skills, experience_analysis, sections):
        """Detect specific resume issues with detailed analysis"""
        issues = []

        # Skills-related issues
        total_skills = sum(len(skill_list) if isinstance(skill_list, list) else 1
                          for skill_list in skills.values() if skill_list)
        if total_skills < 5:
            issues.append("Limited technical skills mentioned - add more relevant technologies")

        # Experience quality issues
        if experience_analysis['weak_verbs'] > experience_analysis['strong_verbs']:
            issues.append("Too many weak action verbs - replace with stronger action words")

        if experience_analysis['quantified_achievements'] < 2:
            issues.append("Lack of quantified achievements - add specific numbers and metrics")

        if experience_analysis['avg_sentence_length'] > 25:
            issues.append("Sentences too long - break into shorter, clearer statements")

        # Section-related issues
        if not sections.get('projects', False):
            issues.append("No projects section found - consider adding relevant projects")

        if not sections.get('skills', False):
            issues.append("No dedicated skills section - create a clear skills section")

        # Content analysis
        word_count = len(text.split())
        if word_count < 200:
            issues.append("Resume content too brief - expand with more details")
        elif word_count > 1000:
            issues.append("Resume too lengthy - consider condensing content")

        # Check for passive language
        passive_indicators = ['was responsible', 'were involved', 'duties included']
        passive_count = sum(1 for indicator in passive_indicators if indicator in text.lower())
        if passive_count > 2:
            issues.append("Too much passive language - use active voice for impact")

        return issues

    def generate_intelligent_suggestions(self, issues, skills, experience_analysis, ats_score):
        """Generate contextual suggestions based on detected issues"""
        suggestions = []

        # Skill-based suggestions
        skill_categories = list(skills.keys())
        if 'programming' not in skill_categories:
            suggestions.append("Add programming languages you know (Python, JavaScript, etc.)")

        if 'cloud_aws' not in skill_categories and 'cloud_azure' not in skill_categories:
            suggestions.append("Consider adding cloud platform experience (AWS, Azure, GCP)")

        # Experience improvement suggestions
        if experience_analysis['strong_verbs'] < 3:
            suggestions.append("Start bullet points with strong action verbs like 'Achieved', 'Implemented', 'Led'")

        if experience_analysis['quantified_achievements'] == 0:
            suggestions.append("Quantify your impact: 'Improved efficiency by 30%' instead of 'Improved efficiency'")

        # ATS optimization suggestions
        if ats_score < 80:
            suggestions.append("Improve ATS compatibility by using standard section headers and simple formatting")

        # Issue-specific suggestions
        for issue in issues:
            if "weak action verbs" in issue:
                suggestions.append("Replace 'responsible for' with 'managed', 'worked on' with 'developed'")
            elif "quantified achievements" in issue:
                suggestions.append("Add metrics: revenue increased, time saved, team size managed, projects completed")
            elif "technical skills" in issue:
                suggestions.append("Include frameworks, tools, and technologies relevant to your target role")
            elif "projects section" in issue:
                suggestions.append("Add 2-3 relevant projects with technologies used and impact achieved")

        # Always include improvement suggestions
        suggestions.extend([
            "Use keywords from job descriptions to improve keyword matching",
            "Include industry-specific terminology and certifications",
            "Ensure consistent formatting and professional presentation"
        ])

        return suggestions[:8]  # Limit to top 8 suggestions

    def calculate_intelligent_score(self, skills, experience_analysis, sections, ats_score, issues):
        """Calculate an intelligent overall score"""
        base_score = 5.0  # Start with middle score

        # Skills contribution (0-2 points)
        total_skills = sum(len(skill_list) if isinstance(skill_list, list) else 1
                          for skill_list in skills.values() if skill_list)
        skills_score = min(2.0, total_skills * 0.2)

        # Experience quality (0-2 points)
        exp_score = 0
        if experience_analysis['strong_verbs'] > 0:
            exp_score += min(1.0, experience_analysis['strong_verbs'] * 0.2)
        if experience_analysis['quantified_achievements'] > 0:
            exp_score += min(1.0, experience_analysis['quantified_achievements'] * 0.3)

        # Sections completeness (0-1.5 points)
        section_score = sum(0.25 for present in sections.values() if present)
        section_score = min(1.5, section_score)

        # ATS compatibility (0-1 point)
        ats_contribution = min(1.0, ats_score / 100)

        # Deduct for issues
        issue_penalty = min(2.0, len(issues) * 0.2)

        final_score = base_score + skills_score + exp_score + section_score + ats_contribution - issue_penalty
        return max(0.1, min(10.0, final_score))

    def analyze_text(self, text):
        """Main analysis function with intelligent processing"""
        try:
            logger.info("🔍 Starting intelligent resume analysis")

            # Extract features using advanced methods
            technical_skills = self.extract_technical_skills(text)
            soft_skills = self.extract_soft_skills(text)
            experience_analysis = self.analyze_experience_quality(text)
            sections = self.detect_resume_sections(text)
            ats_score, ats_issues = self.calculate_ats_compatibility(text)

            # Detect issues
            issues = self.detect_specific_issues(text, technical_skills, experience_analysis, sections)
            issues.extend(ats_issues)

            # Generate intelligent suggestions
            suggestions = self.generate_intelligent_suggestions(
                issues, technical_skills, experience_analysis, ats_score
            )

            # Calculate final score
            final_score = self.calculate_intelligent_score(
                technical_skills, experience_analysis, sections, ats_score, issues
            )

            # Prepare keywords in expected format
            all_keywords = {}
            for category, skills in technical_skills.items():
                if skills:
                    for skill in skills:
                        all_keywords[skill] = 1

            for skill in soft_skills:
                all_keywords[skill] = 1

            logger.info(f"✅ Analysis complete - Score: {final_score:.1f}, Issues: {len(issues)}")

            return {
                'score': round(final_score, 1),
                'keywords': all_keywords,
                'issues': issues,
                'suggestions': suggestions,
                'analysis_summary': {
                    'total_keywords': len(all_keywords),
                    'technical_skills_count': sum(len(skills) if isinstance(skills, list) else 1
                                                for skills in technical_skills.values() if skills),
                    'soft_skills_count': len(soft_skills),
                    'ats_compatibility_score': ats_score,
                    'experience_quality': {
                        'strong_verbs': experience_analysis['strong_verbs'],
                        'quantified_achievements': experience_analysis['quantified_achievements']
                    },
                    'sections_detected': sections,
                    'word_count': len(text.split()),
                    'character_count': len(text)
                }
            }

        except Exception as e:
            logger.error(f"Analysis error: {str(e)}")
            logger.error(traceback.format_exc())
            return {
                'score': 2.0,
                'keywords': {},
                'issues': ['Analysis encountered an error - please try again'],
                'suggestions': ['Ensure your resume contains standard sections and clear text'],
                'analysis_summary': {
                    'total_keywords': 0,
                    'technical_skills_count': 0,
                    'soft_skills_count': 0,
                    'ats_compatibility_score': 0,
                    'word_count': len(text.split()) if text else 0,
                    'character_count': len(text) if text else 0
                }
            }

# Initialize the intelligent analyzer
analyzer = IntelligentResumeAnalyzer()

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'Intelligent Resume ML Analysis API',
        'version': '2.0.0',
        'features': ['NLP Analysis', 'ATS Compatibility', 'Smart Suggestions', 'Issue Detection']
    })

@app.route('/analyze-text', methods=['POST'])
def analyze_text():
    try:
        logger.info("📥 Received intelligent analysis request")

        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({
                'error': 'No text provided for analysis'
            }), 400

        text = data['text']
        if not text or len(text.strip()) < 50:
            return jsonify({
                'error': 'Text too short for meaningful analysis (minimum 50 characters)'
            }), 400

        logger.info(f"🔍 Analyzing resume text of length: {len(text)}")

        # Perform intelligent ML analysis
        analysis = analyzer.analyze_text(text)

        logger.info(f"✅ Intelligent analysis complete - Score: {analysis['score']}/10")

        return jsonify({
            'success': True,
            'analysis': analysis
        })

    except Exception as e:
        logger.error(f"❌ Analysis failed: {str(e)}")
        logger.error(traceback.format_exc())

        return jsonify({
            'error': 'Internal server error during analysis',
            'details': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint not found',
        'available_endpoints': ['/', '/analyze-text']
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Internal server error',
        'message': str(error)
    }), 500

if __name__ == '__main__':
    logger.info("🚀 Starting Intelligent Resume ML Analysis API")
    logger.info("📍 Server will be available at http://localhost:5000")
    logger.info("🧠 Features: Advanced NLP, ATS Analysis, Smart Suggestions")
    app.run(debug=True, host='0.0.0.0', port=5000)