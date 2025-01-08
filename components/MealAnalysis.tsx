"use client";

import { Card } from "@/components/ui/card";
import { AnalysisResults } from "@/types/analysis";
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useState } from "react";

interface MealAnalysisProps {
  results: AnalysisResults;
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
  phosphorus: 'リン',
  magnesium: 'マグネシウム',
  sodium: 'ナトリウム',
  potassium: 'カリウム',
  sulfur: '硫黄',
  chlorine: '塩素',
  iron: '鉄',
  copper: '銅',
  zinc: '亜鉛',
  selenium: 'セレン',
  manganese: 'マンガン',
  iodine: 'ヨウ素',
  cobalt: 'コバルト',
  molybdenum: 'モリブデン',
  chromium: 'クロム'
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
    phosphorus: 'mg',
    magnesium: 'mg',
    sodium: 'mg',
    potassium: 'mg',
    sulfur: 'mg',
    chlorine: 'mg',
    iron: 'mg',
    copper: 'μg',
    zinc: 'mg',
    selenium: 'μg',
    manganese: 'mg',
    iodine: 'μg',
    cobalt: 'μg',
    molybdenum: 'μg',
    chromium: 'μg'
  }
} as const;

// メインコンポーネント
export function MealAnalysis({ results }: MealAnalysisProps) {
  const [gender, setGender] = useState<'male' | 'female'>('male');

  // ミリグラムをグラムに変換（1mg = 0.001g）
  const vitaminTotal = Object.values(results.nutrients.vitamins)
    .reduce((a, b) => a + b, 0) * 0.001;  // mgからgに変換
  const mineralTotal = Object.values(results.nutrients.minerals)
    .reduce((a, b) => a + b, 0) * 0.001;  // mgからgに変換

  // 栄養素の割合を計算（全てグラム単位で統一）
  const nutrientData = [
    { name: "タンパク質", value: results.nutrients.protein, color: "#0088FE" },
    { name: "脂質", value: results.nutrients.fat, color: "#00C49F" },
    { name: "炭水化物", value: results.nutrients.carbs, color: "#FFBB28" },
    { 
      name: "ビタミン", 
      value: vitaminTotal,
      color: "#FF8042"
    },
    { 
      name: "ミネラル", 
      value: mineralTotal,
      color: "#8884d8"
    }
  ];

  // 合計を計算して割合を表示用に整形
  const totalNutrients = nutrientData.reduce((sum, item) => sum + item.value, 0);
  const nutrientDataWithPercent = nutrientData.map(item => ({
    ...item,
    percentage: ((item.value / totalNutrients) * 100).toFixed(1)
  }));

  return (
    <div className="space-y-6">
      {/* 検出された料理 */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">検出された料理</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.detectedDishes?.map((dish, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-medium">{dish}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 検出された食材と分量 */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">検出された食材と分量</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(results.portions).map(([food, amount]) => (
            <div key={food} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-medium">{food}</span>
              <span>{amount}g</span>
            </div>
          ))}
        </div>
      </Card>

      {/* カロリーと栄養素バランス */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">栄養バランス</h2>
        <div className="text-center mb-6">
          <p className="text-4xl font-bold text-primary">{results.calories}</p>
          <p className="text-sm text-gray-500">総カロリー (kcal)</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 栄養素の円グラフ */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={nutrientDataWithPercent}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                >
                  {nutrientDataWithPercent.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${Number(value).toFixed(2)}g`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 詳細な栄養素情報 */}
          <div className="space-y-6">
            {/* 主要栄養素 */}
            <div className="space-y-2">
              {nutrientDataWithPercent.map((item) => (
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
                      {item.value < 0.01 ? item.value.toFixed(3) : item.value.toFixed(1)}g
                    </span>
                    <span className="text-gray-500 text-sm ml-2">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* ビタミン詳細 */}
            <div>
              <h3 className="font-semibold mb-2">ビタミン詳細</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(results.nutrients.vitamins).map(([name, value]) => (
                  <div key={name} className="flex justify-between">
                    <span>{NUTRIENT_NAMES[name as keyof typeof NUTRIENT_NAMES]}</span>
                    <span>{value}{NUTRIENT_UNITS.vitamins[name as keyof typeof NUTRIENT_UNITS.vitamins]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ミネラル詳細 */}
            <div>
              <h3 className="font-semibold mb-2">ミネラル詳細</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(results.nutrients.minerals).map(([name, value]) => (
                  <div key={name} className="flex justify-between">
                    <span>{NUTRIENT_NAMES[name as keyof typeof NUTRIENT_NAMES]}</span>
                    <span>{value}{NUTRIENT_UNITS.minerals[name as keyof typeof NUTRIENT_UNITS.minerals]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 栄養バランスの改善点 */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">栄養バランスの改善点</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 不足している栄養素 */}
          {results.deficientNutrients.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-2 text-yellow-600">
                不足している栄養素
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                {results.deficientNutrients.map((nutrient, index) => (
                  <li key={index}>{nutrient}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 過剰な栄養素 */}
          {results.excessiveNutrients.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-2 text-red-600">
                過剰な栄養素
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                {results.excessiveNutrients.map((nutrient, index) => (
                  <li key={index}>{nutrient}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 改善提案 */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2 text-green-600">改善提案</h3>
          <ul className="list-disc pl-5 space-y-2">
            {results.improvements.map((improvement, index) => (
              <li key={index}>{improvement}</li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}