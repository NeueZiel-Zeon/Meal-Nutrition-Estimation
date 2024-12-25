import { AnalysisResults, Message } from "@/types/analysis";

export function formatAnalysisContext(results: AnalysisResults): string {
  return `
栄養分析結果:
- 総カロリー: ${results.calories}kcal
- タンパク質: ${results.nutrients.protein}g
- 炭水化物: ${results.nutrients.carbs}g
- 脂質: ${results.nutrients.fat}g
- ビタミンA: ${results.vitamins.vitaminA}%
- ビタミンC: ${results.vitamins.vitaminC}%
- ビタミンD: ${results.vitamins.vitaminD}%
`.trim();
}

export function generateAIResponse(message: string, context: AnalysisResults): Promise<string> {
  // TODO: 実際のAI APIと連携
  return new Promise((resolve) => {
    setTimeout(() => {
      const responses = [
        `分析結果によると、この食事は${context.calories}kcalです。タンパク質が${context.nutrients.protein}gと適度に含まれていますが、炭水化物が${context.nutrients.carbs}gとやや多めです。`,
        "バランスの良い食事のために、野菜を増やすことをお勧めします。",
        "ビタミンCの含有量が良好ですが、ビタミンDを補うために魚類を取り入れることを検討してください。"
      ];
      resolve(responses[Math.floor(Math.random() * responses.length)]);
    }, 1000);
  });
}

export function exportChatHistory(messages: Message[]): string {
  return messages
    .map(msg => `[${new Date(msg.timestamp).toLocaleString()}] ${msg.role}: ${msg.content}`)
    .join('\n');
}