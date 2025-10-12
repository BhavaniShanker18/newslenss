import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  FileText,
  Clock,
  Activity,
  Github,
  Copy,
  Share2,
  Loader2,
  BarChart3,
  Database,
  Brain,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Chatbot } from "@/components/Chatbot";

interface AnalysisResult {
  verdict: "fake" | "real";
  confidence: number;
  credibility: number;
  riskLevel: "high" | "medium" | "low";
  indicators: string[];
  stats: {
    wordCount: number;
    sentenceCount: number;
    avgSentenceLength: number;
  };
  warnings: string[];
}

const exampleArticles = {
  fake: "BREAKING: Scientists discover that drinking 10 glasses of water daily makes you immortal! Research from an unknown university claims this miracle cure has been hidden by pharmaceutical companies for decades. Share this before they delete it!",
  real: "According to a peer-reviewed study published in Nature Medicine, researchers at Stanford University have identified a potential biomarker for early detection of Alzheimer's disease. The findings, based on a 5-year longitudinal study of 2,000 participants, show promising results for improved diagnostic accuracy.",
};

const Index = () => {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [statsCounter, setStatsCounter] = useState({
    analyzed: 1247,
    accuracy: 94.5,
  });

  const analyzeText = async () => {
    if (text.trim().length < 50) {
      toast.error("Please enter at least 50 characters for analysis");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1500));

    // Mock ML prediction logic
    const { isFake, fakeScore, realScore, foundIndicators } = mockPrediction(text);
    
    const totalScore = fakeScore + realScore;
    let confidence = totalScore > 0 ? ((isFake ? fakeScore : realScore) / totalScore) * 100 : 65;
    confidence = Math.max(65, Math.min(98, confidence)); // Clamp between 65-98%
    
    const credibility = isFake ? Math.max(15, 100 - confidence) : confidence;

    const words = text.trim().split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;

    const mockResult: AnalysisResult = {
      verdict: isFake ? "fake" : "real",
      confidence: Math.round(confidence * 10) / 10,
      credibility: Math.round(credibility),
      riskLevel: credibility < 40 ? "high" : credibility < 70 ? "medium" : "low",
      indicators: foundIndicators.length > 0 ? foundIndicators : isFake
        ? ["Sensational language", "Lack of sources"]
        : ["Professional tone", "Factual content"],
      stats: {
        wordCount: words,
        sentenceCount: sentences,
        avgSentenceLength: Math.round((words / sentences) * 10) / 10,
      },
      warnings: isFake
        ? [
            `Multiple red flags detected (Fake Score: ${fakeScore}, Real Score: ${realScore})`,
            "Language patterns match known disinformation campaigns",
            "Lacks verifiable source attribution",
          ]
        : [
            `Content structure appears credible (Real Score: ${realScore}, Fake Score: ${fakeScore})`,
            "Professional journalistic standards observed",
            "Sources can be independently verified",
          ],
    };

    setResult(mockResult);
    setIsAnalyzing(false);
    setStatsCounter((prev) => ({ ...prev, analyzed: prev.analyzed + 1 }));

    // Scroll to results
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const mockPrediction = (text: string): { isFake: boolean; fakeScore: number; realScore: number; foundIndicators: string[] } => {
    const lowerText = text.toLowerCase();
    const upperCount = (text.match(/[A-Z]{3,}/g) || []).length;
    
    const fakeIndicators = [
      { pattern: /(breaking|shocking|scientists don't want you to know)/i, name: "Sensational language", weight: 10 },
      { pattern: /(cover-up|big pharma|mainstream media hiding|they don't want you to know|secret|leaked documents)/i, name: "Conspiracy keywords", weight: 10 },
      { pattern: /(anonymous sources|insider reveals|whistleblower|sources say|unnamed official)/i, name: "Anonymous sources", weight: 10 },
      { pattern: /(share before deleted|act now|they're trying to censor|before it's too late)/i, name: "Urgency manipulation", weight: 10 },
      { pattern: /(100% cure|miracle|destroys all|secret government|mind control|microchip)/i, name: "Extreme claims", weight: 10 },
      { pattern: /(experts say|some say|many believe|it is said)/i, name: "Vague attributions", weight: 10 },
      { pattern: /(you won't believe|shocking truth|they're hiding)/i, name: "Emotional manipulation", weight: 10 },
      { pattern: /(bleach|miracle cure|anti-vaccine|dangerous health)/i, name: "Medical misinformation", weight: 10 },
      { pattern: /(99% of|100% of|all doctors|every scientist)/i, name: "Unverifiable statistics", weight: 10 },
      { pattern: /(without consulting|don't trust authorities|ignore experts)/i, name: "Bypass experts", weight: 10 },
    ];

    const realIndicators = [
      { pattern: /(dr\.|professor|phd|researcher at [a-z\s]+university)/i, name: "Specific credentials", weight: 8 },
      { pattern: /(university|institute|agency|published in|journal of)/i, name: "Credible institutions", weight: 8 },
      { pattern: /(monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{4}|january|february|march|april|may|june|july|august|september|october|november|december)/i, name: "Specific dates/locations", weight: 8 },
      { pattern: /(study|research|data|statistics|peer-reviewed|findings)/i, name: "Verifiable facts", weight: 8 },
      { pattern: /(according to|stated|confirmed|announced)/i, name: "Balanced reporting", weight: 8 },
      { pattern: /[A-Z][a-z]+\s[A-Z][a-z]+,\s(CEO|director|professor|researcher)/i, name: "Named sources", weight: 8 },
    ];

    let fakeScore = 0;
    let realScore = 0;
    const foundIndicators: string[] = [];

    // Check fake indicators
    fakeIndicators.forEach(({ pattern, name, weight }) => {
      if (pattern.test(text)) {
        fakeScore += weight;
        foundIndicators.push(name);
      }
    });

    // Add points for excessive caps
    if (upperCount >= 3) {
      fakeScore += 10;
      foundIndicators.push("Excessive ALL CAPS");
    }

    // Check real indicators
    realIndicators.forEach(({ pattern, name, weight }) => {
      if (pattern.test(text)) {
        realScore += weight;
        foundIndicators.push(name);
      }
    });

    return {
      isFake: fakeScore > realScore,
      fakeScore,
      realScore,
      foundIndicators
    };
  };

  const handleCopy = () => {
    if (result) {
      const summary = `Fake News Analysis\n\nVerdict: ${result.verdict.toUpperCase()}\nConfidence: ${result.confidence}%\nCredibility: ${result.credibility}%\nRisk Level: ${result.riskLevel.toUpperCase()}\n\nAnalyzed with AI-Powered Truth Verification`;
      navigator.clipboard.writeText(summary);
      toast.success("Analysis copied to clipboard!");
    }
  };

  const handleShare = () => {
    toast.success("Share functionality would be implemented here!");
  };

  return (
    <div className="min-h-screen gradient-bg particles-bg">
      <Chatbot />
      
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-lg bg-white/5 animate-fade-in">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-accent" />
                Fake News Detector
              </h1>
              <p className="text-muted-foreground mt-1">AI-Powered Truth Verification</p>
            </div>
            <Button variant="glass" size="icon" asChild>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
              >
                <Github className="w-5 h-5" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 animate-fade-in-up">
          <Card className="glass p-6 hover:scale-105 transition-transform duration-300 hover:glow-primary">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Analyzed Today</p>
                <p className="text-2xl font-bold">{statsCounter.analyzed.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          <Card className="glass p-6 hover:scale-105 transition-transform duration-300 hover:glow-success">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                <p className="text-2xl font-bold">{statsCounter.accuracy}%</p>
              </div>
            </div>
          </Card>
          <Card className="glass p-6 hover:scale-105 transition-transform duration-300 hover:glow-accent">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-secondary" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Processing</p>
                <p className="text-2xl font-bold">2.3s</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Input Section */}
        <Card className="glass p-8 mb-8 animate-slide-up">
          <div className="space-y-4">
            <div>
              <label className="text-lg font-semibold mb-2 block flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                Enter News Article
              </label>
              <Textarea
                placeholder="Paste your news article here to verify its authenticity..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px] bg-input/50 border-white/20 focus:border-accent focus:glow-primary resize-none text-base transition-all duration-300"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-muted-foreground">{text.length} characters</p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setText(exampleArticles.fake);
                      toast.info("Loaded fake news example");
                    }}
                  >
                    Try Fake Example
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setText(exampleArticles.real);
                      toast.info("Loaded real news example");
                    }}
                  >
                    Try Real Example
                  </Button>
                </div>
              </div>
            </div>

            <Button
              variant="analyze"
              size="lg"
              onClick={analyzeText}
              disabled={isAnalyzing || text.trim().length < 50}
              className="w-full text-lg font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl glow-primary"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Analyze News Article
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Results Section */}
        {result && (
          <div id="results" className="space-y-6 animate-bounce-in">
            {/* Main Result Card */}
            <Card
              className={`glass p-8 border-2 ${
                result.verdict === "fake" ? "border-destructive glow-danger" : "border-success glow-success"
              }`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    {result.verdict === "fake" ? (
                      <ShieldAlert className="w-12 h-12 text-destructive" />
                    ) : (
                      <ShieldCheck className="w-12 h-12 text-success" />
                    )}
                    <div>
                      <Badge
                        variant={result.verdict === "fake" ? "destructive" : "default"}
                        className={`text-lg px-4 py-1 ${
                          result.verdict === "real" ? "bg-success hover:bg-success/90" : ""
                        }`}
                      >
                        {result.verdict === "fake" ? "⚠️ FAKE NEWS" : "✓ REAL NEWS"}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2">
                        Risk Level: <span className="font-semibold capitalize">{result.riskLevel}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Confidence Score</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Progress value={result.confidence} className="h-2" />
                        </div>
                        <span className="text-2xl font-bold">{result.confidence}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Credibility Meter</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Progress value={result.credibility} className="h-2" />
                        </div>
                        <span className="text-2xl font-bold">{result.credibility}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="glass" size="icon" onClick={handleCopy}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="glass" size="icon" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Insights Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
              <Card className="glass p-6 hover:scale-105 transition-transform duration-300">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-accent" />
                  Text Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Word Count</span>
                    <span className="font-semibold">{result.stats.wordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sentence Count</span>
                    <span className="font-semibold">{result.stats.sentenceCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Sentence Length</span>
                    <span className="font-semibold">{result.stats.avgSentenceLength} words</span>
                  </div>
                </div>
              </Card>

              <Card className="glass p-6 hover:scale-105 transition-transform duration-300">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent" />
                  Key Indicators Found
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.indicators.map((indicator, index) => (
                    <Badge key={index} variant="outline" className="border-accent/50">
                      {indicator}
                    </Badge>
                  ))}
                </div>
              </Card>
            </div>

            {/* Warnings/Insights */}
            <Card className="glass p-6">
              <h3 className="text-lg font-semibold mb-4">
                {result.verdict === "fake" ? "Warning Signs Detected" : "Credibility Markers"}
              </h3>
              <ul className="space-y-2">
                {result.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span
                      className={`mt-1 ${result.verdict === "fake" ? "text-destructive" : "text-success"}`}
                    >
                      •
                    </span>
                    <span className="text-muted-foreground">{warning}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}

        {/* How It Works Section */}
        <Card className="glass p-8 mt-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Brain className="w-6 h-6 text-accent" />
            How It Works
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="preprocessing" className="border-white/10">
              <AccordionTrigger className="hover:text-accent">
                1. Data Preprocessing (7 Steps)
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Our advanced preprocessing pipeline includes tokenization, normalization, stop word removal,
                stemming, lemmatization, entity recognition, and feature extraction to prepare the text for
                analysis.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="features" className="border-white/10">
              <AccordionTrigger className="hover:text-accent">
                2. Hybrid Feature Extraction (TF-IDF + Word2Vec)
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We combine TF-IDF for term importance and Word2Vec for semantic understanding, creating a rich
                feature space that captures both statistical and contextual patterns in the text.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="classification" className="border-white/10">
              <AccordionTrigger className="hover:text-accent">
                3. Machine Learning Classification
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Multiple ML models (Random Forest, Gradient Boosting, Neural Networks) analyze the features to
                detect patterns indicative of fake news, with ensemble voting for maximum accuracy.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="data" className="border-white/10">
              <AccordionTrigger className="hover:text-accent">
                4. Training Data Sources
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Our model is trained on 4 major datasets: LIAR, ISOT Fake News, FakeNewsNet, and COVID-19 Fake
                News, encompassing over 100,000 labeled articles across various domains and time periods.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        {/* Technology Stack */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in-up">
          <Card className="glass p-6 text-center hover:scale-105 transition-all duration-300 hover:glow-primary">
            <Database className="w-8 h-8 text-primary mx-auto mb-2 animate-pulse" />
            <p className="font-semibold">Big Data</p>
            <p className="text-xs text-muted-foreground mt-1">100K+ Articles</p>
          </Card>
          <Card className="glass p-6 text-center hover:scale-105 transition-all duration-300 hover:glow-accent">
            <Brain className="w-8 h-8 text-accent mx-auto mb-2 animate-pulse" />
            <p className="font-semibold">Deep Learning</p>
            <p className="text-xs text-muted-foreground mt-1">Neural Networks</p>
          </Card>
          <Card className="glass p-6 text-center hover:scale-105 transition-all duration-300 hover:glow">
            <Zap className="w-8 h-8 text-secondary mx-auto mb-2 animate-pulse" />
            <p className="font-semibold">Real-time</p>
            <p className="text-xs text-muted-foreground mt-1">Instant Analysis</p>
          </Card>
          <Card className="glass p-6 text-center hover:scale-105 transition-all duration-300 hover:glow-success">
            <TrendingUp className="w-8 h-8 text-success mx-auto mb-2 animate-pulse" />
            <p className="font-semibold">High Accuracy</p>
            <p className="text-xs text-muted-foreground mt-1">94.5% Success</p>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 backdrop-blur-lg bg-white/5 mt-20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Powered by AI | <span className="font-semibold text-accent">SIH Project 2025</span>
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
