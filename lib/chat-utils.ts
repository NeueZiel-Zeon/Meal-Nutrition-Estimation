import { AnalysisResults, Message } from "@/types/analysis";

export async function generateAIResponse(
  message: string, 
  analysisResults: AnalysisResults | File | string,
  mode: 'analyze' | 'chat' = 'chat'
): Promise<string> {
  try {
    const formData = new FormData();

    // 分析モード - 画像から食事内容の説明を取得
    if (mode === 'analyze' && analysisResults instanceof File) {
      formData.append('file', analysisResults);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('APIリクエストに失敗しました');
      }

      const data = await response.json();
      return data.imageContext; // 画像の分析結果テキストを返す
    }

    // チャットモード
    if (mode === 'chat') {
      formData.append('message', message);
      formData.append('imageContext', analysisResults.toString());

      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('APIリクエストに失敗しました');
      }

      const data = await response.json();
      return data.response;
    }

    throw new Error('無効なリクエストモードです');
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}

export function exportChatHistory(messages: Message[]): string {
  return messages
    .map(msg => `[${new Date(msg.timestamp).toLocaleString()}] ${msg.role}: ${msg.content}`)
    .join('\n');
}