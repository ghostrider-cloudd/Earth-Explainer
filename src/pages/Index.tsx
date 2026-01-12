import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { HeroSection } from '@/components/HeroSection';
import { QuizSection } from '@/components/QuizSection';
import { ResultsSection } from '@/components/ResultsSection';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { QuizAnswers, CarbonResult, calculateCarbonFootprint } from '@/lib/carbonEngine';

type AppState = 'hero' | 'quiz' | 'results';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('hero');
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers | null>(null);
  const [result, setResult] = useState<CarbonResult | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiModal, setShowApiModal] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleStartQuiz = () => {
    setAppState('quiz');
  };

  const handleQuizComplete = (answers: QuizAnswers) => {
    setQuizAnswers(answers);
    const calculatedResult = calculateCarbonFootprint(answers);
    setResult(calculatedResult);
    setAppState('results');
  };

  const handleRestart = () => {
    setQuizAnswers(null);
    setResult(null);
    setAppState('hero');
  };

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Settings button */}
      <button
        onClick={() => setShowApiModal(true)}
        className="fixed top-4 right-4 z-40 p-3 rounded-xl bg-card shadow-card hover:shadow-lg transition-all"
        title="API Settings"
      >
        <Settings className="w-5 h-5 text-muted-foreground" />
      </button>

      {/* Main content */}
      {appState === 'hero' && <HeroSection onStartQuiz={handleStartQuiz} />}
      
      {appState === 'quiz' && (
        <QuizSection
          onComplete={handleQuizComplete}
          onBack={() => setAppState('hero')}
        />
      )}
      
      {appState === 'results' && result && quizAnswers && (
        <ResultsSection
          result={result}
          answers={quizAnswers}
          onRestart={handleRestart}
          apiKey={apiKey}
        />
      )}

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
        onSubmit={handleApiKeySubmit}
        currentKey={apiKey}
      />
    </div>
  );
};

export default Index;
