import os
import re
import pandas as pd
import joblib
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

nltk.download('stopwords')
from nltk.corpus import stopwords

# ---------- Configuration ----------
MODEL_DIR = "models"
DATASET_PATH = "data/processed/training_dataa.csv"
# -----------------------------------

def clean_text(text):
    text = text.lower()
    text = re.sub(r"\W", " ", text)
    text = re.sub(r"\s+", " ", text)
    words = text.split()
    return " ".join([w for w in words if w not in stopwords.words("english")])

def extract_top_keywords(vectorizer, X, texts, top_n=5):
    print("\n[*] Top keywords per resume:")
    feature_names = vectorizer.get_feature_names_out()
    for i in range(X.shape[0]):
        row = X[i].toarray()[0]
        top_indices = row.argsort()[-top_n:][::-1]
        top_keywords = [feature_names[idx] for idx in top_indices if row[idx] > 0]
        print(f"Resume {i+1}: {', '.join(top_keywords)}")

def train_model(df):
    print("[*] Training model...")

    vectorizer = TfidfVectorizer(max_features=300)
    X = vectorizer.fit_transform(df["text"])
    y = df["score"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

    model = RandomForestRegressor()
    model.fit(X_train, y_train)

    joblib.dump(model, os.path.join(MODEL_DIR, "resume_model.pkl"))
    joblib.dump(vectorizer, os.path.join(MODEL_DIR, "vectorizer.pkl"))

    print("[✓] Model saved in 'models/' folder.")
    print(f"Train Score: {model.score(X_train, y_train):.2f}")
    print(f"Test Score: {model.score(X_test, y_test):.2f}")

    extract_top_keywords(vectorizer, X, df["text"])

if __name__ == "__main__":
    os.makedirs(MODEL_DIR, exist_ok=True)
    os.makedirs("data/processed", exist_ok=True)

    if not os.path.exists(DATASET_PATH):
        print(f"[!] Training data not found at {DATASET_PATH}")
    else:
        df = pd.read_csv(DATASET_PATH)
        if "text" not in df.columns or "score" not in df.columns:
            print("[!] CSV must contain 'text' and 'score' columns.")
        else:
            train_model(df)
