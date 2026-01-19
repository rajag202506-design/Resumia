import os
import pandas as pd
import numpy as np
import PyPDF2
import docx
import requests
import zipfile
from pathlib import Path
import json
import logging
from typing import List, Dict, Tuple, Optional
import re
from tqdm import tqdm

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ResumeDataLoader:
    """
    Handles loading and processing of resume datasets from various sources
    """
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.raw_dir = self.data_dir / "raw"
        self.processed_dir = self.data_dir / "processed"
        
        # Create directories if they don't exist
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        self.processed_dir.mkdir(parents=True, exist_ok=True)
        
    def download_kaggle_datasets(self):
        """
        Download resume datasets from Kaggle
        Note: Requires Kaggle API credentials
        """
        try:
            import kaggle
            logger.info("Downloading Kaggle datasets...")
            
            # Download resume classification dataset
            kaggle.api.dataset_download_files(
                'snehaanbhawal/resume-dataset',
                path=str(self.raw_dir),
                unzip=True
            )
            
            # Download resume screening dataset
            kaggle.api.dataset_download_files(
                'dhainjeamita/resume-classification', 
                path=str(self.raw_dir),
                unzip=True
            )
            
            logger.info("Datasets downloaded successfully!")
            
        except ImportError:
            logger.error("Kaggle API not installed. Run: pip install kaggle")
        except Exception as e:
            logger.error(f"Error downloading datasets: {e}")
    
    def create_synthetic_dataset(self, num_samples: int = 1000) -> pd.DataFrame:
        """
        Create synthetic resume data for training
        """
        logger.info(f"Creating {num_samples} synthetic resume samples...")
        
        # Sample resume templates and variations
        resume_templates = {
            'good': {
                'summary': [
                    "Experienced software engineer with 5+ years in full-stack development",
                    "Results-driven marketing professional with proven track record of increasing ROI by 40%",
                    "Detail-oriented data scientist with expertise in machine learning and statistical analysis"
                ],
                'experience': [
                    "• Developed and maintained 10+ web applications using React and Node.js\n• Improved system performance by 35% through code optimization\n• Led team of 4 developers in agile development process",
                    "• Managed marketing campaigns with budgets exceeding $500K\n• Increased customer acquisition by 60% through targeted campaigns\n• Collaborated with cross-functional teams to launch 5 successful products"
                ],
                'skills': [
                    "Python, JavaScript, React, Node.js, SQL, MongoDB, AWS, Docker",
                    "Digital Marketing, Google Analytics, SEO, Social Media Marketing, Content Strategy",
                    "Machine Learning, TensorFlow, PyTorch, Statistical Analysis, Data Visualization"
                ],
                'score_range': (75, 95)
            },
            'poor': {
                'summary': [
                    "I am looking for a job where I can use my skills",
                    "Recent graduate seeking opportunities in technology field",
                    "Hardworking individual with good communication skills"
                ],
                'experience': [
                    "• I worked at company X\n• I was responsible for various tasks\n• I helped with different projects",
                    "• Did marketing stuff\n• Made some presentations\n• Attended meetings"
                ],
                'skills': [
                    "Microsoft Office, Email, Internet",
                    "Communication, Teamwork, Hard worker",
                    "Computer skills, Problem solving"
                ],
                'score_range': (25, 55)
            }
        }
        
        synthetic_data = []
        
        for i in tqdm(range(num_samples)):
            # Randomly choose between good and poor resume
            resume_type = np.random.choice(['good', 'poor'], p=[0.6, 0.4])
            template = resume_templates[resume_type]
            
            # Generate resume text
            summary = np.random.choice(template['summary'])
            experience = np.random.choice(template['experience'])
            skills = np.random.choice(template['skills'])
            
            resume_text = f"""
PROFESSIONAL SUMMARY
{summary}

WORK EXPERIENCE
Software Engineer - Tech Company (2020-2023)
{experience}

SKILLS
{skills}

EDUCATION
Bachelor of Science in Computer Science
University Name (2016-2020)
"""
            
            # Generate score based on resume quality
            score_min, score_max = template['score_range']
            score = np.random.randint(score_min, score_max + 1)
            
            # Generate suggestions based on score
            suggestions = self._generate_suggestions_for_score(score, resume_text)
            
            synthetic_data.append({
                'resume_id': f'synthetic_{i:04d}',
                'resume_text': resume_text.strip(),
                'quality_score': score,
                'category': resume_type,
                'suggestions': suggestions,
                'word_count': len(resume_text.split()),
                'has_contact': 'email' in resume_text.lower() or '@' in resume_text,
                'has_quantified_achievements': bool(re.search(r'\d+%|\$\d+|\d+\+', resume_text)),
                'action_verb_count': len(re.findall(r'\b(developed|managed|led|improved|increased|created|implemented|achieved)\b', resume_text.lower()))
            })
        
        df = pd.DataFrame(synthetic_data)
        logger.info(f"Created synthetic dataset with {len(df)} samples")
        return df
    
    def _generate_suggestions_for_score(self, score: int, resume_text: str) -> List[Dict]:
        """Generate suggestions based on resume score and content"""
        suggestions = []
        
        if score < 60:
            suggestions.append({
                'type': 'content',
                'priority': 'high',
                'suggestion': 'Add more specific achievements with quantified results',
                'category': 'content_improvement'
            })
        
        if score < 70:
            suggestions.append({
                'type': 'structure',
                'priority': 'medium', 
                'suggestion': 'Include a professional summary section',
                'category': 'structure_improvement'
            })
        
        if 'email' not in resume_text.lower():
            suggestions.append({
                'type': 'contact',
                'priority': 'high',
                'suggestion': 'Add contact information including email address',
                'category': 'completeness'
            })
        
        return suggestions
    
    def load_real_resume_dataset(self, file_path: str) -> pd.DataFrame:
        """
        Load real resume dataset from CSV file
        """
        try:
            logger.info(f"Loading dataset from {file_path}")
            
            if file_path.endswith('.csv'):
                df = pd.read_csv(file_path)
            elif file_path.endswith('.json'):
                df = pd.read_json(file_path)
            else:
                raise ValueError("Unsupported file format. Use CSV or JSON.")
            
            logger.info(f"Loaded {len(df)} resume records")
            return df
            
        except Exception as e:
            logger.error(f"Error loading dataset: {e}")
            return pd.DataFrame()
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF file"""
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text.strip()
        except Exception as e:
            logger.error(f"Error extracting from PDF {pdf_path}: {e}")
            return ""
    
    def extract_text_from_docx(self, docx_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(docx_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting from DOCX {docx_path}: {e}")
            return ""
    
    def process_pdf_directory(self, pdf_dir: str) -> pd.DataFrame:
        """
        Process a directory of PDF resume files
        """
        pdf_dir = Path(pdf_dir)
        resume_data = []
        
        pdf_files = list(pdf_dir.glob("*.pdf"))
        logger.info(f"Processing {len(pdf_files)} PDF files...")
        
        for pdf_file in tqdm(pdf_files):
            text = self.extract_text_from_pdf(str(pdf_file))
            if text:
                resume_data.append({
                    'resume_id': pdf_file.stem,
                    'resume_text': text,
                    'file_path': str(pdf_file),
                    'word_count': len(text.split())
                })
        
        return pd.DataFrame(resume_data)
    
    def combine_datasets(self, datasets: List[pd.DataFrame]) -> pd.DataFrame:
        """
        Combine multiple resume datasets
        """
        logger.info(f"Combining {len(datasets)} datasets...")
        
        combined_df = pd.concat(datasets, ignore_index=True)
        
        # Remove duplicates based on resume text
        combined_df = combined_df.drop_duplicates(subset=['resume_text'], keep='first')
        
        logger.info(f"Combined dataset has {len(combined_df)} unique resumes")
        return combined_df
    
    def save_processed_data(self, df: pd.DataFrame, filename: str):
        """Save processed data to file"""
        save_path = self.processed_dir / filename
        
        if filename.endswith('.csv'):
            df.to_csv(save_path, index=False)
        elif filename.endswith('.json'):
            df.to_json(save_path, orient='records', indent=2)
        
        logger.info(f"Saved processed data to {save_path}")
    
    def create_training_dataset(self) -> pd.DataFrame:
        """
        Create complete training dataset by combining all sources
        """
        logger.info("Creating comprehensive training dataset...")
        
        datasets = []
        
        # 1. Create synthetic data
        synthetic_df = self.create_synthetic_dataset(num_samples=2000)
        datasets.append(synthetic_df)
        
        # 2. Load real datasets if available
        kaggle_file = self.raw_dir / "Resume.csv"
        if kaggle_file.exists():
            real_df = self.load_real_resume_dataset(str(kaggle_file))
            if not real_df.empty:
                # Add scores to real data (you might need to manually label these)
                real_df['quality_score'] = np.random.randint(40, 90, len(real_df))
                datasets.append(real_df)
        
        # 3. Combine all datasets
        if datasets:
            final_df = self.combine_datasets(datasets)
            
            # Save the training dataset
            self.save_processed_data(final_df, 'training_dataset.csv')
            
            return final_df
        
        return pd.DataFrame()

if __name__ == "__main__":
    # Example usage
    loader = ResumeDataLoader()
    
    # Create training dataset
    training_data = loader.create_training_dataset()
    print(f"Training dataset created with {len(training_data)} samples")
    print(training_data.head())
    