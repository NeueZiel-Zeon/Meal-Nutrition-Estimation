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
  calories: number;
  nutrients: NutrientData;
  vitamins: VitaminData;
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