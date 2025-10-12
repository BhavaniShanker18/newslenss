"""
Fake News Detection - Complete ML Pipeline
TF-IDF + Word2Vec Hybrid Feature Extraction with Multiple Classifiers

Dataset: Zenodo (merged from Kaggle, McIntire, BuzzFeed, Reuters)
Label: 1 = Real, 0 = Fake

This script includes:
- Advanced text preprocessing (7 steps)
- Hybrid TF-IDF + Word2Vec feature extraction with GloVe
- Multiple ML classifiers with ensemble voting
- Complete evaluation metrics
- Model persistence
"""

import pandas as pd
import numpy as np
import re
import string
import pickle
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier, VotingClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    roc_curve
)
from sklearn.preprocessing import StandardScaler
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from nltk import pos_tag
import gensim.downloader as api
from scipy.sparse import hstack, csr_matrix
import warnings
warnings.filterwarnings('ignore')

nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)
nltk.download('averaged_perceptron_tagger', quiet=True)
nltk.download('punkt_tab', quiet=True)

class FakeNewsDetector:
    def __init__(self):
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 3),
            min_df=2,
            max_df=0.85,
            sublinear_tf=True
        )
        self.word2vec_model = None
        self.scaler = StandardScaler()
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        self.classifier = None

    def load_glove_embeddings(self):
        """Load pre-trained GloVe embeddings (Word2Vec compatible)"""
        print("Loading GloVe embeddings (this may take a few minutes)...")
        try:
            self.word2vec_model = api.load('glove-wiki-gigaword-100')
            print("GloVe embeddings loaded successfully!")
        except Exception as e:
            print(f"Error loading GloVe: {e}")
            print("Falling back to Word2Vec...")
            self.word2vec_model = api.load('word2vec-google-news-300')

    def preprocess_text(self, text):
        """
        7-Step Advanced Preprocessing Pipeline:
        1. Lowercase conversion
        2. Remove URLs, emails, mentions
        3. Remove special characters and numbers
        4. Tokenization
        5. Stop word removal
        6. POS tagging
        7. Lemmatization
        """
        if not isinstance(text, str):
            return ""

        text = text.lower()

        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        text = re.sub(r'\S+@\S+', '', text)
        text = re.sub(r'@\w+', '', text)

        text = re.sub(f'[{re.escape(string.punctuation)}]', ' ', text)
        text = re.sub(r'\d+', '', text)
        text = re.sub(r'\s+', ' ', text).strip()

        tokens = word_tokenize(text)

        tokens = [word for word in tokens if word not in self.stop_words and len(word) > 2]

        pos_tags = pos_tag(tokens)

        lemmatized = []
        for word, tag in pos_tags:
            pos = self._get_wordnet_pos(tag)
            if pos:
                lemmatized.append(self.lemmatizer.lemmatize(word, pos=pos))
            else:
                lemmatized.append(self.lemmatizer.lemmatize(word))

        return ' '.join(lemmatized)

    def _get_wordnet_pos(self, treebank_tag):
        """Convert POS tag to WordNet format"""
        from nltk.corpus import wordnet

        if treebank_tag.startswith('J'):
            return wordnet.ADJ
        elif treebank_tag.startswith('V'):
            return wordnet.VERB
        elif treebank_tag.startswith('N'):
            return wordnet.NOUN
        elif treebank_tag.startswith('R'):
            return wordnet.ADV
        else:
            return None

    def get_word2vec_features(self, texts):
        """Extract Word2Vec features from text"""
        features = []

        for text in texts:
            tokens = text.split()
            word_vectors = []

            for token in tokens:
                if token in self.word2vec_model:
                    word_vectors.append(self.word2vec_model[token])

            if word_vectors:
                features.append(np.mean(word_vectors, axis=0))
            else:
                features.append(np.zeros(self.word2vec_model.vector_size))

        return np.array(features)

    def extract_features(self, texts, fit=False):
        """
        Hybrid Feature Extraction: TF-IDF + Word2Vec
        """
        print("Extracting TF-IDF features...")
        if fit:
            tfidf_features = self.tfidf_vectorizer.fit_transform(texts)
        else:
            tfidf_features = self.tfidf_vectorizer.transform(texts)

        print("Extracting Word2Vec features...")
        w2v_features = self.get_word2vec_features(texts)

        w2v_features = self.scaler.fit_transform(w2v_features) if fit else self.scaler.transform(w2v_features)

        print("Combining features...")
        combined_features = hstack([tfidf_features, csr_matrix(w2v_features)])

        return combined_features

    def train(self, X_train, y_train):
        """
        Train ensemble classifier with multiple models
        """
        print("\nTraining ensemble classifier...")

        rf_clf = RandomForestClassifier(
            n_estimators=200,
            max_depth=30,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1,
            class_weight='balanced'
        )

        gb_clf = GradientBoostingClassifier(
            n_estimators=150,
            max_depth=10,
            learning_rate=0.1,
            random_state=42
        )

        lr_clf = LogisticRegression(
            max_iter=1000,
            random_state=42,
            class_weight='balanced',
            C=1.0
        )

        self.classifier = VotingClassifier(
            estimators=[
                ('rf', rf_clf),
                ('gb', gb_clf),
                ('lr', lr_clf)
            ],
            voting='soft',
            n_jobs=-1
        )

        print("Training Random Forest, Gradient Boosting, and Logistic Regression...")
        self.classifier.fit(X_train, y_train)
        print("Training complete!")

    def evaluate(self, X_test, y_test):
        """Complete model evaluation"""
        print("\n" + "="*50)
        print("MODEL EVALUATION")
        print("="*50)

        y_pred = self.classifier.predict(X_test)
        y_proba = self.classifier.predict_proba(X_test)[:, 1]

        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_proba)

        print(f"\nAccuracy:  {accuracy:.4f} ({accuracy*100:.2f}%)")
        print(f"Precision: {precision:.4f} ({precision*100:.2f}%)")
        print(f"Recall:    {recall:.4f} ({recall*100:.2f}%)")
        print(f"F1-Score:  {f1:.4f} ({f1*100:.2f}%)")
        print(f"ROC-AUC:   {roc_auc:.4f}")

        print("\n" + "-"*50)
        print("CONFUSION MATRIX")
        print("-"*50)
        cm = confusion_matrix(y_test, y_pred)
        print(f"True Negatives:  {cm[0, 0]:>6d} (Correctly identified fake)")
        print(f"False Positives: {cm[0, 1]:>6d} (Fake labeled as real)")
        print(f"False Negatives: {cm[1, 0]:>6d} (Real labeled as fake)")
        print(f"True Positives:  {cm[1, 1]:>6d} (Correctly identified real)")

        print("\n" + "-"*50)
        print("DETAILED CLASSIFICATION REPORT")
        print("-"*50)
        print(classification_report(y_test, y_pred, target_names=['Fake News', 'Real News']))

        return {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1': f1,
            'roc_auc': roc_auc
        }

    def predict(self, texts):
        """Predict on new texts"""
        processed_texts = [self.preprocess_text(text) for text in texts]
        features = self.extract_features(processed_texts, fit=False)
        predictions = self.classifier.predict(features)
        probabilities = self.classifier.predict_proba(features)
        return predictions, probabilities

    def save_model(self, filepath='fake_news_model.pkl'):
        """Save complete model pipeline"""
        model_data = {
            'tfidf_vectorizer': self.tfidf_vectorizer,
            'scaler': self.scaler,
            'classifier': self.classifier,
            'stop_words': self.stop_words
        }
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        print(f"\nModel saved to {filepath}")

    def load_model(self, filepath='fake_news_model.pkl'):
        """Load complete model pipeline"""
        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)

        self.tfidf_vectorizer = model_data['tfidf_vectorizer']
        self.scaler = model_data['scaler']
        self.classifier = model_data['classifier']
        self.stop_words = model_data['stop_words']
        print(f"Model loaded from {filepath}")


def load_dataset(filepath):
    """
    Load dataset from CSV
    Expected format: columns 'text' and 'label' (0=fake, 1=real)
    """
    print(f"Loading dataset from {filepath}...")
    df = pd.read_csv(filepath)

    if 'text' not in df.columns or 'label' not in df.columns:
        raise ValueError("Dataset must contain 'text' and 'label' columns")

    df = df.dropna(subset=['text', 'label'])

    print(f"Dataset loaded: {len(df)} samples")
    print(f"Real news: {sum(df['label'] == 1)} samples")
    print(f"Fake news: {sum(df['label'] == 0)} samples")

    return df


def main():
    """Main training pipeline"""
    print("="*70)
    print("FAKE NEWS DETECTION - COMPLETE TRAINING PIPELINE")
    print("TF-IDF + Word2Vec Hybrid Feature Extraction")
    print("="*70)

    dataset_path = 'fake_news_dataset.csv'

    try:
        df = load_dataset(dataset_path)
    except FileNotFoundError:
        print(f"\n❌ ERROR: Dataset file '{dataset_path}' not found!")
        print("\nPlease ensure your dataset CSV file has the following format:")
        print("  - Column 'text': Contains the news article text")
        print("  - Column 'label': Contains labels (0 = fake, 1 = real)")
        print("\nExample:")
        print("  text,label")
        print('  "Scientists discover miracle cure...",0')
        print('  "According to peer-reviewed study...",1')
        return

    detector = FakeNewsDetector()

    detector.load_glove_embeddings()

    print("\n" + "-"*70)
    print("PREPROCESSING TEXT DATA (7-step pipeline)")
    print("-"*70)
    texts = df['text'].values
    labels = df['label'].values

    processed_texts = []
    for i, text in enumerate(texts):
        if (i + 1) % 1000 == 0:
            print(f"Processed {i + 1}/{len(texts)} texts...")
        processed_texts.append(detector.preprocess_text(text))

    print(f"Preprocessing complete! Processed {len(processed_texts)} texts.")

    print("\n" + "-"*70)
    print("SPLITTING DATASET (80% train, 20% test)")
    print("-"*70)
    X_train_text, X_test_text, y_train, y_test = train_test_split(
        processed_texts, labels, test_size=0.2, random_state=42, stratify=labels
    )
    print(f"Training set: {len(X_train_text)} samples")
    print(f"Test set: {len(X_test_text)} samples")

    print("\n" + "-"*70)
    print("FEATURE EXTRACTION (TF-IDF + Word2Vec)")
    print("-"*70)
    X_train = detector.extract_features(X_train_text, fit=True)
    X_test = detector.extract_features(X_test_text, fit=False)

    print(f"Training features shape: {X_train.shape}")
    print(f"Test features shape: {X_test.shape}")

    detector.train(X_train, y_train)

    metrics = detector.evaluate(X_test, y_test)

    detector.save_model('fake_news_model_final.pkl')

    print("\n" + "="*70)
    print("TESTING WITH SAMPLE PREDICTIONS")
    print("="*70)

    test_samples = [
        "BREAKING: Scientists confirm 5G towers control minds! Anonymous whistleblower reveals shocking documents. Share before censored!",
        "According to a peer-reviewed study published in Nature Medicine, researchers at Stanford University have identified a potential biomarker for early detection of Alzheimer's disease."
    ]

    predictions, probabilities = detector.predict(test_samples)

    for i, text in enumerate(test_samples):
        label = "REAL NEWS" if predictions[i] == 1 else "FAKE NEWS"
        confidence = probabilities[i][predictions[i]] * 100
        print(f"\nSample {i+1}:")
        print(f"Text: {text[:100]}...")
        print(f"Prediction: {label}")
        print(f"Confidence: {confidence:.2f}%")

    print("\n" + "="*70)
    print("TRAINING COMPLETE! ✅")
    print("="*70)
    print("\n📊 Summary:")
    print(f"   Accuracy: {metrics['accuracy']*100:.2f}%")
    print(f"   Precision: {metrics['precision']*100:.2f}%")
    print(f"   Recall: {metrics['recall']*100:.2f}%")
    print(f"   F1-Score: {metrics['f1']*100:.2f}%")
    print(f"\n💾 Model saved as 'fake_news_model_final.pkl'")
    print("\n🚀 Ready for deployment!")


if __name__ == "__main__":
    main()
