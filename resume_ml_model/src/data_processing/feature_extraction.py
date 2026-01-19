import re
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.tag import pos_tag
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from collections import Counter
import textstat
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ResumeFeatureExtractor:
    """
    Extract comprehensive features from resume text for ML model training
    """
    
    def __init__(self):
        self.download_nltk_data()
        self.initialize_keywords()
        self.tfidf_vectorizer = None
        self.count_vectorizer = None
        
    def download_nltk_data(self):
        """Download required NLTK data"""
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt')
        
        try:
            nltk.data.find('corpora/stopwords')
        except LookupError:
            nltk.download('stopwords')
            
        try:
            nltk.data.find('taggers/averaged_perceptron_tagger')
        except LookupError:
            nltk.download('averaged_perceptron_tagger')
    
    def initialize_keywords(self):
        """Initialize keyword dictionaries for feature extraction"""
        
        # Technical skills by category
        self.technical_skills = {
            'programming_languages': [
                'python', 'java', 'javascript', 'c++', 'c#', 'php', 'ruby', 'go', 
                'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl'
            ],
            'web_technologies': [
                'html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 
                'django', 'flask', 'spring', 'bootstrap', 'jquery'
            ],
            'databases': [
                'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 
                'cassandra', 'oracle', 'sqlite', 'dynamodb'
            ],
            'cloud_platforms': [
                'aws', 'azure', 'gcp', 'google cloud', 'heroku', 'digitalocean'
            ],
            'devops_tools': [
                'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible', 
                'git', 'github', 'gitlab', 'ci/cd'
            ],
            'data_science': [
                'machine learning', 'deep learning', 'tensorflow', 'pytorch', 
                'pandas', 'numpy', 'scikit-learn', 'keras', 'spark'
            ]
        }
        
        # Soft skills
        self.soft_skills = [
            'leadership', 'communication', 'teamwork', 'collaboration', 
            'problem solving', 'analytical', 'creative', 'organized',
            'detail-oriented', 'self-motivated', 'adaptable', 'innovative'
        ]
        
        # Action verbs (power words)
        self.action_verbs = [
            'achieved', 'accomplished', 'implemented', 'developed', 'created',
            'managed', 'led', 'improved', 'increased', 'decreased', 'optimized',
            'designed', 'built', 'launched', 'delivered', 'executed', 'drove',
            'spearheaded', 'streamlined', 'collaborated', 'mentored'
        ]
        
        # Resume sections
        self.section_keywords = {
            'contact': ['email', 'phone', 'address', 'linkedin', 'github'],
            'summary': ['summary', 'objective', 'profile', 'about'],
            'experience': ['experience', 'work', 'employment', 'career'],
            'education': ['education', 'degree', 'university', 'college'],
            'skills': ['skills', 'technical', 'competencies'],
            'projects': ['projects', 'portfolio'],
            'certifications': ['certifications', 'certificates', 'licenses']
        }
        
        # Industry keywords
        self.industry_keywords = {
            'technology': ['software', 'programming', 'development', 'coding', 'tech'],
            'marketing': ['marketing', 'advertising', 'branding', 'campaigns'],
            'finance': ['finance', 'accounting', 'investment', 'banking'],
            'healthcare': ['healthcare', 'medical', 'clinical', 'patient'],
            'education': ['teaching', 'curriculum', 'student', 'academic']
        }
    
    def extract_basic_features(self, text: str) -> Dict:
        """Extract basic text statistics"""
        
        words = word_tokenize(text.lower())
        sentences = sent_tokenize(text)
        
        features = {
            # Basic counts
            'word_count': len(words),
            'sentence_count': len(sentences),
            'character_count': len(text),
            'unique_word_count': len(set(words)),
            
            # Ratios
            'avg_word_length': np.mean([len(word) for word in words]) if words else 0,
            'avg_sentence_length': len(words) / len(sentences) if sentences else 0,
            'unique_word_ratio': len(set(words)) / len(words) if words else 0,
            
            # Readability scores
            'flesch_reading_ease': textstat.flesch_reading_ease(text),
            'flesch_kincaid_grade': textstat.flesch_kincaid_grade(text),
            'gunning_fog': textstat.gunning_fog(text),
        }
        
        return features
    
    def extract_content_quality_features(self, text: str) -> Dict:
        """Extract features related to content quality"""
        
        text_lower = text.lower()
        words = word_tokenize(text_lower)
        
        features = {
            # Action verbs
            'action_verb_count': sum(1 for verb in self.action_verbs if verb in text_lower),
            'action_verb_ratio': sum(1 for verb in self.action_verbs if verb in text_lower) / len(words) if words else 0,
            
            # Quantified achievements
            'number_count': len(re.findall(r'\d+', text)),
            'percentage_count': len(re.findall(r'\d+%', text)),
            'dollar_amount_count': len(re.findall(r'\$\d+', text)),
            'quantified_achievement_score': len(re.findall(r'\d+%|\$\d+|\d+\+|increased.*\d+|decreased.*\d+', text)),
            
            # Professional language
            'first_person_count': len(re.findall(r'\b(i|me|my|myself)\b', text_lower)),
            'professional_language_score': 1 - (len(re.findall(r'\b(i|me|my|myself)\b', text_lower)) / len(words)) if words else 1,
            
            # Grammar and spelling (basic checks)
            'exclamation_count': text.count('!'),
            'question_count': text.count('?'),
            'caps_ratio': sum(1 for c in text if c.isupper()) / len(text) if text else 0,
        }
        
        return features
    
    def extract_skills_features(self, text: str) -> Dict:
        """Extract skills-related features"""
        
        text_lower = text.lower()
        
        # Count technical skills by category
        tech_skill_counts = {}
        total_tech_skills = 0
        
        for category, skills in self.technical_skills.items():
            count = sum(1 for skill in skills if skill in text_lower)
            tech_skill_counts[f'tech_skills_{category}'] = count
            total_tech_skills += count
        
        # Count soft skills
        soft_skill_count = sum(1 for skill in self.soft_skills if skill in text_lower)
        
        features = {
            'total_technical_skills': total_tech_skills,
            'soft_skills_count': soft_skill_count,
            'skills_diversity': len([cat for cat, count in tech_skill_counts.items() if count > 0]),
            **tech_skill_counts
        }
        
        return features
    
    def extract_structure_features(self, text: str) -> Dict:
        """Extract resume structure-related features"""
        
        text_lower = text.lower()
        
        # Check for required sections
        sections_present = {}
        for section, keywords in self.section_keywords.items():
            sections_present[f'has_{section}_section'] = any(keyword in text_lower for keyword in keywords)
        
        # Contact information
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        
        features = {
            'has_email': bool(re.search(email_pattern, text)),
            'has_phone': bool(re.search(phone_pattern, text)),
            'section_count': sum(sections_present.values()),
            'completeness_score': sum(sections_present.values()) / len(sections_present),
            **sections_present
        }
        
        return features
    
    def extract_keyword_features(self, text: str) -> Dict:
        """Extract keyword-related features for ATS optimization"""
        
        text_lower = text.lower()
        words = word_tokenize(text_lower)
        
        # Industry keyword counts
        industry_counts = {}
        for industry, keywords in self.industry_keywords.items():
            count = sum(1 for keyword in keywords if keyword in text_lower)
            industry_counts[f'industry_{industry}_keywords'] = count
        
        # Keyword density
        total_keywords = sum(industry_counts.values())
        keyword_density = total_keywords / len(words) if words else 0
        
        features = {
            'keyword_density': keyword_density,
            'total_industry_keywords': total_keywords,
            **industry_counts
        }
        
        return features
    
    def extract_experience_features(self, text: str) -> Dict:
        """Extract experience-related features"""
        
        # Years of experience (rough estimation)
        year_matches = re.findall(r'20\d{2}', text)
        years_mentioned = len(set(year_matches))
        
        # Experience indicators
        experience_indicators = [
            'years of experience', 'years experience', 'experience in',
            'worked at', 'employed at', 'position at'
        ]
        
        experience_mentions = sum(1 for indicator in experience_indicators if indicator in text.lower())
        
        features = {
            'years_mentioned': years_mentioned,
            'experience_mentions': experience_mentions,
            'has_work_history': any(keyword in text.lower() for keyword in ['work', 'employment', 'job', 'position']),
            'job_titles_count': len(re.findall(r'(engineer|manager|developer|analyst|specialist|coordinator|director)', text.lower()))
        }
        
        return features
    
    def extract_education_features(self, text: str) -> Dict:
        """Extract education-related features"""
        
        text_lower = text.lower()
        
        # Degree types
        degree_types = ['bachelor', 'master', 'phd', 'doctorate', 'associate', 'diploma']
        degree_count = sum(1 for degree in degree_types if degree in text_lower)
        
        # Education institutions
        education_keywords = ['university', 'college', 'institute', 'school']
        institution_count = sum(1 for keyword in education_keywords if keyword in text_lower)
        
        features = {
            'degree_count': degree_count,
            'institution_count': institution_count,
            'has_education': any(keyword in text_lower for keyword in education_keywords + degree_types),
            'has_gpa': 'gpa' in text_lower,
        }
        
        return features
    
    def extract_all_features(self, text: str) -> Dict:
        """Extract all features from resume text"""
        
        all_features = {}
        
        # Extract different types of features
        all_features.update(self.extract_basic_features(text))
        all_features.update(self.extract_content_quality_features(text))
        all_features.update(self.extract_skills_features(text))
        all_features.update(self.extract_structure_features(text))
        all_features.update(self.extract_keyword_features(text))
        all_features.update(self.extract_experience_features(text))
        all_features.update(self.extract_education_features(text))
        
        return all_features
    
    def create_tfidf_features(self, texts: List[str], max_features: int = 1000) -> np.ndarray:
        """Create TF-IDF features from resume texts"""
        
        if self.tfidf_vectorizer is None:
            self.tfidf_vectorizer = TfidfVectorizer(
                max_features=max_features,
                stop_words='english',
                ngram_range=(1, 2),
                min_df=2,
                max_df=0.95
            )
            tfidf_features = self.tfidf_vectorizer.fit_transform(texts)
        else:
            tfidf_features = self.tfidf_vectorizer.transform(texts)
        
        return tfidf_features.toarray()
    
    def process_dataset(self, df: pd.DataFrame, text_column: str = 'resume_text') -> pd.DataFrame:
        """Process entire dataset and extract features for all resumes"""
        
        logger.info(f"Processing {len(df)} resumes for feature extraction...")
        
        # Extract structured features for each resume
        feature_list = []
        for idx, row in df.iterrows():
            text = str(row[text_column])
            features = self.extract_all_features(text)
            features['resume_id'] = row.get('resume_id', f'resume_{idx}')
            feature_list.append(features)
        
        # Convert to DataFrame
        features_df = pd.DataFrame(feature_list)
        
        # Create TF-IDF features
        logger.info("Creating TF-IDF features...")
        tfidf_features = self.create_tfidf_features(df[text_column].tolist())
        
        # Add TF-IDF features to DataFrame
        tfidf_df = pd.DataFrame(
            tfidf_features, 
            columns=[f'tfidf_{i}' for i in range(tfidf_features.shape[1])]
        )
        
        # Combine all features
        final_features_df = pd.concat([features_df, tfidf_df], axis=1)
        
        logger.info(f"Feature extraction complete. Created {final_features_df.shape[1]} features")
        
        return final_features_df
    
    def get_feature_names(self) -> List[str]:
        """Get list of all feature names"""
        
        sample_text = "Sample resume text with experience at company. Skills include Python and machine learning."
        sample_features = self.extract_all_features(sample_text)
        
        feature_names = list(sample_features.keys())
        
        # Add TF-IDF feature names if vectorizer exists
        if self.tfidf_vectorizer is not None:
            tfidf_names = [f'tfidf_{i}' for i in range(len(self.tfidf_vectorizer.get_feature_names_out()))]
            feature_names.extend(tfidf_names)
        
        return feature_names
    
    def save_vectorizers(self, filepath: str):
        """Save trained vectorizers"""
        import joblib
        joblib.dump({
            'tfidf_vectorizer': self.tfidf_vectorizer,
            'count_vectorizer': self.count_vectorizer
        }, filepath)
        logger.info(f"Vectorizers saved to {filepath}")
    
    def load_vectorizers(self, filepath: str):
        """Load trained vectorizers"""
        import joblib
        vectorizers = joblib.load(filepath)
        self.tfidf_vectorizer = vectorizers['tfidf_vectorizer']
        self.count_vectorizer = vectorizers['count_vectorizer']
        logger.info(f"Vectorizers loaded from {filepath}")

if __name__ == "__main__":
    # Example usage
    extractor = ResumeFeatureExtractor()
    
    # Test with sample text
    sample_resume = """
    John Doe
    Email: john.doe@email.com
    Phone: (555) 123-4567
    
    PROFESSIONAL SUMMARY
    Experienced software engineer with 5+ years in full-stack development
    
    WORK EXPERIENCE
    Senior Software Engineer - Tech Corp (2020-2023)
    • Developed and maintained 10+ web applications using React and Node.js
    • Improved system performance by 35% through code optimization
    • Led team of 4 developers in agile development process
    
    SKILLS
    Python, JavaScript, React, Node.js, SQL, MongoDB, AWS, Docker
    
    EDUCATION
    Bachelor of Science in Computer Science
    University of Technology (2016-2020)
    """
    
    features = extractor.extract_all_features(sample_resume)
    print("Extracted features:")
    for key, value in features.items():
        print(f"{key}: {value}") 