"use client";

import { Upload } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MealAnalysis } from "@/components/MealAnalysis";
import { ImageUpload } from "@/components/ImageUpload";
import { ChatInterface } from "@/components/ChatInterface";
import { AnalysisResults } from "@/types/analysis";
import { analyzeImage, getImageContext } from "@/lib/analyze-image";
import { generateAIResponse } from "@/lib/chat-utils";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [imageContext, setImageContext] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upload");

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    
    try {
      console.log('Starting analysis for file:', selectedImage.name);

      // まず画像の説明テキストを取得（chat/route.tsを使用）
      console.log('Getting image context from chat API...');
      const contextText = await getImageContext(selectedImage);
      console.log('Received context from chat API:', contextText);
      setImageContext(contextText);

      // 次に数値データの分析（analyze/route.tsを使用）
      console.log('Getting numerical analysis...');
      const results = await analyzeImage(selectedImage);
      console.log('Received analysis results:', results);
      setAnalysisResults(results);
      
      setActiveTab("analysis");
    } catch (error) {
      console.error('分析エラー:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">食事分析システム</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">画像アップロード</TabsTrigger>
          <TabsTrigger value="analysis" disabled={!analysisResults}>
            分析結果
          </TabsTrigger>
          <TabsTrigger value="chat" disabled={!imageContext}>
            AIアシスタント
          </TabsTrigger>
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
          {imageContext && (
            <ChatInterface analysisResults={imageContext} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}