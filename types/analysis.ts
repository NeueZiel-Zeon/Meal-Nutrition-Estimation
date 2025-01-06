export interface NutrientData {
  protein: number;
  carbs: number;
  fat: number;
}

export interface VitaminData {
  vitaminA: number;
  vitaminC: number;
  vitaminD: number;
}

export interface AnalysisResults {
  foodItems: string[];
  detectedDishes: string[];
  calories: number;
  portions: {
    [key: string]: number;
  };
  nutrients: {
    protein: number;
    fat: number;
    carbs: number;
    vitamins: {
      vitaminA: number;
      vitaminB: number;
      vitaminC: number;
      vitaminD: number;
      vitaminE: number;
    };
    minerals: {
      calcium: number;
      iron: number;
      potassium: number;
      magnesium: number;
      zinc: number;
    };
  };
  deficientNutrients: string[];
  excessiveNutrients: string[];
  improvements: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatContext {
  analysisResults: AnalysisResults;
  messages: Message[];
}