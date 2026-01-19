import os
import joblib
import fitz  # PyMuPDF
import nltk
import string
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

# Download stopwords
nltk.download('stopwords')
from nltk.corpus import stopwords

STOPWORDS = set(stopwords.words('english'))

# Load trained model and vectorizer (DON’T refit it!)
MODEL_PATH = 'models/resume_model.pkl'
VECTORIZER_PATH = 'models/vectorizer.pkl'

model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)

# Extract general keywords from high-scoring resumes using a fresh vectorizer
TRAINING_DATA_PATH = 'data/processed/training_dataa.csv'
HIGH_SCORE_THRESHOLD = 8

training_df = pd.read_csv(TRAINING_DATA_PATH)
high_quality_resumes = training_df[training_df['score'] >= HIGH_SCORE_THRESHOLD]['text'].tolist()

def preprocess(text):
    text = text.lower()
    text = text.translate(str.maketrans('', '', string.punctuation))
    tokens = text.split()
    tokens = [t for t in tokens if t not in STOPWORDS and t.isalpha()]
    return " ".join(tokens)

high_quality_processed = [preprocess(r) for r in high_quality_resumes]

# Use a separate temporary vectorizer to extract keywords
temp_vectorizer = TfidfVectorizer()
top_features_matrix = temp_vectorizer.fit_transform(high_quality_processed)
feature_names = temp_vectorizer.get_feature_names_out()
word_importance = np.asarray(top_features_matrix.sum(axis=0)).flatten()
important_words = [
    word for word, _ in sorted(zip(feature_names, word_importance), key=lambda x: -x[1])[:30]
]

# Extract text from PDF
def extract_text_from_pdf(pdf_path):
    text = ""
    doc = fitz.open(pdf_path)
    for page in doc:
        text += page.get_text()
    doc.close()
    return text

# Score resume using trained model (with original vectorizer)
def score_resume(text):
    processed = preprocess(text)
    features = vectorizer.transform([processed])
    score = model.predict(features)[0]
    return score, processed

# Suggest improvements
def suggest_improvements(processed_text):
    missing_keywords = [kw for kw in important_words if kw not in processed_text]
    if missing_keywords:
        return f"Consider adding: {', '.join(missing_keywords[:5])}"
    else:
        return "No major improvements needed."

# Main resume analysis function
def analyze_resume(file_path):
    text = extract_text_from_pdf(file_path)
    score, processed = score_resume(text)
    suggestions = suggest_improvements(processed)
    print(f"\n[+] Analyzed: {file_path}\nScore: {score:.2f}/10\nSuggestions: {suggestions}\n")

# Run for all PDFs in a directory
if __name__ == '__main__':
    resume_dir = 'data/raw/'
    for file in os.listdir(resume_dir):
        if file.endswith('.pdf'):
            analyze_resume(os.path.join(resume_dir, file))
