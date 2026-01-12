// Carbon Estimation Engine - Rule-Based Calculations
// All values in kg CO₂ per year

export interface QuizAnswers {
  // Transport
  carType: 'none' | 'electric' | 'hybrid' | 'petrol' | 'diesel';
  carKmPerWeek: number;
  flightsPerYear: 'none' | '1-2' | '3-5' | '6+';
  publicTransport: 'daily' | 'weekly' | 'rarely' | 'never';
  
  // Electricity
  homeSize: 'small' | 'medium' | 'large';
  renewableEnergy: boolean;
  energyEfficiency: 'high' | 'medium' | 'low';
  
  // Food
  diet: 'vegan' | 'vegetarian' | 'flexitarian' | 'meat-regular' | 'meat-heavy';
  localFood: 'mostly' | 'sometimes' | 'rarely';
  foodWaste: 'minimal' | 'some' | 'significant';
}

export interface CarbonResult {
  transport: number;
  electricity: number;
  food: number;
  total: number;
  breakdown: {
    category: string;
    value: number;
    percentage: number;
    color: string;
  }[];
  comparison: {
    globalAverage: number;
    countryAverage: number;
    target2030: number;
  };
}

// CO₂ emission factors (kg CO₂ per year)
const EMISSION_FACTORS = {
  car: {
    none: 0,
    electric: 0.05, // kg per km (grid electricity)
    hybrid: 0.1,
    petrol: 0.21,
    diesel: 0.27,
  },
  flights: {
    none: 0,
    '1-2': 1100, // Short-haul average
    '3-5': 3300,
    '6+': 6600,
  },
  publicTransport: {
    daily: 400,
    weekly: 150,
    rarely: 50,
    never: 0,
  },
  home: {
    small: 1500,
    medium: 2500,
    large: 4000,
  },
  diet: {
    vegan: 1500,
    vegetarian: 1700,
    flexitarian: 2200,
    'meat-regular': 2800,
    'meat-heavy': 3500,
  },
};

export function calculateCarbonFootprint(answers: QuizAnswers): CarbonResult {
  // Transport calculation
  const carEmissions = EMISSION_FACTORS.car[answers.carType] * answers.carKmPerWeek * 52;
  const flightEmissions = EMISSION_FACTORS.flights[answers.flightsPerYear];
  const publicTransportEmissions = EMISSION_FACTORS.publicTransport[answers.publicTransport];
  const transport = Math.round(carEmissions + flightEmissions + publicTransportEmissions);

  // Electricity calculation
  let baseElectricity = EMISSION_FACTORS.home[answers.homeSize];
  if (answers.renewableEnergy) baseElectricity *= 0.3;
  if (answers.energyEfficiency === 'high') baseElectricity *= 0.7;
  else if (answers.energyEfficiency === 'low') baseElectricity *= 1.3;
  const electricity = Math.round(baseElectricity);

  // Food calculation
  let baseFood = EMISSION_FACTORS.diet[answers.diet];
  if (answers.localFood === 'mostly') baseFood *= 0.85;
  else if (answers.localFood === 'rarely') baseFood *= 1.15;
  if (answers.foodWaste === 'minimal') baseFood *= 0.9;
  else if (answers.foodWaste === 'significant') baseFood *= 1.2;
  const food = Math.round(baseFood);

  const total = transport + electricity + food;

  const breakdown = [
    {
      category: 'Transport',
      value: transport,
      percentage: Math.round((transport / total) * 100),
      color: 'hsl(195, 70%, 50%)', // eco-sky
    },
    {
      category: 'Electricity',
      value: electricity,
      percentage: Math.round((electricity / total) * 100),
      color: 'hsl(35, 40%, 35%)', // eco-earth
    },
    {
      category: 'Food',
      value: food,
      percentage: Math.round((food / total) * 100),
      color: 'hsl(142, 60%, 45%)', // eco-leaf
    },
  ];

  return {
    transport,
    electricity,
    food,
    total,
    breakdown,
    comparison: {
      globalAverage: 4700,
      countryAverage: 7500,
      target2030: 2000,
    },
  };
}

export function getImpactLevel(total: number): 'low' | 'medium' | 'high' | 'very-high' {
  if (total < 3000) return 'low';
  if (total < 5000) return 'medium';
  if (total < 8000) return 'high';
  return 'very-high';
}

export function getSuggestions(answers: QuizAnswers, result: CarbonResult): string[] {
  const suggestions: string[] = [];
  const biggest = result.breakdown.reduce((a, b) => (a.value > b.value ? a : b));

  if (biggest.category === 'Transport') {
    if (answers.carType === 'petrol' || answers.carType === 'diesel') {
      suggestions.push('Consider switching to an electric or hybrid vehicle');
    }
    if (answers.flightsPerYear !== 'none') {
      suggestions.push('Try video calls instead of business flights when possible');
    }
    suggestions.push('Use public transport or cycle for short trips');
  }

  if (biggest.category === 'Electricity') {
    if (!answers.renewableEnergy) {
      suggestions.push('Switch to a renewable energy provider');
    }
    suggestions.push('Upgrade to LED lighting and energy-efficient appliances');
    suggestions.push('Improve home insulation to reduce heating/cooling needs');
  }

  if (biggest.category === 'Food') {
    if (answers.diet === 'meat-heavy' || answers.diet === 'meat-regular') {
      suggestions.push('Try having meat-free days each week');
    }
    if (answers.localFood !== 'mostly') {
      suggestions.push('Buy more locally sourced and seasonal produce');
    }
    suggestions.push('Plan meals to reduce food waste');
  }

  return suggestions.slice(0, 5);
}
