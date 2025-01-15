"use client";

import { LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MealAnalysis } from "@/components/MealAnalysis";
import { ChatInterface } from "@/components/ChatInterface";
import { AnalysisResults } from "@/types/analysis";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useToast } from "@/components/ui/use-toast";
import { MainNav } from "@/components/dashboard/main-nav";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const id = searchParams.get("id");
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] =
    useState<AnalysisResults | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalysisSaved, setIsAnalysisSaved] = useState(false);
  const [savedAnalysisId, setSavedAnalysisId] = useState<string | null>(null);

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  useEffect(() => {
    if (tab === "analysis" && !id) {
      try {
        // LocalStorageからデータを取得
        const storedResults = localStorage.getItem("analysisResults");
        const storedImage = localStorage.getItem("analysisImage");

        if (storedResults) {
          setAnalysisResults(JSON.parse(storedResults));
        }

        if (storedImage) {
          const imageData = JSON.parse(storedImage);
          const blob = new Blob(
            [Uint8Array.from(atob(imageData.data), (c) => c.charCodeAt(0))],
            { type: imageData.type }
          );
          const file = new File([blob], imageData.name, {
            type: imageData.type,
          });
          setImageFile(file);
        }

        // データを使用後はLocalStorageから削除
        localStorage.removeItem("analysisResults");
        localStorage.removeItem("analysisImage");
      } catch (error) {
        console.error("Failed to parse analysis results:", error);
      }
    }
  }, [searchParams, tab, id]);

  // カレンダーからの遷移時の処理
  useEffect(() => {
    if (id) {
      const fetchAnalysis = async () => {
        try {
          const { data, error } = await supabase
            .from("meal_analyses")
            .select("*")
            .eq("id", id)
            .single();

          if (error) throw error;

          if (data) {
            // DBのデータ形式をフロントエンド用に変換
            const formattedData: AnalysisResults = {
              detectedDishes: data.detected_dishes || [],
              foodItems: data.food_items || [],
              calories: data.calories,
              portions: data.portions || {},
              nutrients: {
                protein: data.nutrients.protein,
                fat: data.nutrients.fat,
                carbs: data.nutrients.carbs,
                vitamins: data.nutrients.vitamins || {},
                minerals: data.nutrients.minerals || {},
              },
              deficientNutrients: data.deficient_nutrients || [],
              excessiveNutrients: data.excessive_nutrients || [],
              improvements: data.improvements || [],
              imageUrl: data.image_url,
            };

            setAnalysisResults(formattedData);
            setSavedAnalysisId(id);
            setIsAnalysisSaved(true);
          }
        } catch (error) {
          console.error("Failed to fetch analysis:", error);
          toast({
            title: "エラー",
            description: "分析データの取得に失敗しました",
            variant: "destructive",
          });
        }
      };

      fetchAnalysis();
    }
  }, [id, supabase, toast]);

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

  const handleAnalysisSave = async () => {
    setIsAnalysisSaved(true);
    try {
      const { data: latestAnalysis } = await supabase
        .from("meal_analyses")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (latestAnalysis) {
        // DBのデータ形式をフロントエンド用に変換
        const formattedData: AnalysisResults = {
          detectedDishes: latestAnalysis.detected_dishes || [],
          foodItems: latestAnalysis.food_items || [],
          calories: latestAnalysis.calories,
          portions: latestAnalysis.portions || {},
          nutrients: {
            protein: latestAnalysis.nutrients.protein,
            fat: latestAnalysis.nutrients.fat,
            carbs: latestAnalysis.nutrients.carbs,
            vitamins: latestAnalysis.nutrients.vitamins || {},
            minerals: latestAnalysis.nutrients.minerals || {},
          },
          deficientNutrients: latestAnalysis.deficient_nutrients || [],
          excessiveNutrients: latestAnalysis.excessive_nutrients || [],
          improvements: latestAnalysis.improvements || [],
          imageUrl: latestAnalysis.image_url,
        };
        setAnalysisResults(formattedData);
        setSavedAnalysisId(latestAnalysis.id);
      }
    } catch (error) {
      console.error("Error fetching saved analysis:", error);
    }
  };

  return (
    <>
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

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">食事分析結果</h1>

        <Tabs defaultValue="analysis" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analysis">分析結果</TabsTrigger>
            <TabsTrigger value="chat" disabled={!isAnalysisSaved}>
              AIアシスタント
              {!isAnalysisSaved && (
                <span className="ml-2 text-xs">(保存後に利用可能)</span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis">
            {analysisResults && (
              <MealAnalysis
                results={analysisResults}
                imageFile={imageFile || undefined}
                onSaveComplete={handleAnalysisSave}
                hideButton={!!id}
              />
            )}
          </TabsContent>

          <TabsContent value="chat">
            {isAnalysisSaved && analysisResults && (
              <ChatInterface
                analysisResults={analysisResults}
                imageData={imageBase64}
                analysisId={savedAnalysisId}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
