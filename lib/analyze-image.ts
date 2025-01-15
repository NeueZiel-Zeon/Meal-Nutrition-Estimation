import { AnalysisResults } from "@/types/analysis";
import { supabaseClient } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export async function analyzeImage(file: File, dishName?: string): Promise<AnalysisResults> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (dishName) {
      formData.append('dishName', dishName);
    }

    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
      cache: 'no-store',
      signal: AbortSignal.timeout(60000)
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
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new Error('分析に時間がかかりすぎています。しばらく待ってから再度お試しください。');
    }
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

// 日時を表示する際にUTCから日本時間に調整
const adjustToJST = (utcDate: string) => {
  const date = new Date(utcDate);
  return new Date(date.getTime() + (9 * 60 * 60 * 1000));
};

export async function saveAnalysisResult(
  results: AnalysisResults,
  imageFile: File
) {
  try {
    const now = new Date();

    // 画像をStorageにアップロード
    const fileName = `${Date.now()}-${imageFile.name}`;
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('meal-images')
      .upload(fileName, imageFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // 公開URLを取得
    const { data: { publicUrl } } = supabaseClient.storage
      .from('meal-images')
      .getPublicUrl(fileName);

    // ユーザーIDを取得
    const { data: { user } } = await supabaseClient.auth.getUser();

    // 分析結果をDBに保存
    const { data, error } = await supabaseClient
      .from('meal_analyses')
      .insert({
        user_id: user?.id,
        detected_dishes: results.detectedDishes,
        food_items: results.foodItems,
        calories: results.calories,
        portions: results.portions,
        nutrients: results.nutrients,
        deficient_nutrients: results.deficientNutrients,
        excessive_nutrients: results.excessiveNutrients,
        improvements: results.improvements,
        image_url: publicUrl,
        image_base64: results.imageBase64,
        created_at: now.toISOString()
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving analysis result:', error);
    throw error;
  }
}

export async function getUserAnalyses() {
  try {
    const { data, error } = await supabaseClient
      .from('meal_analyses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching analyses:', error);
    throw error;
  }
}

export interface NutrientSummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalVitamins: {
    vitaminA: number;
    vitaminD: number;
    vitaminE: number;
    vitaminK: number;
    vitaminB1: number;
    vitaminB2: number;
    vitaminB3: number;
    vitaminB5: number;
    vitaminB6: number;
    vitaminB7: number;
    vitaminB9: number;
    vitaminB12: number;
    vitaminC: number;
  };
  totalMinerals: {
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
}

export async function getNutrientsByDateRange(startDate: Date, endDate: Date): Promise<NutrientSummary> {
  try {
    // 開始日を0時0分0秒に、終了日を23時59分59秒に設定
    const from = new Date(startDate);
    from.setHours(0, 0, 0, 0);
    
    const to = new Date(endDate);
    to.setHours(23, 59, 59, 999);

    const { data, error } = await supabaseClient
      .from('meal_analyses')
      .select('calories, nutrients')
      .gte('created_at', from.toISOString())
      .lte('created_at', to.toISOString());

    if (error) throw error;

    return data.reduce((acc, meal) => ({
      totalCalories: acc.totalCalories + meal.calories,
      totalProtein: acc.totalProtein + meal.nutrients.protein,
      totalCarbs: acc.totalCarbs + meal.nutrients.carbs,
      totalFat: acc.totalFat + meal.nutrients.fat,
      totalVitamins: {
        vitaminA: acc.totalVitamins.vitaminA + meal.nutrients.vitamins.vitaminA,
        vitaminD: acc.totalVitamins.vitaminD + meal.nutrients.vitamins.vitaminD,
        vitaminE: acc.totalVitamins.vitaminE + meal.nutrients.vitamins.vitaminE,
        vitaminK: acc.totalVitamins.vitaminK + meal.nutrients.vitamins.vitaminK,
        vitaminB1: acc.totalVitamins.vitaminB1 + meal.nutrients.vitamins.vitaminB1,
        vitaminB2: acc.totalVitamins.vitaminB2 + meal.nutrients.vitamins.vitaminB2,
        vitaminB3: acc.totalVitamins.vitaminB3 + meal.nutrients.vitamins.vitaminB3,
        vitaminB5: acc.totalVitamins.vitaminB5 + meal.nutrients.vitamins.vitaminB5,
        vitaminB6: acc.totalVitamins.vitaminB6 + meal.nutrients.vitamins.vitaminB6,
        vitaminB7: acc.totalVitamins.vitaminB7 + meal.nutrients.vitamins.vitaminB7,
        vitaminB9: acc.totalVitamins.vitaminB9 + meal.nutrients.vitamins.vitaminB9,
        vitaminB12: acc.totalVitamins.vitaminB12 + meal.nutrients.vitamins.vitaminB12,
        vitaminC: acc.totalVitamins.vitaminC + meal.nutrients.vitamins.vitaminC
      },
      totalMinerals: {
        calcium: acc.totalMinerals.calcium + meal.nutrients.minerals.calcium,
        phosphorus: acc.totalMinerals.phosphorus + meal.nutrients.minerals.phosphorus,
        magnesium: acc.totalMinerals.magnesium + meal.nutrients.minerals.magnesium,
        sodium: acc.totalMinerals.sodium + meal.nutrients.minerals.sodium,
        potassium: acc.totalMinerals.potassium + meal.nutrients.minerals.potassium,
        sulfur: acc.totalMinerals.sulfur + meal.nutrients.minerals.sulfur,
        chlorine: acc.totalMinerals.chlorine + meal.nutrients.minerals.chlorine,
        iron: acc.totalMinerals.iron + meal.nutrients.minerals.iron,
        copper: acc.totalMinerals.copper + meal.nutrients.minerals.copper,
        zinc: acc.totalMinerals.zinc + meal.nutrients.minerals.zinc,
        selenium: acc.totalMinerals.selenium + meal.nutrients.minerals.selenium,
        manganese: acc.totalMinerals.manganese + meal.nutrients.minerals.manganese,
        iodine: acc.totalMinerals.iodine + meal.nutrients.minerals.iodine,
        cobalt: acc.totalMinerals.cobalt + meal.nutrients.minerals.cobalt,
        molybdenum: acc.totalMinerals.molybdenum + meal.nutrients.minerals.molybdenum,
        chromium: acc.totalMinerals.chromium + meal.nutrients.minerals.chromium
      }
    }), {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalVitamins: {
        vitaminA: 0,
        vitaminD: 0,
        vitaminE: 0,
        vitaminK: 0,
        vitaminB1: 0,
        vitaminB2: 0,
        vitaminB3: 0,
        vitaminB5: 0,
        vitaminB6: 0,
        vitaminB7: 0,
        vitaminB9: 0,
        vitaminB12: 0,
        vitaminC: 0
      },
      totalMinerals: {
        calcium: 0,
        phosphorus: 0,
        magnesium: 0,
        sodium: 0,
        potassium: 0,
        sulfur: 0,
        chlorine: 0,
        iron: 0,
        copper: 0,
        zinc: 0,
        selenium: 0,
        manganese: 0,
        iodine: 0,
        cobalt: 0,
        molybdenum: 0,
        chromium: 0
      }
    });
  } catch (error) {
    console.error('Error fetching nutrients:', error);
    throw error;
  }
}

export interface DailyCalories {
  name: string;      // 曜日と日付
  dayOfWeek: string; // 曜日のみ（ソート用）
  total: number;     // カロリー
}

export async function getWeeklyCalories(): Promise<DailyCalories[]> {
  try {
    // 現在の日付から直近の日曜日まで戻る
    const today = new Date();
    const currentDay = today.getDay();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - currentDay);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    const { data, error } = await supabaseClient
      .from('meal_analyses')
      .select('calories, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) throw error;

    // 日付ごとにカロリーを集計
    const dailyCalories = new Map<string, number>();
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const result: DailyCalories[] = [];

    // 日曜日から土曜日までのデータを作成
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dayOfWeek = days[date.getDay()];
      const formattedDate = `${dayOfWeek}(${date.getMonth() + 1}/${date.getDate()})`;
      
      // その日のカロリーを集計
      const dayTotal = data
        .filter(meal => {
          const mealDate = new Date(meal.created_at);
          return mealDate.getDate() === date.getDate() &&
                 mealDate.getMonth() === date.getMonth() &&
                 mealDate.getFullYear() === date.getFullYear();
        })
        .reduce((sum, meal) => sum + meal.calories, 0);

      result.push({
        name: formattedDate,
        dayOfWeek,
        total: dayTotal
      });
    }

    return result;
  } catch (error) {
    console.error('Error fetching weekly calories:', error);
    throw error;
  }
} 