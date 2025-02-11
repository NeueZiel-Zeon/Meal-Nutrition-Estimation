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
      phosphorus: number;
      magnesium: number;
      sodium: number;
      potassium: number;
      sulfur: number;
      chlorine: number;
      iron: number;
      copper: number;
      zinc: number;
      selenium: number;
      manganese: number;
      iodine: number;
      cobalt: number;
      molybdenum: number;
      chromium: number;
    };
  };
  deficientNutrients: string[];
  excessiveNutrients: string[];
  improvements: string[];
  imageUrl?: string;
  imageBase64?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatContext {
  analysisResults: AnalysisResults;
  messages: Message[];
}

export interface MealRecord {
  id: string;
  created_at: string;
  detected_dishes: string[];
  food_items: string[];
  calories: number;
  portions: {
    [key: string]: number;
  };
  nutrients: {
    protein: number;
    fat: number;
    carbs: number;
    vitamins: {
      [key: string]: number;
    };
    minerals: {
      [key: string]: number;
    };
  };
  deficient_nutrients: string[];
  excessive_nutrients: string[];
  improvements: string[];
  image_url?: string;
}
