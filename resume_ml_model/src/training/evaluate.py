 import sys
import numpy as np
import pandas as pd
from pathlib import Path
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix
import joblib
import logging

# Add src to path
sys.path.append(str(Path(__file__).parent.parent))

from models.resume_scorer import ResumeScorer
from data_processing.feature_extraction import ResumeFeatureExtractor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelEvaluator:
    """
    Comprehensive evaluation of trained resume scoring model
    """
    
    def __init__(self, model_path: str, feature_extractor_path: str = None):
        """
        Initialize evaluator with trained model
        
        Args:
            model_path: Path to trained model
            feature_extractor_path: Path to feature extractor (optional)
        """
        self.model_path = model_path
        self.feature_extractor_path = feature_extractor_path
        
        # Load model
        self.scorer = ResumeScorer()
        self.scorer.load_model(model_path)
        
        # Load feature extractor if provided
        if feature_extractor_path and Path(feature_extractor_path).exists():
            self.feature_extractor = ResumeFeatureExtractor()
            self.feature_extractor.load_vectorizers(feature_extractor_path)
        else:
            self.feature_extractor = ResumeFeatureExtractor()
        
        logger.info("Model and feature extractor loaded successfully")
    
    def evaluate_sample_resumes(self):
        """Test model on sample resumes with known quality levels"""
        
        # Sample resumes with expected scores
        test_resumes = {
            'excellent_resume': {
                'text': """
                John Smith
                Email: john.smith@email.com | Phone: (555) 123-4567
                LinkedIn: linkedin.com/in/johnsmith
                
                PROFESSIONAL SUMMARY
                Results-driven Senior Software Engineer with 8+ years of experience in full-stack development.
                Proven track record of leading teams and delivering high-quality solutions that increased 
                system performance by 40% and reduced deployment time by 60%.
                
                WORK EXPERIENCE
                
                Senior Software Engineer | TechCorp Inc. | 2020 - Present
                • Led development of microservices architecture serving 1M+ daily users
                • Improved system performance by 40% through optimization and caching strategies
                • Mentored team of 6 junior developers and conducted code reviews
                • Implemented CI/CD pipeline reducing deployment time by 60%
                • Technologies: Python, React, AWS, Docker, Kubernetes
                
                Software Engineer | StartupXYZ | 2018 - 2020
                • Developed and maintained 5+ web applications using React and Node.js
                • Collaborated with product team to deliver features ahead of schedule
                • Reduced bug reports by 35% through comprehensive testing strategies
                • Built RESTful APIs handling 10,000+ requests per minute
                
                TECHNICAL SKILLS
                Programming: Python, JavaScript, Java, TypeScript
                Frameworks: React, Node.js, Django, Express
                Cloud: AWS, Azure, Docker, Kubernetes
                Databases: PostgreSQL, MongoDB, Redis
                Tools: Git, Jenkins, JIRA, VS Code
                
                EDUCATION
                Bachelor of Science in Computer Science
                University of Technology | 2014 - 2018
                GPA: 3.8/4.0
                
                CERTIFICATIONS
                • AWS Certified Solutions Architect
                • Google Cloud Professional Developer
                """,
                'expected_range': (85, 95)
            },
            
            'good_resume': {
                'text': """
                Jane Doe
                jane.doe@email.com | (555) 987-6543
                
                OBJECTIVE
                Seeking a software developer position to utilize my programming skills
                
                EXPERIENCE
                Software Developer | ABC Company | 2021 - 2023
                • Worked on web development projects
                • Used various programming languages
                • Collaborated with team members
                • Fixed bugs and implemented features
                
                Junior Developer | XYZ Corp | 2020 - 2021
                • Developed web applications
                • Learned new technologies
                • Participated in team meetings
                
                SKILLS
                • Programming: Python, JavaScript, HTML, CSS
                • Frameworks: React, Node.js
                • Database: MySQL
                • Tools: Git, VS Code
                
                EDUCATION
                Bachelor's Degree in Computer Science
                State University | 2016 - 2020
                """,
                'expected_range': (65, 75)
            },
            
            'poor_resume': {
                'text': """
                Bob Johnson
                
                I am looking for a job in technology. I have some experience with computers
                and I am a hard worker.
                
                Work History:
                - Worked at a company doing various tasks
                - Used Microsoft Office
                - Answered phones and emails
                - Did some computer work
                
                Skills:
                - Computer skills
                - Communication
                - Hard worker
                - Team player
                
                Education:
                High school diploma
                """,
                'expected_range': (25, 45)
            }
        }
        
        logger.info("Evaluating sample resumes...")
        
        results = {}
        for resume_name, resume_data in test_resumes.items():
            # Extract features
            features = self.feature_extractor.extract_all_features(resume_data['text'])
            features_df = pd.DataFrame([features])
            
            # Predict score
            predicted_score = self.scorer.predict(features_df)[0]
            expected_min, expected_max = resume_data['expected_range']
            
            # Check if prediction is in expected range
            in_range = expected_min <= predicted_score <= expected_max
            
            results[resume_name] = {
                'predicted_score': predicted_score,
                'expected_range': resume_data['expected_range'],
                'in_expected_range': in_range,
                'text_length': len(resume_data['text'].split())
            }
            
            print(f"\n{resume_name.replace('_', ' ').title()}:")
            print(f"  Predicted Score: {predicted_score:.1f}")
            print(f"  Expected Range: {expected_min}-{expected_max}")
            print(f"  In Range: {'✓' if in_range else '✗'}")
        
        return results
    
    def analyze_feature_importance(self):
        """Analyze and visualize feature importance"""
        
        importance_df = self.scorer.get_feature_importance()
        
        # Create visualization
        plt.figure(figsize=(12, 8))
        
        # Top 20 features
        top_features = importance_df.head(20)
        
        plt.barh(range(len(top_features)), top_features['importance'])
        plt.yticks(range(len(top_features)), top_features['feature'])
        plt.xlabel('Feature Importance')
        plt.title('Top 20 Most Important Features for Resume Scoring')
        plt.gca().invert_yaxis()
        
        plt.tight_layout()
        plt.show()
        
        return importance_df
    
    def test_edge_cases(self):
        """Test model on edge cases and unusual resumes"""
        
        edge_cases = {
            'very_short': "John Doe. Software Engineer. Python, JavaScript.",
            'very_long': " ".join(["This is a very long resume with lots of repeated content."] * 100),
            'no_skills': """
                John Doe
                john@email.com
                
                EXPERIENCE
                Worker at Company
                Did various tasks and responsibilities.
                
                EDUCATION
                Degree from University
            """,
            'all_caps': """
                JOHN DOE
                JOHN@EMAIL.COM
                
                SENIOR SOFTWARE ENGINEER WITH 10 YEARS EXPERIENCE
                EXPERT IN PYTHON, JAVA, JAVASCRIPT
                LED TEAMS AND DELIVERED PROJECTS
            """,
            'special_characters': """
                João Müller
                joão.müller@émáíl.com
                
                Softwäre Engîneer with experiénce in Python & JavaScript
                • Developed web applications using React & Node.js
                • Improved performance by 50%+ through optimization
            """
        }
        
        logger.info("Testing edge cases...")
        
        results = {}
        for case_name, resume_text in edge_cases.items():
            try:
                features = self.feature_extractor.extract_all_features(resume_text)
                features_df = pd.DataFrame([features])
                predicted_score = self.scorer.predict(features_df)[0]
                
                results[case_name] = {
                    'predicted_score': predicted_score,
                    'success': True,
                    'text_length': len(resume_text.split()),
                    'character_count': len(resume_text)
                }
                
                print(f"{case_name}: {predicted_score:.1f} (✓)")
                
            except Exception as e:
                results[case_name] = {
                    'predicted_score': None,
                    'success': False,
                    'error': str(e)
                }
                print(f"{case_name}: Error - {str(e)} (✗)")
        
        return results
    
    def benchmark_performance(self, n_samples: int = 1000):
        """Benchmark model prediction performance"""
        
        import time
        
        logger.info(f"Benchmarking performance with {n_samples} samples...")
        
        # Create sample data
        sample_resume = """
        John Doe
        Software Engineer with 5 years experience
        Skills: Python, JavaScript, React, Node.js
        Experience: Developed web applications, led team projects
        Education: Computer Science degree
        """
        
        features = self.feature_extractor.extract_all_features(sample_resume)
        features_df = pd.DataFrame([features] * n_samples)
        
        # Time prediction
        start_time = time.time()
        predictions = self.scorer.predict(features_df)
        end_time = time.time()
        
        total_time = end_time - start_time
        time_per_prediction = total_time / n_samples
        predictions_per_second = n_samples / total_time
        
        print(f"\nPerformance Benchmark:")
        print(f"  Total time: {total_time:.3f} seconds")
        print(f"  Time per prediction: {time_per_prediction*1000:.2f} ms")
        print(f"  Predictions per second: {predictions_per_second:.0f}")
        
        return {
            'total_time': total_time,
            'time_per_prediction': time_per_prediction,
            'predictions_per_second': predictions_per_second,
            'n_samples': n_samples
        }
    
    def generate_evaluation_report(self):
        """Generate comprehensive evaluation report"""
        
        print("\n" + "="*60)
        print("RESUME SCORING MODEL - EVALUATION REPORT")
        print("="*60)
        
        # 1. Sample resume evaluation
        print("\n1. Sample Resume Evaluation:")
        sample_results = self.evaluate_sample_resumes()
        
        accuracy_count = sum(1 for r in sample_results.values() if r['in_expected_range'])
        print(f"\nAccuracy on sample resumes: {accuracy_count}/{len(sample_results)} ({accuracy_count/len(sample_results)*100:.1f}%)")
        
        # 2. Feature importance analysis
        print("\n2. Feature Importance Analysis:")
        importance_df = self.analyze_feature_importance()
        print(f"Total features: {len(importance_df)}")
        print("Top 5 features:")
        for idx, row in importance_df.head(5).iterrows():
            print(f"  {row['feature']}: {row['importance']:.4f}")
        
        # 3. Edge case testing
        print("\n3. Edge Case Testing:")
        edge_results = self.test_edge_cases()
        success_count = sum(1 for r in edge_results.values() if r['success'])
        print(f"Edge case success rate: {success_count}/{len(edge_results)} ({success_count/len(edge_results)*100:.1f}%)")
        
        # 4. Performance benchmark
        print("\n4. Performance Benchmark:")
        perf_results = self.benchmark_performance()
        
        print("\n" + "="*60)
        print("EVALUATION COMPLETE")
        print("="*60)
        
        return {
            'sample_results': sample_results,
            'feature_importance': importance_df,
            'edge_case_results': edge_results,
            'performance_results': perf_results
        }

def main():
    """Main evaluation function"""
    
    # Model paths
    model_path = "models/trained/resume_scorer.joblib"
    feature_path = "models/trained/feature_extractor.joblib"
    
    # Check if model exists
    if not Path(model_path).exists():
        logger.error(f"Model not found at {model_path}")
        logger.info("Please train the model first using: python src/training/train_scorer.py")
        return
    
    # Initialize evaluator
    evaluator = ModelEvaluator(model_path, feature_path)
    
    # Run comprehensive evaluation
    results = evaluator.generate_evaluation_report()
    
    return results

if __name__ == "__main__":
    main()