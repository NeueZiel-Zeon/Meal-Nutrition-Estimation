"use client";

import { MainNav } from "@/components/dashboard/main-nav";
import { Button } from "@/components/ui/button";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface MealRecord {
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

export default function MealHistoryPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [caloriesByDate, setCaloriesByDate] = useState<{ [key: string]: number }>({});
  const [selectedDayMeals, setSelectedDayMeals] = useState<MealRecord[]>([]);

  const formatDateKey = useCallback((date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const fetchMonthlyCalories = async () => {
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const calendarStart = new Date(firstDay);
      calendarStart.setDate(1 - firstDay.getDay());
      
      const calendarEnd = new Date(lastDay);
      calendarEnd.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
      
      try {
        const { data, error } = await supabase
          .from('meal_analyses')
          .select('calories, created_at')
          .filter('created_at', 'gte', calendarStart.toISOString())
          .filter('created_at', 'lt', calendarEnd.toISOString());

        if (error) throw error;
        
        if (isMounted) {
          const newCaloriesByDate = data.reduce((acc, meal) => {
            const mealDate = new Date(meal.created_at);
            const dateKey = formatDateKey(mealDate);
            acc[dateKey] = (acc[dateKey] || 0) + meal.calories;
            return acc;
          }, {} as { [key: string]: number });

          setCaloriesByDate(newCaloriesByDate);
        }
      } catch (error) {
        console.error('Failed to load nutrients:', error);
        if (isMounted) {
          toast({
            title: "エラー",
            description: "カロリーデータの取得に失敗しました",
            variant: "destructive",
          });
        }
      }
    };

    fetchMonthlyCalories();
    
    return () => {
      isMounted = false;
    };
  }, [currentMonth, formatDateKey, supabase, toast]);

  useEffect(() => {
    let isMounted = true;

    const fetchMealsForDate = async () => {
      const dateKey = formatDateKey(date);
      try {
        const { data, error } = await supabase
          .from('meal_analyses')
          .select(`
            id,
            created_at,
            detected_dishes,
            food_items,
            calories,
            portions,
            nutrients,
            deficient_nutrients,
            excessive_nutrients,
            improvements,
            image_url
          `)
          .filter('created_at', 'gte', `${dateKey}T00:00:00+09:00`)
          .filter('created_at', 'lt', `${dateKey}T23:59:59+09:00`)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        if (isMounted) {
          setSelectedDayMeals(data || []);
        }
      } catch (error) {
        console.error('Failed to load meals:', error);
        if (isMounted) {
          toast({
            title: "エラー",
            description: "食事データの取得に失敗しました",
            variant: "destructive",
          });
        }
      }
    };

    fetchMealsForDate();
    
    return () => {
      isMounted = false;
    };
  }, [date, formatDateKey, supabase, toast]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "ログアウト成功",
        description: "ログイン画面に戻ります",
      });

      router.push("/auth/login");
    } catch (error: any) {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMealClick = (meal: MealRecord) => {
    localStorage.setItem('analysisResults', JSON.stringify({
      detectedDishes: meal.detected_dishes,
      foodItems: meal.food_items,
      calories: meal.calories,
      nutrients: meal.nutrients,
      deficientNutrients: meal.deficient_nutrients,
      excessiveNutrients: meal.excessive_nutrients,
      improvements: meal.improvements,
      image_url: meal.image_url,
      portions: meal.portions || {}
    }));
    
    router.push(`/meal-analysis?tab=analysis&id=${meal.id}`);
  };

  return (
    <div className="flex-col md:flex">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              ログアウト
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 pt-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">カレンダー</h2>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl font-bold">
                {format(currentMonth, 'yyyy年M月', { locale: ja })}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <button 
                  className="p-2 hover:bg-gray-100 rounded-full"
                  onClick={() => {
                    const prevMonth = new Date(currentMonth);
                    prevMonth.setMonth(prevMonth.getMonth() - 1);
                    setCurrentMonth(prevMonth);
                  }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button 
                  className="p-2 hover:bg-gray-100 rounded-full"
                  onClick={() => {
                    const nextMonth = new Date(currentMonth);
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    setCurrentMonth(nextMonth);
                  }}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-center text-sm font-medium p-2">
                    {day}
                  </div>
                ))}
                {(() => {
                  // 現在の月の最初の日
                  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                  // 現在の月の最後の日
                  const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
                  // 前月の日数を表示するための開始日
                  const startDate = new Date(firstDay);
                  startDate.setDate(1 - firstDay.getDay());
                  
                  // カレンダーに表示する週の数を計算
                  const totalWeeks = Math.ceil((firstDay.getDay() + lastDay.getDate()) / 7);
                  // 表示する日数を計算（週数 × 7）
                  const totalDays = totalWeeks * 7;
                  
                  return Array.from({ length: totalDays }, (_, i) => {
                    const currentDate = new Date(startDate);
                    currentDate.setDate(startDate.getDate() + i);
                    
                    const dateKey = formatDateKey(currentDate);
                    const calories = caloriesByDate[dateKey];
                    const isCurrentMonth = currentDate.getMonth() === currentMonth.getMonth();
                    const isSelected = currentDate.toDateString() === date.toDateString();
                    
                    return (
                      <div
                        key={i}
                        className={`
                          relative p-2 text-center cursor-pointer hover:bg-gray-50 rounded-lg
                          ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                          ${!isCurrentMonth ? 'text-gray-400' : ''}
                        `}
                        onClick={() => setDate(currentDate)}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-sm mb-1">{currentDate.getDate()}</span>
                          <span className={`text-[10px] ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-500'}`}>
                            {calories ? `${calories}kcal` : '0kcal'}
                          </span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                {format(date, 'yyyy年M月d日', { locale: ja })}の食事記録
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedDayMeals.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    この日の食事記録はありません
                  </div>
                ) : (
                  selectedDayMeals.map((meal) => (
                    <div 
                      key={meal.id} 
                      className="border-l-4 border-primary pl-4 py-2 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleMealClick(meal)}
                    >
                      <h3 className="font-semibold text-lg">
                        {format(new Date(meal.created_at), 'HH:mm', { locale: ja })}
                        {' '}({meal.calories}kcal)
                      </h3>
                      <p className="text-gray-600 mb-1">
                        {meal.detected_dishes.join('、')}
                      </p>
                      <p className="text-sm text-gray-500">
                        使用食材: {meal.food_items.join('、')}
                      </p>
                    </div>
                  ))
                )}

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">合計カロリー</span>
                    <span className="text-xl font-bold text-primary">
                      {caloriesByDate[formatDateKey(date)] || 0}kcal
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}