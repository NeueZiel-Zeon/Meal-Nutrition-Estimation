"use client";

import { useEffect, useState } from "react";
import { getUserAnalyses } from "@/lib/analyze-image";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { MealRecord } from "@/types/analysis";

export function RecentMeals() {
  const router = useRouter();
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMeals = async () => {
      try {
        const data = await getUserAnalyses();
        
        // 今日の日付の開始と終了を設定
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

        // 今日の食事のみをフィルタリング
        const todaysMeals = data.filter(meal => {
          const mealDate = new Date(meal.created_at);
          return mealDate >= startOfDay && mealDate <= endOfDay;
        });

        setMeals(todaysMeals);
      } catch (error) {
        console.error("Failed to load meals:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMeals();
  }, []);

  const handleMealClick = (meal: MealRecord) => {
    // LocalStorageに分析結果を保存
    localStorage.setItem('analysisResults', JSON.stringify({
      detectedDishes: meal.detected_dishes,
      foodItems: meal.food_items,
      calories: meal.calories,
      nutrients: meal.nutrients,
      portions: meal.portions || {},
      deficientNutrients: meal.deficient_nutrients,
      excessiveNutrients: meal.excessive_nutrients,
      improvements: meal.improvements,
      image_url: meal.image_url
    }));
    
    // 分析ページに遷移
    router.push(`/meal-analysis?tab=analysis&id=${meal.id}`);
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (meals.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        本日の食事記録はありません
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {meals.map((meal) => (
        <div
          key={meal.id}
          onClick={() => handleMealClick(meal)}
          className="border-l-4 border-primary pl-4 py-2 cursor-pointer hover:bg-gray-50"
        >
          <h3 className="font-semibold">
            {format(new Date(meal.created_at), 'HH:mm', { locale: ja })}
            {' '}({meal.calories}kcal)
          </h3>
          <p className="text-sm text-gray-600">
            {meal.detected_dishes.join('、')}
          </p>
        </div>
      ))}
    </div>
  );
}

