"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { getUserAnalyses } from "@/lib/analyze-image";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Image from 'next/image';

interface AnalysisHistoryItem {
  id: string;
  created_at: string;
  calories: number;
  detected_dishes: string[];
  food_items: string[];
  image_url?: string;
  nutrients: {
    protein: number;
    fat: number;
    carbs: number;
  };
}

export function AnalysisHistory() {
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      const data = await getUserAnalyses();
      setAnalyses(data);
    } catch (error) {
      console.error("履歴の取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">読み込み中...</div>;
  }

  if (analyses.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          分析履歴がありません
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">分析履歴</h2>
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日時</TableHead>
              <TableHead>料理</TableHead>
              <TableHead>カロリー</TableHead>
              <TableHead>詳細</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analyses.map((analysis) => (
              <Collapsible
                key={analysis.id}
                open={expandedId === analysis.id}
                onOpenChange={() =>
                  setExpandedId(expandedId === analysis.id ? null : analysis.id)
                }
              >
                <TableRow>
                  <TableCell>
                    {format(new Date(analysis.created_at), "yyyy/MM/dd HH:mm", {
                      locale: ja,
                    })}
                  </TableCell>
                  <TableCell>{analysis.detected_dishes.join(", ")}</TableCell>
                  <TableCell>{analysis.calories}kcal</TableCell>
                  <TableCell>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                  </TableCell>
                </TableRow>
                <CollapsibleContent>
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={4}>
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analysis.image_url && (
                            <div>
                              <h4 className="font-medium mb-2">画像</h4>
                              <Image
                                src={analysis.image_url}
                                alt="食事の写真"
                                width={200}
                                height={200}
                                className="rounded-md object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium mb-2">栄養素</h4>
                            <div className="space-y-2">
                              <div>タンパク質: {analysis.nutrients.protein}g</div>
                              <div>脂質: {analysis.nutrients.fat}g</div>
                              <div>炭水化物: {analysis.nutrients.carbs}g</div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">使用食材</h4>
                            <div className="flex flex-wrap gap-2">
                              {analysis.food_items.map((item, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-primary/10 rounded-md text-sm"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
} 