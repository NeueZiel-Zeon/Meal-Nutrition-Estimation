"use client";

import { MainNav } from "@/components/dashboard/main-nav";
import { RecentMeals } from "@/components/dashboard/recent-meals";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogOut } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { NutrientSummary, getNutrientsByDateRange } from "@/lib/analyze-image";

interface ExtendedNutrientSummary extends NutrientSummary {
  totalVitamins: {
    vitaminA: number;
    vitaminD: number;
    vitaminB12: number;
    vitaminC: number;
  };
  totalMinerals: {
    calcium: number;
    iron: number;
    potassium: number;
    magnesium: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [nutrients, setNutrients] = useState<ExtendedNutrientSummary>({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    totalVitamins: {
      vitaminA: 0,
      vitaminD: 0,
      vitaminB12: 0,
      vitaminC: 0
    },
    totalMinerals: {
      calcium: 0,
      iron: 0,
      potassium: 0,
      magnesium: 0
    }
  });

  useEffect(() => {
    const loadTodayNutrients = async () => {
      const today = new Date();
      try {
        const data = await getNutrientsByDateRange(today, today);
        setNutrients(data);
      } catch (error) {
        console.error('Failed to load nutrients:', error);
      }
    };

    loadTodayNutrients();
  }, []);

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
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">今日の食事概要</h2>
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  総カロリー
                </CardTitle>
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
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nutrients.totalProtein} g</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">炭水化物</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nutrients.totalCarbs} g</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">脂質</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nutrients.totalFat} g</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ビタミン摂取量</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium">ビタミンA</p>
                  <p className="text-2xl font-bold">{nutrients.totalVitamins.vitaminA} μg</p>
                </div>
                <div>
                  <p className="text-sm font-medium">ビタミンD</p>
                  <p className="text-2xl font-bold">{nutrients.totalVitamins.vitaminD} μg</p>
                </div>
                <div>
                  <p className="text-sm font-medium">ビタミンB12</p>
                  <p className="text-2xl font-bold">{nutrients.totalVitamins.vitaminB12} μg</p>
                </div>
                <div>
                  <p className="text-sm font-medium">ビタミンC</p>
                  <p className="text-2xl font-bold">{nutrients.totalVitamins.vitaminC} mg</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ミネラル摂取量</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium">カルシウム</p>
                  <p className="text-2xl font-bold">{nutrients.totalMinerals.calcium} mg</p>
                </div>
                <div>
                  <p className="text-sm font-medium">鉄分</p>
                  <p className="text-2xl font-bold">{nutrients.totalMinerals.iron} mg</p>
                </div>
                <div>
                  <p className="text-sm font-medium">カリウム</p>
                  <p className="text-2xl font-bold">{nutrients.totalMinerals.potassium} mg</p>
                </div>
                <div>
                  <p className="text-sm font-medium">マグネシウム</p>
                  <p className="text-2xl font-bold">{nutrients.totalMinerals.magnesium} mg</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>本日の食事記録</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentMeals />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}