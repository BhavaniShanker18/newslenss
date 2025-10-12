"""
Example Usage: Fake News Detector
Quick demonstration of model usage after training
"""

from train_model import FakeNewsDetector

def main():
    print("="*70)
    print("FAKE NEWS DETECTOR - EXAMPLE USAGE")
    print("="*70)

    detector = FakeNewsDetector()

    print("\n1. Loading pre-trained model...")
    try:
        detector.load_model('fake_news_model_final.pkl')
        print("   ✅ Model loaded successfully!")
    except FileNotFoundError:
        print("   ❌ Model not found! Please train the model first:")
        print("   Run: python train_model.py")
        return

    print("\n2. Loading GloVe embeddings...")
    detector.load_glove_embeddings()
    print("   ✅ Embeddings loaded!")

    print("\n3. Testing with sample articles...")
    print("="*70)

    test_articles = [
        {
            "title": "Fake News Example",
            "text": "BREAKING NEWS: Scientists at an unnamed university discovered that drinking bleach cures all diseases! Big Pharma doesn't want you to know this secret. Anonymous whistleblower leaked classified documents proving the cover-up. Share this before it gets censored! They're trying to hide the truth from you!"
        },
        {
            "title": "Real News Example",
            "text": "According to a study published in the Journal of Medical Research on Tuesday, researchers at Stanford University have identified a new biomarker for early detection of cardiovascular disease. The peer-reviewed research, led by Dr. Sarah Johnson, analyzed data from 5,000 participants over a 3-year period. The findings were presented at the American Heart Association conference in Chicago."
        },
        {
            "title": "Borderline Example",
            "text": "Apple announced its quarterly earnings today, reporting revenue of $89.5 billion. CEO Tim Cook stated that iPhone sales exceeded expectations in the Asian market. The tech giant's stock rose 3.2% following the announcement. Analysts predict continued growth in the services sector."
        }
    ]

    for i, article in enumerate(test_articles, 1):
        print(f"\n{'-'*70}")
        print(f"ARTICLE {i}: {article['title']}")
        print(f"{'-'*70}")
        print(f"Text preview: {article['text'][:100]}...")

        predictions, probabilities = detector.predict([article['text']])

        verdict = "REAL NEWS" if predictions[0] == 1 else "FAKE NEWS"
        confidence = probabilities[0][predictions[0]] * 100
        credibility = probabilities[0][1] * 100

        fake_prob = probabilities[0][0] * 100
        real_prob = probabilities[0][1] * 100

        print(f"\n📊 ANALYSIS RESULTS:")
        print(f"   Verdict:     {verdict}")
        print(f"   Confidence:  {confidence:.2f}%")
        print(f"   Credibility: {credibility:.1f}%")
        print(f"\n   Detailed Scores:")
        print(f"   - Fake probability: {fake_prob:.2f}%")
        print(f"   - Real probability: {real_prob:.2f}%")

        if credibility < 40:
            risk = "HIGH RISK ⚠️"
        elif credibility < 70:
            risk = "MEDIUM RISK ⚡"
        else:
            risk = "LOW RISK ✅"
        print(f"   Risk Level:  {risk}")

    print("\n" + "="*70)
    print("BATCH PREDICTION EXAMPLE")
    print("="*70)

    batch_texts = [
        "SHOCKING: Government hides alien contact for 50 years!",
        "The Federal Reserve announced interest rate decision today.",
        "You won't believe what celebrities don't want you to know!",
        "Research team at MIT develops new battery technology."
    ]

    print("\nAnalyzing 4 articles simultaneously...")
    predictions, probabilities = detector.predict(batch_texts)

    print(f"\n{'Article':<60} {'Verdict':<12} {'Confidence'}")
    print("-"*85)

    for i, text in enumerate(batch_texts):
        verdict = "REAL" if predictions[i] == 1 else "FAKE"
        confidence = probabilities[i][predictions[i]] * 100
        preview = text[:55] + "..." if len(text) > 55 else text
        print(f"{preview:<60} {verdict:<12} {confidence:>5.1f}%")

    print("\n" + "="*70)
    print("INTERACTIVE MODE")
    print("="*70)
    print("Enter your own article to analyze (or 'quit' to exit)")

    while True:
        print("\n" + "-"*70)
        user_input = input("\nPaste article text (or 'quit'): ").strip()

        if user_input.lower() in ['quit', 'exit', 'q']:
            print("\n👋 Goodbye!")
            break

        if len(user_input) < 50:
            print("⚠️  Please enter at least 50 characters for accurate analysis.")
            continue

        predictions, probabilities = detector.predict([user_input])

        verdict = "REAL NEWS ✓" if predictions[0] == 1 else "FAKE NEWS ✗"
        confidence = probabilities[0][predictions[0]] * 100
        credibility = probabilities[0][1] * 100

        print(f"\n{'='*70}")
        print(f"VERDICT: {verdict}")
        print(f"{'='*70}")
        print(f"Confidence:  {confidence:.2f}%")
        print(f"Credibility: {credibility:.1f}%")
        print(f"{'='*70}")

    print("\n✅ Example usage complete!")


if __name__ == "__main__":
    main()
