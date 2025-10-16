export const translations = {
  en: {
    // Header
    appTitle: "NewsLens",
    tagline: "AI-Powered Fake News Detection",
    
    // Language & Theme
    language: "Language",
    theme: "Theme",
    darkMode: "Dark",
    lightMode: "Light",
    
    // Main Page
    pasteNews: "Paste news article here...",
    analyzeButton: "Analyze News Article",
    analyzing: "Analyzing with AI...",
    voiceInput: "Voice Input",
    listening: "Listening...",
    
    // Results
    credibilityScore: "Credibility Score",
    confidence: "confidence",
    aiExplanation: "AI Explanation",
    textStats: "Text Statistics",
    wordCount: "Word Count",
    charCount: "Character Count",
    avgWordLength: "Avg Word Length",
    
    // Verdicts
    fakeNews: "Fake News",
    realNews: "Real News",
    
    // Chatbot
    chatbotTitle: "AI Assistant",
    askQuestion: "Ask a question...",
    send: "Send",
    quickReplies: "Quick Replies",
    howItWorks: "How does this work?",
    spotFakeNews: "How to spot fake news?",
    accuracy: "How accurate is this?",
    
    // Errors
    minCharacters: "Please enter at least 50 characters for analysis",
    voiceNotSupported: "Voice input is not supported in your browser",
  },
  
  te: {
    // Header
    appTitle: "న్యూస్‌లెన్స్",
    tagline: "AI-శక్తితో నకిలీ వార్తల గుర్తింపు",
    
    // Language & Theme
    language: "భాష",
    theme: "థీమ్",
    darkMode: "చీకటి",
    lightMode: "వెలుగు",
    
    // Main Page
    pasteNews: "వార్తా కథనాన్ని ఇక్కడ అతికించండి...",
    analyzeButton: "వార్తా కథనాన్ని విశ్లేషించండి",
    analyzing: "AI తో విశ్లేషిస్తోంది...",
    voiceInput: "వాయిస్ ఇన్‌పుట్",
    listening: "వింటోంది...",
    
    // Results
    credibilityScore: "విశ్వసనీయత స్కోర్",
    confidence: "నమ్మకం",
    aiExplanation: "AI వివరణ",
    textStats: "టెక్స్ట్ గణాంకాలు",
    wordCount: "పదాల సంఖ్య",
    charCount: "అక్షరాల సంఖ్య",
    avgWordLength: "సగటు పదం పొడవు",
    
    // Verdicts
    fakeNews: "నకిలీ వార్తలు",
    realNews: "నిజమైన వార్తలు",
    
    // Chatbot
    chatbotTitle: "AI సహాయకుడు",
    askQuestion: "ఒక ప్రశ్న అడగండి...",
    send: "పంపండి",
    quickReplies: "త్వరిత సమాధానాలు",
    howItWorks: "ఇది ఎలా పనిచేస్తుంది?",
    spotFakeNews: "నకిలీ వార్తలను ఎలా గుర్తించాలి?",
    accuracy: "ఇది ఎంత ఖచ్చితమైనది?",
    
    // Errors
    minCharacters: "దయచేసి విశ్లేషణ కోసం కనీసం 50 అక్షరాలు నమోదు చేయండి",
    voiceNotSupported: "మీ బ్రౌజర్‌లో వాయిస్ ఇన్‌పుట్ మద్దతు లేదు",
  },
  
  hi: {
    // Header
    appTitle: "न्यूज़लेंस",
    tagline: "AI-संचालित फर्जी समाचार पहचान",
    
    // Language & Theme
    language: "भाषा",
    theme: "थीम",
    darkMode: "डार्क",
    lightMode: "लाइट",
    
    // Main Page
    pasteNews: "समाचार लेख यहाँ पेस्ट करें...",
    analyzeButton: "समाचार लेख का विश्लेषण करें",
    analyzing: "AI के साथ विश्लेषण कर रहा है...",
    voiceInput: "वॉयस इनपुट",
    listening: "सुन रहा है...",
    
    // Results
    credibilityScore: "विश्वसनीयता स्कोर",
    confidence: "आत्मविश्वास",
    aiExplanation: "AI व्याख्या",
    textStats: "टेक्स्ट आंकड़े",
    wordCount: "शब्द गणना",
    charCount: "वर्ण गणना",
    avgWordLength: "औसत शब्द लंबाई",
    
    // Verdicts
    fakeNews: "फर्जी समाचार",
    realNews: "असली समाचार",
    
    // Chatbot
    chatbotTitle: "AI सहायक",
    askQuestion: "एक प्रश्न पूछें...",
    send: "भेजें",
    quickReplies: "त्वरित उत्तर",
    howItWorks: "यह कैसे काम करता है?",
    spotFakeNews: "फर्जी समाचार कैसे पहचानें?",
    accuracy: "यह कितना सटीक है?",
    
    // Errors
    minCharacters: "कृपया विश्लेषण के लिए कम से कम 50 वर्ण दर्ज करें",
    voiceNotSupported: "आपके ब्राउज़र में वॉयस इनपुट समर्थित नहीं है",
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
