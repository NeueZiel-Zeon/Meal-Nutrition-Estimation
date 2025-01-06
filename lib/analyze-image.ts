import { AnalysisResults } from "@/types/analysis";
import { supabaseClient } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export async function analyzeImage(file: File): Promise<AnalysisResults> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
      cache: 'no-store',
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Response:', errorText);
      throw new Error(`分析に失敗しました (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in analyzeImage:', error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('APIサーバーに接続できません。サーバーが起動していることを確認してください。');
    }
    throw error;
  }
}

export async function getPastAnalyses() {
  const { data, error } = await supabaseClient
    .from('meal_analyses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getImageContext(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    console.log('Sending file to chat API:', file.name, file.type);

    const response = await fetch('/api/chat', {
      method: 'POST',
      body: formData,
      cache: 'no-store',
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Chat API Error:', errorText);
      throw new Error('画像の説明取得に失敗しました');
    }

    const data = await response.json();
    console.log('Received context:', data.imageContext);

    return data.imageContext;
  } catch (error) {
    console.error('Error getting image context:', error);
    throw error;
  }
} 