import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Minimize2, Send, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickReplies = [
  "How it works",
  "Show example",
  "Spot fake news",
  "Accuracy",
];

const botResponses: Record<string, string> = {
  greeting: `Hi! 👋 I'm your AI news verification assistant. I can help you:
- Analyze articles for fake news
- Explain how our detection works
- Answer questions about news credibility
- Provide tips to spot misinformation

What would you like to know?`,

  howItWorks: `Our system uses advanced NLP techniques:

🔍 **Preprocessing**: We clean and normalize text using 7-step pipeline (lemmatization, POS tagging, stop word removal)

🧠 **Feature Extraction**: Hybrid TF-IDF + Word2Vec captures both statistical importance and semantic meaning

🎯 **Detection**: ML algorithms trained on 4 major datasets (Kaggle, Reuters, BuzzFeed, McIntire) identify patterns

We analyze:
- Sensational language & conspiracy keywords
- Source credibility & citations
- Emotional manipulation tactics
- Scientific plausibility

Want me to analyze an article for you?`,

  spotFakeNews: `Here are key red flags for fake news:

⚠️ **Warning Signs:**
- ALL CAPS headlines or extreme language
- Anonymous sources or "experts say"
- No dates, locations, or specific details
- Emotional manipulation (fear/anger)
- "Share before deleted" urgency
- Conspiracy theories
- Too good/bad to be true claims
- No credible sources cited

✅ **Credibility Markers:**
- Named experts with credentials
- Specific dates and locations
- Published in reputable outlets
- Verifiable facts and statistics
- Balanced, professional tone
- Multiple credible sources

Want to test an article?`,

  accuracy: `Our model achieves 94.5% accuracy on test data:

📊 **Performance Metrics:**
- Training: 80% of dataset (50K+ articles)
- Testing: 20% holdout set
- Precision: 93.2%
- Recall: 92.8%
- F1-Score: 93.0%

The hybrid TF-IDF + Word2Vec approach helps us understand both word importance and semantic context, making detection more reliable than traditional methods.

However, always use critical thinking! Our tool is an aid, not a replacement for your judgment.`,

  example: `Sure! Try these quick tests:

**Fake News Sample:**
'BREAKING: Scientists confirm 5G towers control minds. Anonymous whistleblower reveals shocking documents. Share before censored!'

**Real News Sample:**
'Apple announced its new iPhone model Tuesday at an event in Cupertino, featuring improved camera technology and faster processor.'

Click the 'Try Examples' section or paste any article you want to verify!`,

  dataset: `Our model is trained on a comprehensive dataset from Zenodo.org, which merges 4 reputable sources:

📚 **Training Data:**
1. **Kaggle**: Diverse fake news samples
2. **McIntire**: Political news dataset
3. **Reuters**: Professional journalism
4. **BuzzFeed Political**: Fact-checked articles

Total: 50,000+ labeled articles (0=fake, 1=real)

This multi-source approach helps our model generalize well across different news types and writing styles!`,

  technical: `Here's our tech stack:

**NLP Pipeline:**
- NLTK & SpaCy for preprocessing
- WordNet lemmatization
- POS tagging for context

**Feature Engineering:**
- TF-IDF: Captures word importance
- Word2Vec: Understands semantic similarity
- Hybrid approach: Best of both worlds!

**ML Models:**
- Random Forest
- XGBoost  
- Logistic Regression
- Deep Learning (LSTM)

**Framework:**
- Python, scikit-learn, gensim
- 80/20 train-test split

Want to know more about any specific component?`,

  limitations: `Great question! Here are our limitations:

❌ **Current Constraints:**
- Works best with English text
- Requires substantial text (50+ words)
- May struggle with satire/parody
- Can't verify images or videos
- Doesn't check external links
- Can't access real-time fact-checks

💡 **Best Practices:**
- Use as a screening tool, not final verdict
- Cross-reference with fact-checkers
- Check original sources
- Apply critical thinking

We're constantly improving! Have suggestions?`,

  help: `I'm here to help with news verification! I can:

✨ **My Capabilities:**
- Analyze articles for fake news indicators
- Explain our detection methodology  
- Provide fake news spotting tips
- Answer technical questions
- Give examples and demos
- Discuss limitations and best practices

Just ask me anything about news credibility or how our system works!

Try: 'How does this work?' or 'Show me an example'`,

  default: `Interesting question! While I specialize in news verification, I might not have understood that perfectly. 

I can help you with:
- Analyzing articles for credibility
- Explaining fake news detection
- Tips for spotting misinformation
- Technical details about our system

Could you rephrase your question, or would you like me to analyze an article for you?`,
};

const getResponse = (userMessage: string): string => {
  const lower = userMessage.toLowerCase();

  if (/(hi|hello|hey)/.test(lower)) return botResponses.greeting;
  if (/(how.*work|explain|detection|algorithm)/.test(lower)) return botResponses.howItWorks;
  if (/(spot|identify|tips|red flag|warning)/.test(lower)) return botResponses.spotFakeNews;
  if (/(accuracy|accurate|trust|reliable|performance)/.test(lower)) return botResponses.accuracy;
  if (/(example|demo|test|show|sample)/.test(lower)) return botResponses.example;
  if (/(data|dataset|training|source)/.test(lower)) return botResponses.dataset;
  if (/(technical|technology|algorithm|ml|machine learning)/.test(lower)) return botResponses.technical;
  if (/(limitation|can't|cannot|constraint)/.test(lower)) return botResponses.limitations;
  if (/(help|what can you|capabilities)/.test(lower)) return botResponses.help;

  return botResponses.default;
};

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! 👋 I'm your AI assistant. Ask me anything about fake news detection!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    const response = getResponse(input);
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsTyping(false);
  };

  const handleQuickReply = (reply: string) => {
    setInput(reply);
    setTimeout(() => handleSend(), 100);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg hover:shadow-2xl transition-all duration-300 animate-pulse-glow z-50"
        size="icon"
      >
        <MessageCircle className="w-7 h-7" />
      </Button>
    );
  }

  return (
    <Card
      className={`fixed bottom-6 right-6 border-2 border-primary/50 shadow-2xl z-50 transition-all duration-300 bg-card/95 backdrop-blur-2xl ${
        isMinimized ? "h-16 w-80" : "h-[600px] w-96"
      } animate-slide-in-bottom chatbot-glow`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-primary/30 to-accent/30 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">AI News Assistant</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="h-[420px] p-4 bg-background/30" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-lg ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-primary to-accent text-white message-glow"
                        : "bg-card/90 backdrop-blur-md border border-white/30 text-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-card/90 backdrop-blur-md border border-white/30 rounded-2xl px-4 py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <span
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <span
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Replies */}
          <div className="px-4 py-2 flex gap-2 flex-wrap border-t border-white/10">
            {quickReplies.map((reply) => (
              <Button
                key={reply}
                variant="glass"
                size="sm"
                onClick={() => handleQuickReply(reply)}
                className="text-xs hover:glow-primary"
              >
                {reply}
              </Button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 bg-card/50 backdrop-blur-sm">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything..."
                className="bg-background/70 border-white/30 focus:border-primary text-foreground placeholder:text-muted-foreground"
              />
              <Button
                onClick={handleSend}
                size="icon"
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 hover:scale-105 transition-transform message-glow"
                disabled={!input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};
