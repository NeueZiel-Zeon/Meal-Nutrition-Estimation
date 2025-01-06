"use client";

import { useEffect, useState } from "react";
import { getUserAnalyses } from "@/lib/analyze-image";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface MealRecord {
  id: string;
  created_at: string;
  detected_dishes: string[];
  food_items: string[];
  calories: number;
}

export function RecentMeals() {
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMeals = async () => {
      try {
        const data = await getUserAnalyses();
        // 最新の3件のみを取得
        setMeals(data.slice(0, 3));
      } catch (error) {
        console.error("Failed to load meals:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMeals();
  }, []);

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="space-y-8">
      {meals.map((meal) => (
        <div key={meal.id} className="flex items-center">
          <div className="ml-4 space-y-1 flex-grow">
            <p className="text-base font-medium leading-none">
              {format(new Date(meal.created_at), "M月d日 HH:mm", { locale: ja })}
            </p>
            <p className="text-base text-muted-foreground">
              <span className="font-bold text-foreground">
                {meal.detected_dishes.join("、")}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              使用食材: {meal.food_items.join("、")}
            </p>
          </div>
          <div className="ml-auto font-medium">{meal.calories} kcal</div>
        </div>
      ))}
      {meals.length === 0 && (
        <div className="text-center text-muted-foreground">
          食事記録がありません
        </div>
      )}
    </div>
  );
}

