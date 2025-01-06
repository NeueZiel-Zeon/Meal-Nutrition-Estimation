"use client";

import { Upload, LogOut } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MealAnalysis } from "@/components/MealAnalysis";
import { ImageUpload } from "@/components/ImageUpload";
import { ChatInterface } from "@/components/ChatInterface";
import { AnalysisResults } from "@/types/analysis";
import { analyzeImage, getImageContext, saveAnalysisResult } from "@/lib/analyze-image";
import { generateAIResponse } from "@/lib/chat-utils";
import { getServerClient } from '@/lib/supabase/server';
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useToast } from "@/components/ui/use-toast";
import { AnalysisHistory } from "@/components/AnalysisHistory";
import { MainNav } from "@/components/dashboard/main-nav";

export default function Home() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [imageContext, setImageContext] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upload");

  const handleImageSelect = async (file: File) => {
    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // 画像をBase64に変換して保存
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    setImageBase64(base64);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    
    try {
      // 分析実行
      const results = await analyzeImage(selectedImage);
      
      // 分析結果と画像を保存
      await saveAnalysisResult(results, selectedImage);
      
      setAnalysisResults(results);
      setActiveTab("analysis");
      
      toast({
        title: "分析完了",
        description: "結果が保存されました",
      });
    } catch (error) {
      console.error('分析エラー:', error);
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "分析に失敗しました",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

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
        <h1 className="text-4xl font-bold text-center mb-8">食事分析システム</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">画像アップロード</TabsTrigger>
            <TabsTrigger value="analysis" disabled={!analysisResults}>分析結果</TabsTrigger>
            <TabsTrigger value="chat" disabled={!analysisResults}>AIアシスタント</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card className="p-6">
              <ImageUpload
                onImageSelect={handleImageSelect}
                previewUrl={previewUrl}
              />
              
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={handleAnalyze}
                  disabled={!selectedImage || isAnalyzing}
                  className="w-full max-w-sm"
                >
                  {isAnalyzing ? "分析中..." : "分析開始"}
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="analysis">
            {analysisResults && <MealAnalysis results={analysisResults} />}
          </TabsContent>

          <TabsContent value="chat">
            {analysisResults && (
              <ChatInterface 
                analysisResults={analysisResults}
                imageData={imageBase64}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}