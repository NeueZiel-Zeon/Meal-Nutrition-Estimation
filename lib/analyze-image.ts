import { AnalysisResults } from "@/types/analysis";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';

export async function analyzeImage(file: File): Promise<AnalysisResults> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Response:', errorText);
      throw new Error('画像の分析に失敗しました');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in analyzeImage:', error);
    throw error;
  }
}

export async function getPastAnalyses() {
  const { data, error } = await supabase
    .from('meal_analyses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
} 