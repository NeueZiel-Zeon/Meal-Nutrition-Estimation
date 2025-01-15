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
import { LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { NutrientSummary, getNutrientsByDateRange } from "@/lib/analyze-image";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ImageUpload } from "@/components/ImageUpload";
import { analyzeImage, saveAnalysisResult } from "@/lib/analyze-image";
import { AnalysisResults } from "@/types/analysis";

interface ExtendedNutrientSummary extends NutrientSummary {
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

// 栄養素名の日本語マッピング
const NUTRIENT_NAMES = {
  // ビタミン
  vitaminA: 'ビタミンA',
  vitaminD: 'ビタミンD',
  vitaminE: 'ビタミンE',
  vitaminK: 'ビタミンK',
  vitaminB1: 'ビタミンB1',
  vitaminB2: 'ビタミンB2',
  vitaminB3: 'ビタミンB3',
  vitaminB5: 'ビタミンB5',
  vitaminB6: 'ビタミンB6',
  vitaminB7: 'ビタミンB7',
  vitaminB9: 'ビタミンB9',
  vitaminB12: 'ビタミンB12',
  vitaminC: 'ビタミンC',
  // ミネラル
  calcium: 'カルシウム',
  magnesium: 'マグネシウム',
  phosphorus: 'リン',
  potassium: 'カリウム',
  sodium: 'ナトリウム',
  chloride: '塩化物',
  chromium: 'クロム',
  copper: '銅',
  fluoride: 'フッ化物',
  iodine: 'ヨウ素',
  iron: '鉄分',
  manganese: 'マンガン',
  molybdenum: 'モリブデン',
  selenium: 'セレン',
  zinc: '亜鉛'
} as const;

// 栄養素の単位を定義
const NUTRIENT_UNITS = {
  vitamins: {
    vitaminA: 'μg',
    vitaminD: 'μg',
    vitaminE: 'mg',
    vitaminK: 'μg',
    vitaminB1: 'mg',
    vitaminB2: 'mg',
    vitaminB3: 'mg',
    vitaminB5: 'mg',
    vitaminB6: 'mg',
    vitaminB7: 'μg',
    vitaminB9: 'μg',
    vitaminB12: 'μg',
    vitaminC: 'mg'
  },
  minerals: {
    calcium: 'mg',
    magnesium: 'mg',
    phosphorus: 'mg',
    potassium: 'mg',
    sodium: 'mg',
    chloride: 'mg',
    chromium: 'μg',
    copper: 'μg',
    fluoride: 'mg',
    iodine: 'μg',
    iron: 'mg',
    manganese: 'mg',
    molybdenum: 'μg',
    selenium: 'μg',
    zinc: 'mg'
  }
} as const;

// 1日の推奨摂取量
const RDI = {
  male: {
    vitamins: {
      vitaminA: 900,  // μg
      vitaminD: 15,   // μg
      vitaminE: 15,   // mg
      vitaminK: 120,  // μg
      vitaminB1: 1.2, // mg
      vitaminB2: 1.3, // mg
      vitaminB3: 16,  // mg
      vitaminB5: 5,   // mg
      vitaminB6: 1.3, // mg
      vitaminB7: 30,  // μg
      vitaminB9: 400, // μg
      vitaminB12: 2.4,// μg
      vitaminC: 90    // mg
    },
    minerals: {
      calcium: 1000,     // mg
      magnesium: 400,    // mg
      phosphorus: 700,   // mg
      potassium: 3400,   // mg
      sodium: 1500,      // mg
      chloride: 2300,    // mg
      chromium: 35,      // μg
      copper: 900,       // μg
      fluoride: 4,       // mg
      iodine: 150,       // μg
      iron: 8,           // mg
      manganese: 2.3,    // mg
      molybdenum: 45,    // μg
      selenium: 55,      // μg
      zinc: 11           // mg
    }
  },
  female: {
    vitamins: {
      vitaminA: 700,  // μg
      vitaminD: 15,   // μg
      vitaminE: 15,   // mg
      vitaminK: 120,  // μg
      vitaminB1: 1.2, // mg
      vitaminB2: 1.3, // mg
      vitaminB3: 16,  // mg
      vitaminB5: 5,   // mg
      vitaminB6: 1.3, // mg
      vitaminB7: 30,  // μg
      vitaminB9: 400, // μg
      vitaminB12: 2.4,// μg
      vitaminC: 90    // mg
    },
    minerals: {
      calcium: 1000,     // mg
      magnesium: 310,    // mg
      phosphorus: 700,   // mg
      potassium: 3400,   // mg
      sodium: 1500,      // mg
      chloride: 2300,    // mg
      chromium: 35,      // μg
      copper: 900,       // μg
      fluoride: 4,       // mg
      iodine: 150,       // μg
      iron: 8,           // mg
      manganese: 2.3,    // mg
      molybdenum: 45,    // μg
      selenium: 55,      // μg
      zinc: 11           // mg
    }
  }
} as const;

// formatMineralValue関数を追加
const formatMineralValue = (name: string, value: number) => {
  // マイクログラム単位のミネラル
  const microgramMinerals = ['chlorine', 'selenium', 'cobalt', 'molybdenum'];
  
  if (microgramMinerals.includes(name)) {
    return `${value}μg`;
  }
  // その他はミリグラム
  return `${value}mg`;
};

// 栄養素の値を小数点第3位までフォーマットする関数
const formatNutrientValue = (value: number): string => {
  return Number(value.toFixed(3)).toString();
};

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
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [showVitaminDetails, setShowVitaminDetails] = useState(false);
  const [showMineralDetails, setShowMineralDetails] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dishName, setDishName] = useState<string>('');

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

  // calculateTotalNutrients関数をコンポーネント内に移動
  const calculateTotalNutrients = () => {
    const vitaminTotal = Object.values(nutrients.totalVitamins).reduce((a, b) => a + b, 0) * 0.001;
    const mineralTotal = Object.values(nutrients.totalMinerals).reduce((a, b) => a + b, 0) * 0.001;
    return { vitaminTotal, mineralTotal };
  };

  const nutrientData = [
    { name: "タンパク質", value: nutrients.totalProtein, color: "#0088FE", percentage: ((nutrients.totalProtein / (nutrients.totalProtein + nutrients.totalCarbs + nutrients.totalFat)) * 100).toFixed(1) },
    { name: "脂質", value: nutrients.totalFat, color: "#00C49F", percentage: ((nutrients.totalFat / (nutrients.totalProtein + nutrients.totalCarbs + nutrients.totalFat)) * 100).toFixed(1) },
    { name: "炭水化物", value: nutrients.totalCarbs, color: "#FFBB28", percentage: ((nutrients.totalCarbs / (nutrients.totalProtein + nutrients.totalCarbs + nutrients.totalFat)) * 100).toFixed(1) },
    { name: "ビタミン", value: calculateTotalNutrients().vitaminTotal, color: "#FF8042", percentage: (calculateTotalNutrients().vitaminTotal / (nutrients.totalProtein + nutrients.totalCarbs + nutrients.totalFat) * 100).toFixed(1) },
    { name: "ミネラル", value: calculateTotalNutrients().mineralTotal, color: "#8884d8", percentage: (calculateTotalNutrients().mineralTotal / (nutrients.totalProtein + nutrients.totalCarbs + nutrients.totalFat) * 100).toFixed(1) }
  ];

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedImage);
      if (dishName.trim()) {
        formData.append('dishName', dishName.trim());
      }
      
      const results = await analyzeImage(selectedImage, dishName.trim());
      
      // 画像をBase64に変換
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        
        // LocalStorageにデータを保存
        localStorage.setItem('analysisResults', JSON.stringify(results));
        localStorage.setItem('analysisImage', JSON.stringify({
          name: selectedImage.name,
          type: selectedImage.type,
          data: base64Data
        }));
        
        router.push('/meal-analysis?tab=analysis');
      };
      reader.readAsDataURL(selectedImage);
      
      toast({
        title: "分析完了",
        description: "結果が保存されました",
      });
    } catch (error) {
      console.error('分析エラー:', error);
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "分析に失敗しました。時間をおいて再度お試しください。",
        variant: "destructive"
      });
      // 分析中の状態をリセット
      setIsAnalyzing(false);
      return;
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
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>食事画像のアップロード</CardTitle>
            <CardDescription>
              分析したい食事の画像をアップロードしてください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ImageUpload
                onImageSelect={handleImageSelect}
                previewUrl={previewUrl}
                dishName={dishName}
                onDishNameChange={setDishName}
              />
              <div className="flex justify-center">
                <Button
                  onClick={handleAnalyze}
                  disabled={!selectedImage || isAnalyzing}
                  className="w-full max-w-sm"
                >
                  {isAnalyzing ? "分析中..." : "分析開始"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">今日の食事概要</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>栄養バランス</CardTitle>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-primary">{nutrients.totalCalories}</p>
              <p className="text-sm text-gray-500">総カロリー (kcal)</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={nutrientData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                    >
                      {nutrientData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                {/* 全ての栄養素を表示（ビタミン・ミネラルを含む） */}
                {nutrientData.map((item) => (
                  <div key={item.name} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-2" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">
                        {item.value.toFixed(1)}g
                      </span>
                      <span className="text-gray-500 text-sm ml-2">
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}

                {/* ビタミン詳細 */}
                <div className="mt-4">
                  <button
                    onClick={() => setShowVitaminDetails(!showVitaminDetails)}
                    className="w-full flex justify-between items-center font-medium mb-2 hover:bg-gray-50 p-2 rounded"
                  >
                    <span>ビタミン詳細</span>
                    {showVitaminDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {showVitaminDetails && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>ビタミンA: {formatNutrientValue(nutrients.totalVitamins.vitaminA)}μg</div>
                      <div>ビタミンD: {formatNutrientValue(nutrients.totalVitamins.vitaminD)}μg</div>
                      <div>ビタミンE: {formatNutrientValue(nutrients.totalVitamins.vitaminE)}mg</div>
                      <div>ビタミンK: {formatNutrientValue(nutrients.totalVitamins.vitaminK)}μg</div>
                      <div>ビタミンB1: {formatNutrientValue(nutrients.totalVitamins.vitaminB1)}mg</div>
                      <div>ビタミンB2: {formatNutrientValue(nutrients.totalVitamins.vitaminB2)}mg</div>
                      <div>ビタミンB3: {formatNutrientValue(nutrients.totalVitamins.vitaminB3)}mg</div>
                      <div>ビタミンB5: {formatNutrientValue(nutrients.totalVitamins.vitaminB5)}mg</div>
                      <div>ビタミンB6: {formatNutrientValue(nutrients.totalVitamins.vitaminB6)}mg</div>
                      <div>ビタミンB7: {formatNutrientValue(nutrients.totalVitamins.vitaminB7)}μg</div>
                      <div>ビタミンB9: {formatNutrientValue(nutrients.totalVitamins.vitaminB9)}μg</div>
                      <div>ビタミンB12: {formatNutrientValue(nutrients.totalVitamins.vitaminB12)}μg</div>
                      <div>ビタミンC: {formatNutrientValue(nutrients.totalVitamins.vitaminC)}mg</div>
                    </div>
                  )}
                </div>

                {/* ミネラル詳細 */}
                <div className="mt-4">
                  <button
                    onClick={() => setShowMineralDetails(!showMineralDetails)}
                    className="w-full flex justify-between items-center font-medium mb-2 hover:bg-gray-50 p-2 rounded"
                  >
                    <span>ミネラル詳細</span>
                    {showMineralDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {showMineralDetails && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>カルシウム: {formatNutrientValue(nutrients.totalMinerals.calcium)}mg</div>
                      <div>リン: {formatNutrientValue(nutrients.totalMinerals.phosphorus)}mg</div>
                      <div>マグネシウム: {formatNutrientValue(nutrients.totalMinerals.magnesium)}mg</div>
                      <div>ナトリウム: {formatNutrientValue(nutrients.totalMinerals.sodium)}mg</div>
                      <div>カリウム: {formatNutrientValue(nutrients.totalMinerals.potassium)}mg</div>
                      <div>硫黄: {formatNutrientValue(nutrients.totalMinerals.sulfur)}mg</div>
                      <div>塩素: {formatNutrientValue(nutrients.totalMinerals.chlorine)}mg</div>
                      <div>鉄: {formatNutrientValue(nutrients.totalMinerals.iron)}mg</div>
                      <div>銅: {formatNutrientValue(nutrients.totalMinerals.copper)}mg</div>
                      <div>亜鉛: {formatNutrientValue(nutrients.totalMinerals.zinc)}mg</div>
                      <div>セレン: {formatNutrientValue(nutrients.totalMinerals.selenium)}mg</div>
                      <div>マンガン: {formatNutrientValue(nutrients.totalMinerals.manganese)}mg</div>
                      <div>ヨウ素: {formatNutrientValue(nutrients.totalMinerals.iodine)}mg</div>
                      <div>コバルト: {formatNutrientValue(nutrients.totalMinerals.cobalt)}mg</div>
                      <div>モリブデン: {formatNutrientValue(nutrients.totalMinerals.molybdenum)}mg</div>
                      <div>クロム: {formatNutrientValue(nutrients.totalMinerals.chromium)}mg</div>
                    </div>
                  )}
                </div>
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
  );
}