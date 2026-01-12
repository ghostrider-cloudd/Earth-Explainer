import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Leaf, TrendingDown, AlertTriangle, Sparkles, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CarbonResult, QuizAnswers, getImpactLevel, getSuggestions } from '@/lib/carbonEngine';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ResultsSectionProps {
  result: CarbonResult;
  answers: QuizAnswers;
  onRestart: () => void;
  apiKey: string;
}

const impactStyles = {
  low: { color: 'text-eco-leaf', bg: 'bg-eco-mint', label: 'Low Impact', icon: Leaf },
  medium: { color: 'text-eco-sky', bg: 'bg-eco-sky/10', label: 'Moderate Impact', icon: TrendingDown },
  high: { color: 'text-eco-coral', bg: 'bg-eco-coral/10', label: 'High Impact', icon: AlertTriangle },
  'very-high': { color: 'text-destructive', bg: 'bg-destructive/10', label: 'Very High Impact', icon: AlertTriangle },
};

export function ResultsSection({ result, answers, onRestart, apiKey }: ResultsSectionProps) {
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const impactLevel = getImpactLevel(result.total);
  const style = impactStyles[impactLevel];
  const ImpactIcon = style.icon;
  const suggestions = getSuggestions(answers, result);

  const chartData = {
    labels: result.breakdown.map((b) => b.category),
    datasets: [
      {
        data: result.breakdown.map((b) => b.value),
        backgroundColor: result.breakdown.map((b) => b.color),
        borderColor: result.breakdown.map((b) => b.color.replace(')', ', 0.8)')),
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: { size: 14, family: 'Plus Jakarta Sans' },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed;
            const percentage = result.breakdown[context.dataIndex].percentage;
            return `${value.toLocaleString()} kg CO₂ (${percentage}%)`;
          },
        },
      },
    },
  };

  useEffect(() => {
    if (apiKey) {
      fetchAIExplanation();
    }
  }, [apiKey]);

  const fetchAIExplanation = async () => {
    if (!apiKey) return;
    setIsLoadingAI(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an environmental expert. A user has completed a carbon footprint quiz. Their results:
- Total annual CO₂: ${result.total} kg
- Transport: ${result.transport} kg (${result.breakdown[0].percentage}%)
- Electricity: ${result.electricity} kg (${result.breakdown[1].percentage}%)  
- Food: ${result.food} kg (${result.breakdown[2].percentage}%)

The global average is ${result.comparison.globalAverage} kg/year. Their impact level is "${impactLevel}".

Write a friendly, encouraging 2-3 paragraph explanation of their results. Mention their biggest impact area and give 2-3 specific, actionable tips to reduce their footprint. Keep it conversational and positive, not preachy. Use emojis sparingly.`,
                  },
                ],
              },
            ],
          }),
        }
      );
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      setAiExplanation(text);
    } catch (error) {
      console.error('AI explanation error:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <section className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Your Carbon Footprint</h1>
          <p className="text-xl text-muted-foreground">Here's a breakdown of your annual emissions</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left column - Chart & Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Total card */}
            <div className="bg-card rounded-2xl p-8 shadow-card text-center">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${style.bg} ${style.color} mb-4`}>
                <ImpactIcon className="w-4 h-4" />
                <span className="font-medium">{style.label}</span>
              </div>
              <div className="text-6xl md:text-7xl font-bold text-gradient mb-2">
                {result.total.toLocaleString()}
              </div>
              <div className="text-lg text-muted-foreground">kg CO₂ per year</div>
            </div>

            {/* Chart */}
            <div className="bg-card rounded-2xl p-8 shadow-card">
              <h3 className="text-lg font-semibold mb-6 text-center">Emissions Breakdown</h3>
              <div className="max-w-xs mx-auto">
                <Pie data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Comparison */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <h3 className="text-lg font-semibold mb-4">How You Compare</h3>
              <div className="space-y-4">
                {[
                  { label: 'Your footprint', value: result.total, highlight: true },
                  { label: 'Global average', value: result.comparison.globalAverage },
                  { label: '2030 target', value: result.comparison.target2030 },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className={item.highlight ? 'font-semibold' : 'text-muted-foreground'}>
                          {item.label}
                        </span>
                        <span className={item.highlight ? 'font-semibold text-primary' : ''}>
                          {item.value.toLocaleString()} kg
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.highlight ? 'bg-gradient-hero' : 'bg-muted-foreground/30'
                          }`}
                          style={{ width: `${Math.min((item.value / 10000) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right column - AI & Suggestions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* AI Explanation */}
            <div className="bg-card rounded-2xl p-8 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-hero">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">AI Analysis</h3>
                  <p className="text-sm text-muted-foreground">Powered by Google Gemini</p>
                </div>
              </div>

              {!apiKey ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Add your Gemini API key to get personalized AI insights
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Get your free API key at{' '}
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Google AI Studio
                    </a>
                  </p>
                </div>
              ) : isLoadingAI ? (
                <div className="flex items-center justify-center py-8 gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-muted-foreground">Analyzing your results...</span>
                </div>
              ) : aiExplanation ? (
                <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed whitespace-pre-line">
                  {aiExplanation}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Button variant="outline" onClick={fetchAIExplanation}>
                    Generate AI Insights
                  </Button>
                </div>
              )}
            </div>

            {/* Suggestions */}
            <div className="bg-card rounded-2xl p-8 shadow-card">
              <h3 className="text-lg font-semibold mb-6">Ways to Reduce Your Impact</h3>
              <ul className="space-y-4">
                {suggestions.map((suggestion, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-1 w-6 h-6 rounded-full bg-eco-mint flex items-center justify-center flex-shrink-0">
                      <Leaf className="w-3 h-3 text-eco-forest" />
                    </div>
                    <span className="text-foreground/90">{suggestion}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Restart button */}
            <Button variant="eco-outline" size="lg" className="w-full" onClick={onRestart}>
              <RotateCcw className="w-4 h-4" />
              Take the Quiz Again
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
