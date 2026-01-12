import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Zap, UtensilsCrossed, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuizAnswers } from '@/lib/carbonEngine';

interface QuizSectionProps {
  onComplete: (answers: QuizAnswers) => void;
  onBack: () => void;
}

type Step = 'transport' | 'electricity' | 'food';

const steps: Step[] = ['transport', 'electricity', 'food'];

const stepInfo = {
  transport: { icon: Car, title: 'Transportation', color: 'text-eco-sky' },
  electricity: { icon: Zap, title: 'Energy & Home', color: 'text-eco-earth' },
  food: { icon: UtensilsCrossed, title: 'Food & Diet', color: 'text-eco-leaf' },
};

export function QuizSection({ onComplete, onBack }: QuizSectionProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({
    carType: 'petrol',
    carKmPerWeek: 100,
    flightsPerYear: '1-2',
    publicTransport: 'weekly',
    homeSize: 'medium',
    renewableEnergy: false,
    energyEfficiency: 'medium',
    diet: 'flexitarian',
    localFood: 'sometimes',
    foodWaste: 'some',
  });

  const step = steps[currentStep];
  const StepIcon = stepInfo[step].icon;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete(answers as QuizAnswers);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onBack();
    }
  };

  const updateAnswer = <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-3xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <button
              onClick={handlePrev}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-hero rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-4 mb-12">
          {steps.map((s, i) => {
            const Icon = stepInfo[s].icon;
            const isActive = i === currentStep;
            const isComplete = i < currentStep;
            return (
              <div
                key={s}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : isComplete
                    ? 'bg-eco-mint text-eco-forest'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">{stepInfo[s].title}</span>
              </div>
            );
          })}
        </div>

        {/* Question cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-card rounded-2xl p-8 shadow-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-xl bg-muted ${stepInfo[step].color}`}>
                <StepIcon className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">{stepInfo[step].title}</h2>
            </div>

            {step === 'transport' && (
              <TransportQuestions answers={answers} updateAnswer={updateAnswer} />
            )}
            {step === 'electricity' && (
              <ElectricityQuestions answers={answers} updateAnswer={updateAnswer} />
            )}
            {step === 'food' && (
              <FoodQuestions answers={answers} updateAnswer={updateAnswer} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-end mt-8">
          <Button variant="hero" size="lg" onClick={handleNext} className="group">
            {currentStep === steps.length - 1 ? 'Calculate My Footprint' : 'Continue'}
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
}

interface QuestionProps {
  answers: Partial<QuizAnswers>;
  updateAnswer: <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => void;
}

function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border-2 text-left transition-all ${
        selected
          ? 'border-primary bg-primary/5 text-foreground'
          : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}

function TransportQuestions({ answers, updateAnswer }: QuestionProps) {
  return (
    <div className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          What type of car do you drive?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(['none', 'electric', 'hybrid', 'petrol', 'diesel'] as const).map((type) => (
            <OptionButton
              key={type}
              selected={answers.carType === type}
              onClick={() => updateAnswer('carType', type)}
            >
              <span className="capitalize">{type === 'none' ? "I don't drive" : type}</span>
            </OptionButton>
          ))}
        </div>
      </div>

      {answers.carType !== 'none' && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            How many kilometers do you drive per week?
          </label>
          <input
            type="range"
            min="0"
            max="500"
            step="10"
            value={answers.carKmPerWeek || 100}
            onChange={(e) => updateAnswer('carKmPerWeek', Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>0 km</span>
            <span className="font-medium text-foreground">{answers.carKmPerWeek} km</span>
            <span>500 km</span>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          How many flights do you take per year?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['none', '1-2', '3-5', '6+'] as const).map((flights) => (
            <OptionButton
              key={flights}
              selected={answers.flightsPerYear === flights}
              onClick={() => updateAnswer('flightsPerYear', flights)}
            >
              {flights === 'none' ? 'None' : `${flights} flights`}
            </OptionButton>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          How often do you use public transport?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['daily', 'weekly', 'rarely', 'never'] as const).map((freq) => (
            <OptionButton
              key={freq}
              selected={answers.publicTransport === freq}
              onClick={() => updateAnswer('publicTransport', freq)}
            >
              <span className="capitalize">{freq}</span>
            </OptionButton>
          ))}
        </div>
      </div>
    </div>
  );
}

function ElectricityQuestions({ answers, updateAnswer }: QuestionProps) {
  return (
    <div className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          What size is your home?
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['small', 'medium', 'large'] as const).map((size) => (
            <OptionButton
              key={size}
              selected={answers.homeSize === size}
              onClick={() => updateAnswer('homeSize', size)}
            >
              <span className="capitalize">{size}</span>
              <span className="block text-xs text-muted-foreground mt-1">
                {size === 'small' ? '< 50m²' : size === 'medium' ? '50-120m²' : '> 120m²'}
              </span>
            </OptionButton>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Do you use renewable energy?
        </label>
        <div className="grid grid-cols-2 gap-3">
          <OptionButton
            selected={answers.renewableEnergy === true}
            onClick={() => updateAnswer('renewableEnergy', true)}
          >
            Yes, I have solar/wind/green tariff
          </OptionButton>
          <OptionButton
            selected={answers.renewableEnergy === false}
            onClick={() => updateAnswer('renewableEnergy', false)}
          >
            No, standard grid electricity
          </OptionButton>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          How energy-efficient is your home?
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['high', 'medium', 'low'] as const).map((eff) => (
            <OptionButton
              key={eff}
              selected={answers.energyEfficiency === eff}
              onClick={() => updateAnswer('energyEfficiency', eff)}
            >
              <span className="capitalize">{eff}</span>
              <span className="block text-xs text-muted-foreground mt-1">
                {eff === 'high'
                  ? 'LED, new appliances'
                  : eff === 'medium'
                  ? 'Some efficient'
                  : 'Older appliances'}
              </span>
            </OptionButton>
          ))}
        </div>
      </div>
    </div>
  );
}

function FoodQuestions({ answers, updateAnswer }: QuestionProps) {
  return (
    <div className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          What best describes your diet?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(
            [
              { value: 'vegan', label: 'Vegan' },
              { value: 'vegetarian', label: 'Vegetarian' },
              { value: 'flexitarian', label: 'Flexitarian' },
              { value: 'meat-regular', label: 'Regular meat' },
              { value: 'meat-heavy', label: 'Heavy meat' },
            ] as const
          ).map(({ value, label }) => (
            <OptionButton
              key={value}
              selected={answers.diet === value}
              onClick={() => updateAnswer('diet', value)}
            >
              {label}
            </OptionButton>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          How often do you buy local/seasonal food?
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['mostly', 'sometimes', 'rarely'] as const).map((freq) => (
            <OptionButton
              key={freq}
              selected={answers.localFood === freq}
              onClick={() => updateAnswer('localFood', freq)}
            >
              <span className="capitalize">{freq}</span>
            </OptionButton>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          How much food do you typically waste?
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              { value: 'minimal', label: 'Minimal' },
              { value: 'some', label: 'Some' },
              { value: 'significant', label: 'Significant' },
            ] as const
          ).map(({ value, label }) => (
            <OptionButton
              key={value}
              selected={answers.foodWaste === value}
              onClick={() => updateAnswer('foodWaste', value)}
            >
              {label}
            </OptionButton>
          ))}
        </div>
      </div>
    </div>
  );
}
