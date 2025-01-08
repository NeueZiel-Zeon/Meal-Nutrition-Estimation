"use client";

import { MainNav } from "@/components/dashboard/main-nav";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { getNutrientsByDateRange } from "@/lib/analyze-image";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { ja } from "date-fns/locale";
import Image from "next/image";

export default function MealHistoryPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [caloriesByDate, setCaloriesByDate] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchMonthlyCalories = async () => {
      const calendarStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const calendarEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const firstDayOfMonth = calendarStart.getDay();
      const lastDayOfMonth = calendarEnd.getDay();
      
      const start = new Date(calendarStart);
      start.setDate(start.getDate() - firstDayOfMonth);
      
      const end = new Date(calendarEnd);
      end.setDate(end.getDate() + (6 - lastDayOfMonth));
      
      try {
        const { data, error } = await supabase
          .from('meal_analyses')
          .select('calories, created_at')
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString());

        if (error) throw error;

        const newCaloriesByDate = data.reduce((acc, meal) => {
          const dateKey = new Date(meal.created_at).toISOString().split('T')[0];
          acc[dateKey] = (acc[dateKey] || 0) + meal.calories;
          return acc;
        }, {} as { [key: string]: number });

        setCaloriesByDate(newCaloriesByDate);
      } catch (error) {
        console.error('Failed to load nutrients:', error);
      }
    };

    fetchMonthlyCalories();
  }, [currentMonth, supabase]);

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
          <h2 className="text-3xl font-bold tracking-tight">食事履歴</h2>
        </div>

        <div className="flex gap-16">
          <div className="bg-white rounded-lg p-6 border w-fit">
            <div 
              className="scale-[1.75] transform origin-top-left min-w-[320px]"
              style={{ 
                height: 'calc(400px * 1.75)',
                width: 'calc(320px * 1.75)'
              }}
            >
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                onMonthChange={setCurrentMonth}
                month={currentMonth}
                className="rounded-md"
                components={{
                  DayContent: ({ date: dayDate }) => {
                    const dateKey = dayDate.toISOString().split('T')[0];
                    const calories = caloriesByDate[dateKey];
                    const isCurrentMonth = dayDate.getMonth() === currentMonth.getMonth();
                    
                    return (
                      <div className="flex flex-col items-center py-2">
                        <span className={`text-sm mb-1 ${!isCurrentMonth ? 'text-gray-400' : ''}`}>
                          {dayDate.getDate()}
                        </span>
                        <span className={`text-[10px] ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-500'}`}>
                          {calories ? `${calories}kcal` : '0kcal'}
                        </span>
                      </div>
                    );
                  }
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border flex-1">
            <h3 className="text-xl font-semibold mb-4">
              {format(date, 'yyyy年M月d日 (E)', { locale: ja })}の食事
            </h3>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">
                摂取カロリー: {caloriesByDate[date.toISOString().split('T')[0]] || 0}kcal
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="relative aspect-square rounded-md overflow-hidden border">
                <Image
                  src="/placeholder.png"
                  alt="食事画像"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}