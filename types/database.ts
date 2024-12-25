import { AnalysisResults } from "@/types/analysis";

export interface MealAnalysisRecord {
  id: string;
  user_id?: string;
  image_url: string;
  analysis_results: AnalysisResults;
  created_at: string;
} 