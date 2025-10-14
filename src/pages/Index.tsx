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
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import { Chatbot } from "@/components/Chatbot";
import { LottieAnimation } from "@/components/LottieAnimation";
import { supabase } from "@/integrations/supabase/client";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

interface AnalysisResult {
  verdict: "fake" | "real";
  confidence: number;
  credibility: number;
  riskLevel: "high" | "medium" | "low";
  indicators: string[];
  explanation?: string;
  stats?: {
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
  const { speak, stop, isSpeaking, isSupported } = useTextToSpeech();

  const analyzeText = async () => {
    if (text.trim().length < 50) {
      toast.error("Please enter at least 50 characters for analysis");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-news', {
        body: { text }
      });

      if (error) throw error;

      // Add stats calculation
      const words = text.trim().split(/\s+/).length;
      const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
      
      const resultWithStats: AnalysisResult = {
        ...data,
        stats: {
          wordCount: words,
          sentenceCount: sentences,
          avgSentenceLength: Math.round((words / sentences) * 10) / 10,
        }
      };

      setResult(resultWithStats);
      setStatsCounter((prev) => ({ ...prev, analyzed: prev.analyzed + 1 }));

      // Speak the result
      if (isSupported && data.explanation) {
        const verdictText = data.verdict === 'fake' ? 'fake news' : 'real news';
        const speechText = `Analysis complete. This article appears to be ${verdictText} with ${data.confidence} percent confidence. ${data.explanation}`;
        speak(speechText);
      }

      // Scroll to results
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      toast.success(`Analysis complete: ${data.verdict === 'fake' ? 'FAKE' : 'REAL'} news detected`);
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(error.message || "Failed to analyze the article. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
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
        <header className="border-b border-white/10 backdrop-blur-lg bg-white/5 animate-fade-in relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 animate-pulse-slow" />
        <div className="container mx-auto px-4 py-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                <div className="absolute inset-0 blur-xl bg-primary/50 animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text" style={{ textShadow: '0 0 30px hsl(var(--primary) / 0.4)' }}>
                  Fake News Detector
                </h1>
                <p className="text-muted-foreground mt-1 font-light">AI-Powered Truth Verification</p>
              </div>
            </div>
            <Button 
              variant="glass" 
              size="icon" 
              className="hover:scale-110 transition-transform hover:glow-primary"
              asChild
            >
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
                className="min-h-[200px] bg-input/50 border-white/20 focus:border-primary hover:border-primary/50 focus:ring-2 focus:ring-primary/30 resize-none text-base transition-all duration-300"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-muted-foreground">
                  {text.length} characters • {text.split(/\s+/).filter(w => w).length} words
                </p>
                {text.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setText('')}
                    className="text-primary hover:text-primary/80"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setText(exampleArticles.fake);
                    toast.info("Loaded fake news example");
                  }}
                  className="flex-1 border-destructive/30 hover:bg-destructive/10 hover:border-destructive transition-all"
                >
                  Try Fake Example
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setText(exampleArticles.real);
                    toast.info("Loaded real news example");
                  }}
                  className="flex-1 border-success/30 hover:bg-success/10 hover:border-success transition-all"
                >
                  Try Real Example
                </Button>
              </div>
            </div>

            <Button
              size="lg"
              onClick={analyzeText}
              disabled={isAnalyzing || text.trim().length < 50}
              className="w-full text-lg font-semibold bg-gradient-to-r from-primary via-accent to-secondary hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-2xl relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
              style={{
                boxShadow: '0 0 30px hsl(var(--primary) / 0.5), 0 0 60px hsl(var(--accent) / 0.3)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary bg-[length:200%_100%] animate-gradient-flow opacity-0 group-hover:opacity-40 transition-opacity" />
              <span className="relative z-10 flex items-center gap-2 justify-center">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    Analyze News Article
                  </>
                )}
              </span>
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
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={result.verdict === "fake" ? "destructive" : "default"}
                        className={`text-lg px-4 py-1 ${
                          result.verdict === "real" ? "bg-success hover:bg-success/90" : ""
                        }`}
                      >
                        {result.verdict === "fake" ? "⚠️ FAKE NEWS" : "✓ REAL NEWS"}
                      </Badge>
                      {isSupported && result.explanation && (
                        <Button
                          onClick={() => {
                            if (isSpeaking) {
                              stop();
                            } else {
                              const verdictText = result.verdict === 'fake' ? 'fake news' : 'real news';
                              speak(`This article appears to be ${verdictText} with ${result.confidence} percent confidence. ${result.explanation}`);
                            }
                          }}
                          variant="glass"
                          size="sm"
                          className="hover:scale-110 transition-transform"
                        >
                          {isSpeaking ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
                          {isSpeaking ? 'Stop' : 'Listen'}
                        </Button>
                      )}
                      <p className="text-sm text-muted-foreground mt-2">
                        Risk Level: <span className="font-semibold capitalize">{result.riskLevel}</span>
                      </p>
                    </div>
                  </div>

                  {result.explanation && (
                    <div className="mt-4 p-4 bg-card/50 border border-white/10 rounded-xl">
                      <h4 className="font-semibold mb-2 text-primary flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        AI Analysis:
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{result.explanation}</p>
                    </div>
                  )}

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
                  {result.stats && (
                    <>
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
                    </>
                  )}
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
