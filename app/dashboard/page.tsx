"use client";

import { CalendarDateRangePicker } from "@/components/dashboard/date-range-picker";
import { MainNav } from "@/components/dashboard/main-nav";
import { Overview } from "@/components/dashboard/overview";
import { RecentMeals } from "@/components/dashboard/recent-meals";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, PlusCircle, LogOut } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { NutrientSummary } from "@/lib/analyze-image";
import { getNutrientsByDateRange } from "@/lib/analyze-image";
import { PeriodSelector } from "@/components/dashboard/period-selector";

export default function DashboardPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [period, setPeriod] = useState("day");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date()
  });
  const [nutrients, setNutrients] = useState<NutrientSummary>({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0
  });

  useEffect(() => {
    const loadNutrients = async () => {
      if (dateRange?.from && dateRange?.to) {
        try {
          const data = await getNutrientsByDateRange(dateRange.from, dateRange.to);
          setNutrients(data);
        } catch (error) {
          console.error('Failed to load nutrients:', error);
        }
      }
    };

    loadNutrients();
  }, [dateRange]);

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

  const handlePeriodChange = (newPeriod: string) => {
    const today = new Date();
    let from = new Date();
    let to = new Date();

    switch (newPeriod) {
      case "day":
        // 当日の0時から23時59分59秒まで
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case "week":
        // 現在の週の日曜日から土曜日
        from.setDate(today.getDate() - today.getDay());
        from.setHours(0, 0, 0, 0);
        to.setDate(from.getDate() + 6);
        to.setHours(23, 59, 59, 999);
        break;
      case "month":
        // 現在の月の初日から末日
        from.setDate(1);
        from.setHours(0, 0, 0, 0);
        to.setDate(new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate());
        to.setHours(23, 59, 59, 999);
        break;
    }

    setPeriod(newPeriod);
    setDateRange({ from, to });
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
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">食事管理ダッシュボード</h2>
          <PeriodSelector
            period={period}
            dateRange={dateRange}
            onPeriodChange={handlePeriodChange}
            onDateRangeChange={setDateRange}
          />
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  総カロリー
                </CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nutrients.totalCalories} kcal</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  タンパク質
                </CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nutrients.totalProtein} g</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">炭水化物</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nutrients.totalCarbs} g</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">脂質</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nutrients.totalFat} g</div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>週間カロリー推移</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>最近の食事</CardTitle>
                <CardDescription>
                  今日の食事記録
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentMeals />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 