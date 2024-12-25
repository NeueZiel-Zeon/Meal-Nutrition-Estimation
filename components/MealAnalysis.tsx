"use client";

import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface NutrientData {
  protein: number;
  carbs: number;
  fat: number;
}

interface VitaminData {
  vitaminA: number;
  vitaminC: number;
  vitaminD: number;
}

interface AnalysisResults {
  calories: number;
  nutrients: NutrientData;
  vitamins: VitaminData;
}

interface MealAnalysisProps {
  results: AnalysisResults;
}

export function MealAnalysis({ results }: MealAnalysisProps) {
  const nutrientData = [
    { name: "タンパク質", value: results.nutrients.protein },
    { name: "炭水化物", value: results.nutrients.carbs },
    { name: "脂質", value: results.nutrients.fat },
  ];

  const vitaminData = [
    { name: "ビタミンA", value: results.vitamins.vitaminA },
    { name: "ビタミンC", value: results.vitamins.vitaminC },
    { name: "ビタミンD", value: results.vitamins.vitaminD },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">栄養分析結果</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-semibold mb-4">総カロリー</h3>
            <p className="text-4xl font-bold text-primary">
              {results.calories} kcal
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">主要栄養素 (g)</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={nutrientData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">ビタミン含有量 (%)</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={vitaminData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}