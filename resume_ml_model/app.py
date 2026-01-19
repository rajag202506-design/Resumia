from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import traceback
import re
import json
import nltk
from collections import Counter, defaultdict
import numpy as np

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Download required NLTK data quietly
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
    nltk.download('wordnet', quiet=True)
    from nltk.corpus import stopwords
    from nltk.tokenize import word_tokenize, sent_tokenize
    from nltk.tag import pos_tag
    NLTK_AVAILABLE = True
    logger.info("✅ NLTK loaded successfully")
except:
    NLTK_AVAILABLE = False
    logger.warning("⚠️ NLTK not available - using basic analysis")

class SmartResumeAnalyzer:
    def __init__(self):
        self.setup_patterns()
        self.stop_words = set(stopwords.words('english')) if NLTK_AVAILABLE else set()

    def setup_patterns(self):
        """Setup comprehensive patterns for intelligent extraction"""

        # Advanced technical skills database
        self.tech_skills_db = {
            'programming_languages': [
                'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
                'kotlin', 'swift', 'scala', 'r', 'matlab', 'perl', 'shell', 'bash', 'powershell'
            ],
            'web_technologies': [
                'html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask',
                'spring', 'laravel', 'rails', 'asp.net', 'jquery', 'bootstrap', 'sass', 'less'
            ],
            'databases': [
                'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sqlite',
                'cassandra', 'dynamodb', 'neo4j', 'couchdb', 'mariadb'
            ],
            'cloud_platforms': [
                'aws', 'azure', 'gcp', 'google cloud', 'amazon web services', 'microsoft azure',
                'ec2', 's3', 'lambda', 'rds', 'kubernetes', 'docker', 'terraform', 'ansible'
            ],
            'ml_ai': [
                'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn',
                'pandas', 'numpy', 'opencv', 'nlp', 'computer vision', 'neural networks'
            ],
            'tools_frameworks': [
                'git', 'github', 'gitlab', 'jenkins', 'docker', 'kubernetes', 'jira', 'confluence',
                'agile', 'scrum', 'devops', 'ci/cd', 'rest api', 'graphql', 'microservices'
            ]
        }

        # Soft skills with importance weights
        self.soft_skills = {
            'leadership': ['leadership', 'team lead', 'managing', 'supervising', 'mentoring'],
            'communication': ['communication', 'presentation', 'public speaking', 'writing'],
            'problem_solving': ['problem solving', 'analytical', 'troubleshooting', 'debugging'],
            'teamwork': ['teamwork', 'collaboration', 'cross-functional', 'interpersonal'],
            'project_management': ['project management', 'planning', 'coordination', 'organizing'],
            'adaptability': ['adaptable', 'flexible', 'learning', 'growth mindset']
        }

        # Action verbs categorized by strength
        self.action_verbs = {
            'strong': [
                'achieved', 'implemented', 'developed', 'created', 'designed', 'built', 'engineered',
                'managed', 'led', 'directed', 'coordinated', 'organized', 'optimized', 'improved',
                'increased', 'reduced', 'streamlined', 'automated', 'delivered', 'launched',
                'established', 'initiated', 'transformed', 'revolutionized', 'spearheaded'
            ],
            'moderate': [
                'worked', 'assisted', 'supported', 'contributed', 'participated', 'collaborated',
                'helped', 'maintained', 'updated', 'modified', 'enhanced', 'researched'
            ],
            'weak': [
                'responsible for', 'duties included', 'involved in', 'was tasked with',
                'familiar with', 'exposure to', 'knowledge of'
            ]
        }

        # Resume sections patterns
        self.section_patterns = {
            'contact': r'(?i)(email|phone|address|linkedin|portfolio)',
            'summary': r'(?i)(summary|profile|objective|about)',
            'experience': r'(?i)(experience|employment|work history|professional)',
            'education': r'(?i)(education|academic|qualification|degree|university|college)',
            'skills': r'(?i)(skills|technical|competencies|expertise|proficiencies)',
            'projects': r'(?i)(projects|portfolio|work samples|personal projects)',
            'certifications': r'(?i)(certification|certificate|license|credentials)',
            'achievements': r'(?i)(achievement|accomplishment|award|honor|recognition)'
        }

        # Industry keywords
        self.industry_keywords = {
            'software_engineering': ['software', 'engineering', 'development', 'programming', 'coding'],
            'data_science': ['data science', 'analytics', 'statistics', 'machine learning', 'ai'],
            'cybersecurity': ['security', 'cybersecurity', 'penetration', 'encryption', 'firewall'],
            'product_management': ['product', 'strategy', 'roadmap', 'stakeholder', 'user experience'],
            'marketing': ['marketing', 'campaign', 'brand', 'social media', 'content', 'seo']
        }

    def extract_skills_intelligent(self, text):
        """Extract skills using intelligent pattern matching and context analysis"""
        text_lower = text.lower()
        extracted_skills = defaultdict(list)

        # Extract technical skills
        for category, skills in self.tech_skills_db.items():
            for skill in skills:
                # Look for skill with word boundaries
                pattern = rf'\b{re.escape(skill.lower())}\b'
                if re.search(pattern, text_lower):
                    extracted_skills[category].append(skill)

        # Extract soft skills with context
        for category, variations in self.soft_skills.items():
            for variation in variations:
                pattern = rf'\b{re.escape(variation.lower())}\b'
                if re.search(pattern, text_lower):
                    extracted_skills['soft_skills'].append(variation)

        # Remove duplicates
        for category in extracted_skills:
            extracted_skills[category] = list(set(extracted_skills[category]))

        return dict(extracted_skills)

    def extract_contact_info(self, text):
        """Extract contact information for frontend compatibility"""
        # Extract emails
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)

        # Extract phone numbers
        phone_patterns = [
            r'\b\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b',
            r'\b\+?\d{1,3}[-.\s]?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b'
        ]
        phones = []
        for pattern in phone_patterns:
            phones.extend(re.findall(pattern, text))

        # Extract LinkedIn profiles
        linkedin_patterns = [
            r'linkedin\.com/in/[A-Za-z0-9-]+',
            r'www\.linkedin\.com/in/[A-Za-z0-9-]+'
        ]
        linkedin = []
        for pattern in linkedin_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            linkedin.extend(matches)

        return {
            'emails': list(set(emails)),
            'phones': list(set(phones)),
            'linkedin': list(set(linkedin))
        }

    def analyze_writing_quality(self, text):
        """Analyze writing quality and detect issues"""
        issues = []

        # Sentence analysis
        sentences = sent_tokenize(text) if NLTK_AVAILABLE else re.split(r'[.!?]+', text)

        if len(sentences) == 0:
            return {'issues': ['No clear sentences detected'], 'metrics': {}}

        # Calculate metrics
        avg_sentence_length = np.mean([len(s.split()) for s in sentences if s.strip()])

        # Detect issues
        if avg_sentence_length > 25:
            issues.append("Sentences are too long - aim for 15-20 words per sentence")

        # Look for passive voice
        passive_indicators = ['was ', 'were ', 'been ', 'being ']
        passive_count = sum(text.lower().count(indicator) for indicator in passive_indicators)
        if passive_count > len(sentences) * 0.3:
            issues.append("Too much passive voice - use active voice for stronger impact")

        # Check for repetitive words
        words = text.lower().split()
        word_freq = Counter(words)
        repetitive_words = [word for word, count in word_freq.items()
                          if count > 5 and len(word) > 4 and word not in self.stop_words]
        if repetitive_words:
            issues.append(f"Repetitive words detected: {', '.join(repetitive_words[:3])}")

        return {
            'issues': issues,
            'metrics': {
                'avg_sentence_length': avg_sentence_length,
                'passive_voice_ratio': passive_count / len(sentences) if sentences else 0,
                'total_sentences': len(sentences)
            }
        }

    def evaluate_action_verbs(self, text):
        """Evaluate the strength of action verbs used"""
        text_lower = text.lower()

        verb_analysis = {
            'strong_count': 0,
            'moderate_count': 0,
            'weak_count': 0,
            'found_verbs': {'strong': [], 'moderate': [], 'weak': []}
        }

        for strength, verbs in self.action_verbs.items():
            for verb in verbs:
                pattern = rf'\b{re.escape(verb.lower())}\b'
                if re.search(pattern, text_lower):
                    verb_analysis[f'{strength}_count'] += 1
                    verb_analysis['found_verbs'][strength].append(verb)

        return verb_analysis

    def detect_quantified_achievements(self, text):
        """Detect quantified achievements and metrics"""
        # Patterns for numbers and percentages
        number_patterns = [
            r'\b\d+(?:\.\d+)?%',  # Percentages
            r'\b\d+(?:\.\d+)?\s*(?:million|billion|thousand|k)\b',  # Large numbers
            r'\b\d+(?:\.\d+)?\s*(?:years?|months?|weeks?|days?)\b',  # Time periods
            r'\b\$\d+(?:\.\d+)?(?:[kmb]|\s*(?:million|billion|thousand))?\b',  # Money
            r'\b\d+(?:\.\d+)?\s*(?:users?|customers?|clients?|projects?|teams?)\b',  # Quantities
            r'\b(?:increased|improved|reduced|decreased|saved)\s+(?:by\s+)?\d+(?:\.\d+)?%',  # Impact metrics
        ]

        achievements = []
        for pattern in number_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            achievements.extend(matches)

        return achievements

    def analyze_ats_compatibility(self, text):
        """Comprehensive ATS compatibility analysis"""
        score = 100
        issues = []

        # Check for standard section headers
        sections_found = {}
        for section, pattern in self.section_patterns.items():
            sections_found[section] = bool(re.search(pattern, text))

        critical_sections = ['experience', 'education', 'skills']
        missing_critical = [s for s in critical_sections if not sections_found.get(s, False)]

        if missing_critical:
            score -= 20 * len(missing_critical)
            issues.append(f"Missing critical sections: {', '.join(missing_critical)}")

        # Check for contact information
        contact_patterns = {
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'phone': r'\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b',
            'linkedin': r'linkedin\.com/in/[\w-]+',
        }

        for contact_type, pattern in contact_patterns.items():
            if not re.search(pattern, text, re.IGNORECASE):
                score -= 10
                issues.append(f"No {contact_type} found")

        # Check for problematic formatting characters
        problematic_chars = len(re.findall(r'[^\w\s\-.,()@:/\n\r]', text))
        if problematic_chars > 20:
            score -= 15
            issues.append("Contains special characters that may confuse ATS systems")

        # Word count analysis
        word_count = len(text.split())
        if word_count < 200:
            score -= 15
            issues.append("Resume too brief - expand with more relevant details")
        elif word_count > 800:
            score -= 10
            issues.append("Resume too lengthy - consider condensing content")

        return max(0, score), issues, sections_found

    def generate_contextual_suggestions(self, skills, verb_analysis, achievements, ats_score, ats_issues, writing_issues):
        """Generate intelligent, contextual suggestions"""
        suggestions = []

        # Skills-based suggestions
        total_skills = sum(len(skill_list) for skill_list in skills.values())
        if total_skills < 8:
            suggestions.append("Add more relevant technical skills and tools you've used")

        # Industry-specific suggestions
        if not any('cloud' in category for category in skills.keys()):
            suggestions.append("Consider adding cloud platform experience (AWS, Azure, or GCP)")

        # Action verb suggestions
        if verb_analysis['weak_count'] > verb_analysis['strong_count']:
            suggestions.append("Replace weak phrases like 'responsible for' with strong action verbs like 'managed', 'developed', 'led'")

        if verb_analysis['strong_count'] < 5:
            suggestions.append("Start more bullet points with powerful action verbs to show impact")

        # Achievement suggestions
        if len(achievements) < 3:
            suggestions.append("Add quantified achievements with specific numbers, percentages, or metrics")

        # ATS-specific suggestions
        if ats_score < 80:
            suggestions.append("Improve ATS compatibility by using standard section headers and simple formatting")

        # Writing quality suggestions
        for issue in writing_issues:
            if "sentences are too long" in issue.lower():
                suggestions.append("Break down complex sentences into shorter, clearer statements")
            elif "passive voice" in issue.lower():
                suggestions.append("Use active voice: 'I developed' instead of 'was responsible for developing'")

        # Industry-specific advice
        suggestions.append("Tailor your resume keywords to match the job description")
        suggestions.append("Include relevant certifications or training programs")

        return suggestions[:8]  # Return top 8 suggestions

    def calculate_intelligent_score(self, skills, verb_analysis, achievements, ats_score, sections_found):
        """Calculate comprehensive intelligence score"""

        # Base score - start higher for professional resumes
        base_score = 3.0

        # Skills contribution (0-2.5 points)
        total_skills = sum(len(skill_list) for skill_list in skills.values())
        skills_score = min(2.5, total_skills * 0.2)

        # Action verbs score (0-2 points)
        verb_score = min(2.0, (verb_analysis['strong_count'] * 0.4) - (verb_analysis['weak_count'] * 0.1))
        verb_score = max(0, verb_score)

        # Achievements score (0-1.5 points)
        achievement_score = min(1.5, len(achievements) * 0.5)

        # Sections completeness score (0-1 point)
        critical_sections = ['experience', 'education', 'skills', 'contact']
        critical_found = sum(1 for section in critical_sections if sections_found.get(section, False))
        section_score = min(1.0, critical_found * 0.25)

        total_score = base_score + skills_score + verb_score + achievement_score + section_score

        return round(min(10.0, max(2.0, total_score)), 1)

    def analyze_text(self, text):
        """Main intelligent analysis function"""
        try:
            logger.info("🧠 Starting intelligent resume analysis")

            # Core extractions
            skills = self.extract_skills_intelligent(text)
            verb_analysis = self.evaluate_action_verbs(text)
            achievements = self.detect_quantified_achievements(text)
            ats_score, ats_issues, sections_found = self.analyze_ats_compatibility(text)
            writing_analysis = self.analyze_writing_quality(text)

            # Compile all issues
            all_issues = ats_issues + writing_analysis['issues']

            # Add specific skill-based issues
            if sum(len(skill_list) for skill_list in skills.values()) < 5:
                all_issues.append("Limited technical skills mentioned - showcase your technical expertise")

            if verb_analysis['weak_count'] > verb_analysis['strong_count']:
                all_issues.append("Using too many weak action phrases - strengthen your language")

            if len(achievements) < 2:
                all_issues.append("Lack of quantified achievements - add specific metrics and results")

            # Generate contextual suggestions
            suggestions = self.generate_contextual_suggestions(
                skills, verb_analysis, achievements, ats_score, ats_issues, writing_analysis['issues']
            )

            # Calculate intelligent score
            final_score = self.calculate_intelligent_score(
                skills, verb_analysis, achievements, ats_score, sections_found
            )

            # Extract contact information for frontend compatibility
            contact_info = self.extract_contact_info(text)

            # Prepare keywords for frontend
            all_keywords = {}
            for category, skill_list in skills.items():
                for skill in skill_list:
                    all_keywords[skill] = 1

            # Add found action verbs as keywords
            for strength, verbs in verb_analysis['found_verbs'].items():
                for verb in verbs[:3]:  # Limit to top 3 per category
                    all_keywords[verb] = 1

            logger.info(f"✅ Smart analysis complete - Score: {final_score}/10, Keywords: {len(all_keywords)}")

            return {
                'score': final_score,
                'keywords': all_keywords,
                'contactInfo': contact_info,
                'issues': all_issues,
                'suggestions': suggestions,
                'analysis_summary': {
                    'total_keywords': len(all_keywords),
                    'technical_skills_count': sum(len(skill_list) for skill_list in skills.values()),
                    'soft_skills_count': len(skills.get('soft_skills', [])),
                    'strong_action_verbs': verb_analysis['strong_count'],
                    'quantified_achievements': len(achievements),
                    'ats_compatibility_score': ats_score,
                    'sections_found': sections_found,
                    'writing_quality': writing_analysis['metrics'],
                    'word_count': len(text.split()),
                    'character_count': len(text)
                }
            }

        except Exception as e:
            logger.error(f"Analysis error: {str(e)}")
            logger.error(traceback.format_exc())
            return {
                'score': 3.0,
                'keywords': {},
                'issues': ['Analysis encountered an error - please ensure your resume has clear sections and readable text'],
                'suggestions': ['Try uploading a resume with standard formatting and clear section headers'],
                'analysis_summary': {
                    'total_keywords': 0,
                    'technical_skills_count': 0,
                    'soft_skills_count': 0,
                    'word_count': len(text.split()) if text else 0,
                    'character_count': len(text) if text else 0
                }
            }

# Initialize the smart analyzer
analyzer = SmartResumeAnalyzer()

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'Smart Resume ML Analysis API',
        'version': '3.0.0',
        'features': [
            'Intelligent Keyword Extraction',
            'ATS Compatibility Analysis',
            'Writing Quality Assessment',
            'Contextual AI Suggestions',
            'Quantified Achievement Detection',
            'Action Verb Strength Analysis'
        ]
    })

@app.route('/analyze-text', methods=['POST'])
def analyze_text():
    try:
        logger.info("📥 Received smart analysis request")

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

        # Perform smart ML analysis
        analysis = analyzer.analyze_text(text)

        logger.info(f"✅ Smart analysis complete - Score: {analysis['score']}/10")

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

if __name__ == '__main__':
    logger.info("🚀 Starting Smart Resume ML Analysis API")
    logger.info("📍 Server will be available at http://localhost:5000")
    logger.info("🧠 Features: Intelligent NLP Analysis, ATS Optimization, Smart Suggestions")
    app.run(debug=True, host='0.0.0.0', port=5000)