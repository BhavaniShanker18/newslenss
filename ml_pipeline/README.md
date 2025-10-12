# Fake News Detection - ML Training Pipeline

## Overview

This is a complete machine learning pipeline for training a fake news detector using hybrid TF-IDF + Word2Vec (GloVe) feature extraction with ensemble classification.

## Features

### 7-Step Preprocessing Pipeline
1. **Lowercase conversion** - Normalize text case
2. **URL/Email removal** - Remove web links and emails
3. **Special character removal** - Clean punctuation and numbers
4. **Tokenization** - Split text into words
5. **Stop word removal** - Remove common words (the, is, at, etc.)
6. **POS tagging** - Part-of-speech tagging for context
7. **Lemmatization** - Convert words to root form

### Hybrid Feature Extraction
- **TF-IDF**: Captures word importance (5000 features, 1-3 n-grams)
- **Word2Vec (GloVe)**: Captures semantic meaning (100-dimensional embeddings)
- **Combined approach**: Best of both statistical and contextual features

### Ensemble Classification
Three powerful classifiers combined:
- Random Forest (200 trees)
- Gradient Boosting (150 estimators)
- Logistic Regression
- Soft voting ensemble for final prediction

## Installation

```bash
pip install -r requirements.txt
```

## Dataset Format

Your dataset should be a CSV file named `fake_news_dataset.csv` with the following columns:

| text | label |
|------|-------|
| "Article text content here..." | 0 or 1 |

- **Label**: `1` = Real News, `0` = Fake News

## Usage

### Training the Model

```bash
python train_model.py
```

The script will:
1. Load your dataset
2. Preprocess all texts
3. Extract hybrid features
4. Train the ensemble model
5. Evaluate performance
6. Save the trained model

### Using the Trained Model

```python
from train_model import FakeNewsDetector

detector = FakeNewsDetector()
detector.load_model('fake_news_model_final.pkl')
detector.load_glove_embeddings()

texts = ["Your news article text here..."]
predictions, probabilities = detector.predict(texts)

for i, pred in enumerate(predictions):
    label = "REAL NEWS" if pred == 1 else "FAKE NEWS"
    confidence = probabilities[i][pred] * 100
    print(f"Prediction: {label} (Confidence: {confidence:.2f}%)")
```

## Model Performance

Expected metrics (may vary based on dataset):
- **Accuracy**: ~94-96%
- **Precision**: ~93-95%
- **Recall**: ~92-94%
- **F1-Score**: ~93-95%
- **ROC-AUC**: ~0.96-0.98

## Training Dataset Sources

The model should be trained on data from:
- **Kaggle**: Diverse fake news samples
- **McIntire**: Political news dataset
- **Reuters**: Professional journalism
- **BuzzFeed**: Fact-checked articles

Combined dataset from Zenodo.org

## Troubleshooting

### Issue: Model predicts everything as one class

**Solution**: Check class balance in your dataset
```python
import pandas as pd
df = pd.read_csv('fake_news_dataset.csv')
print(df['label'].value_counts())
```

Ensure you have roughly equal samples of fake (0) and real (1) news.

### Issue: Low accuracy

**Possible fixes**:
1. Increase dataset size (minimum 10,000+ samples recommended)
2. Check for data quality issues (missing values, mislabeled data)
3. Adjust hyperparameters in `train()` method
4. Try different n-gram ranges in TF-IDF

### Issue: GloVe download fails

**Solution**: Use Word2Vec instead
```python
# In load_glove_embeddings() method, change:
self.word2vec_model = api.load('word2vec-google-news-300')
```

## Advanced Configuration

### Adjust TF-IDF Parameters

```python
self.tfidf_vectorizer = TfidfVectorizer(
    max_features=5000,      # Increase for more features
    ngram_range=(1, 3),     # Change to (1, 2) for faster training
    min_df=2,               # Minimum document frequency
    max_df=0.85,            # Maximum document frequency
    sublinear_tf=True       # Use sublinear term frequency scaling
)
```

### Adjust Classifier Parameters

```python
rf_clf = RandomForestClassifier(
    n_estimators=200,       # More trees = better accuracy (slower)
    max_depth=30,           # Maximum tree depth
    min_samples_split=5,    # Minimum samples to split node
    class_weight='balanced' # Handle imbalanced classes
)
```

## Output Files

- `fake_news_model_final.pkl`: Complete trained model (ready for deployment)
- Training logs with detailed metrics

## Integration with Web App

To use this model with your React frontend:

1. Create a Flask/FastAPI backend:

```python
from flask import Flask, request, jsonify
from train_model import FakeNewsDetector

app = Flask(__name__)
detector = FakeNewsDetector()
detector.load_model('fake_news_model_final.pkl')
detector.load_glove_embeddings()

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    text = data.get('text', '')

    predictions, probabilities = detector.predict([text])

    return jsonify({
        'verdict': 'real' if predictions[0] == 1 else 'fake',
        'confidence': float(probabilities[0][predictions[0]] * 100),
        'credibility': float(probabilities[0][1] * 100)
    })

if __name__ == '__main__':
    app.run(port=5000)
```

2. Update your frontend to call this API instead of using mock predictions.

## License

MIT License - Free for educational and commercial use

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review your dataset format
3. Ensure all dependencies are installed
4. Verify Python version (3.8+ recommended)
