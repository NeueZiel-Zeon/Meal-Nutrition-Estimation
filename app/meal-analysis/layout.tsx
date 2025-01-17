import { Metadata } from "next";

export const metadata: Metadata = {
  title: "食事分析 | 食事栄養分析アプリ",
  description: "食事の写真から栄養価を分析します。",
};

export default function MealAnalysisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 