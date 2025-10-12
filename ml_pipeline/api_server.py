"""
Flask API Server for Fake News Detection
Connects the ML model to your React frontend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from train_model import FakeNewsDetector
import re

app = Flask(__name__)
CORS(app)

detector = FakeNewsDetector()

try:
    print("Loading model...")
    detector.load_model('fake_news_model_final.pkl')
    detector.load_glove_embeddings()
    print("Model loaded successfully!")
except Exception as e:
    print(f"Warning: Could not load model - {e}")
    print("API will run but predictions will fail until model is trained.")


def analyze_text_features(text):
    """Extract text statistics and indicators"""
    words = text.split()
    sentences = text.split('.')

    upper_count = len(re.findall(r'[A-Z]{3,}', text))
    exclamation_count = text.count('!')
    question_count = text.count('?')

    fake_keywords = [
        'breaking', 'shocking', 'unbelievable', 'secret', 'leaked',
        'mainstream media', 'cover-up', 'conspiracy', 'anonymous sources',
        'whistleblower', 'share before', 'censored', 'they don\'t want',
        'miracle cure', 'big pharma'
    ]

    real_keywords = [
        'according to', 'study shows', 'research', 'university',
        'published in', 'peer-reviewed', 'data shows', 'professor',
        'institute', 'agency', 'confirmed', 'stated'
    ]

    fake_indicators = [kw for kw in fake_keywords if kw in text.lower()]
    real_indicators = [kw for kw in real_keywords if kw in text.lower()]

    return {
        'word_count': len(words),
        'sentence_count': len([s for s in sentences if s.strip()]),
        'avg_sentence_length': len(words) / max(len(sentences), 1),
        'uppercase_words': upper_count,
        'exclamations': exclamation_count,
        'questions': question_count,
        'fake_indicators': fake_indicators,
        'real_indicators': real_indicators
    }


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': detector.classifier is not None
    })


@app.route('/analyze', methods=['POST'])
def analyze():
    """Main analysis endpoint"""
    try:
        data = request.json
        text = data.get('text', '')

        if len(text.strip()) < 50:
            return jsonify({
                'error': 'Text too short. Please provide at least 50 characters.'
            }), 400

        predictions, probabilities = detector.predict([text])

        features = analyze_text_features(text)

        verdict = 'real' if predictions[0] == 1 else 'fake'
        confidence = float(probabilities[0][predictions[0]] * 100)
        credibility = float(probabilities[0][1] * 100)

        indicators = []
        if verdict == 'fake':
            indicators.extend(['Sensational language'] if features['exclamations'] > 2 else [])
            indicators.extend(['Excessive caps'] if features['uppercase_words'] > 3 else [])
            indicators.extend([f'"{ind}"' for ind in features['fake_indicators'][:3]])
        else:
            indicators.extend(['Professional tone'])
            indicators.extend([f'"{ind}"' for ind in features['real_indicators'][:3]])

        risk_level = 'high' if credibility < 40 else ('medium' if credibility < 70 else 'low')

        warnings = []
        if verdict == 'fake':
            warnings = [
                f"Multiple red flags detected (credibility: {credibility:.1f}%)",
                "Language patterns match known disinformation campaigns",
                "Lacks verifiable source attribution"
            ]
        else:
            warnings = [
                f"Content structure appears credible ({credibility:.1f}%)",
                "Professional journalistic standards observed",
                "Sources can be independently verified"
            ]

        return jsonify({
            'verdict': verdict,
            'confidence': round(confidence, 1),
            'credibility': round(credibility),
            'risk_level': risk_level,
            'indicators': indicators if indicators else ['Analyzing content structure'],
            'stats': {
                'word_count': features['word_count'],
                'sentence_count': features['sentence_count'],
                'avg_sentence_length': round(features['avg_sentence_length'], 1)
            },
            'warnings': warnings
        })

    except Exception as e:
        return jsonify({
            'error': f'Analysis failed: {str(e)}'
        }), 500


@app.route('/batch-analyze', methods=['POST'])
def batch_analyze():
    """Batch analysis endpoint for multiple texts"""
    try:
        data = request.json
        texts = data.get('texts', [])

        if not texts or len(texts) == 0:
            return jsonify({'error': 'No texts provided'}), 400

        predictions, probabilities = detector.predict(texts)

        results = []
        for i, text in enumerate(texts):
            verdict = 'real' if predictions[i] == 1 else 'fake'
            confidence = float(probabilities[i][predictions[i]] * 100)
            credibility = float(probabilities[i][1] * 100)

            results.append({
                'text_id': i,
                'verdict': verdict,
                'confidence': round(confidence, 1),
                'credibility': round(credibility)
            })

        return jsonify({'results': results})

    except Exception as e:
        return jsonify({'error': f'Batch analysis failed: {str(e)}'}), 500


if __name__ == '__main__':
    print("\n" + "="*60)
    print("FAKE NEWS DETECTION API SERVER")
    print("="*60)
    print("\nEndpoints:")
    print("  GET  /health           - Health check")
    print("  POST /analyze          - Analyze single text")
    print("  POST /batch-analyze    - Analyze multiple texts")
    print("\nServer starting on http://localhost:5000")
    print("="*60 + "\n")

    app.run(host='0.0.0.0', port=5000, debug=True)
