import { AnalysisResults, Message } from "@/types/analysis";
import { supabaseClient } from "@/lib/supabase/client";

interface ChatContext {
  context: string;
  imageData?: string;
  analysisResults: AnalysisResults;
  previousMessages?: Message[];
}

export interface ChatHistory {
  id: string;
  analysisId: string;
  messageCount: number;
  messages: Message[];
}

async function compressImage(base64Data: string): Promise<string> {
  try {
    // Base64文字列を適切な形式に変換
    const base64WithHeader = base64Data.includes("data:image/")
      ? base64Data
      : `data:image/jpeg;base64,${base64Data}`;

    // Canvas要素を作成
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    return new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          // 画像サイズをより小さく調整
          let width = img.width;
          let height = img.height;
          const maxWidth = 600;

          if (width > maxWidth) {
            height = Math.floor((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          // より高い圧縮率で圧縮（0.3 = 30%品質）
          const compressedData = canvas.toDataURL("image/jpeg", 0.3);

          // Base64ヘッダーを除去して純粋なBase64データを取得
          const finalData = compressedData.split(",")[1];

          console.log(
            "圧縮後のサイズ:",
            Math.floor((finalData.length * 0.75) / 1024),
            "KB"
          );

          resolve(finalData);
        } catch (error) {
          console.error("画像圧縮エラー:", error);
          reject(error);
        }
      };

      // エラーハンドリングを追加
      img.onerror = () => {
        console.error("画像の読み込みに失敗しました");
        reject(new Error("画像の読み込みに失敗しました"));
      };

      // クロスオリジンの問題を回避
      img.crossOrigin = "anonymous";

      // Base64データをセット
      setTimeout(() => {
        img.src = base64WithHeader;
      }, 0);
    });
  } catch (error) {
    console.error("画像処理エラー:", error);
    throw error;
  }
}

export async function generateAIResponse(
  input: string,
  options: {
    context?: string;
    imageData?: string;
    analysisJson?: AnalysisResults;
  },
  mode: "analyze" | "chat"
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("message", input);

    if (options.analysisJson) {
      formData.append("analysisContext", JSON.stringify(options.analysisJson));
    }

    if (options.imageData) {
      try {
        console.log("画像圧縮を開始します");
        const compressedImage = await compressImage(options.imageData);
        console.log("画像圧縮が完了しました");
        formData.append("imageData", compressedImage);
      } catch (error) {
        console.error("画像圧縮エラー:", error);
        throw new Error("画像の処理に失敗しました");
      }
    }

    // チャットモード
    if (mode === "chat") {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("APIリクエストに失敗しました");
      }

      const data = await response.json();
      return data.response;
    }

    throw new Error("無効なリクエストモードです");
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw error;
  }
}

export function exportChatHistory(messages: Message[]): string {
  return messages
    .map(
      (msg) =>
        `[${new Date(msg.timestamp).toLocaleString()}] ${msg.role}: ${
          msg.content
        }`
    )
    .join("\n");
}

async function generatePrompt(input: string, context: ChatContext): Promise<string> {
  const { analysisResults } = context;
  
  return `
    前回までの会話：
    ${context.previousMessages?.map(m => 
      `${m.role}: ${m.content}`
    ).join('\n')}
    
    検出された料理：
    ${analysisResults.detectedDishes.join('、')}

    詳細な分析結果：
    ${JSON.stringify(analysisResults)}

    ユーザーの質問：${input}
    
    注意：
    - 前回までの会話を踏まえて回答してください
    - 一貫性のある栄養アドバイスを提供してください
  `;
}

export async function createOrGetChatHistory(analysisId: string) {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return null;

  try {
    // upsertを使用して一意性を保証
    const { data: history, error } = await supabaseClient
      .from('chat_histories')
      .upsert(
        { 
          analysis_id: analysisId,
          user_id: user.id,
          message_count: 0
        },
        {
          onConflict: 'analysis_id,user_id',
          ignoreDuplicates: false
        })
      .select()
      .single();

    if (error) throw error;
    return history;

  } catch (error) {
    console.error('Error creating/getting chat history:', error);
    return null;
  }
}

export async function saveChatMessage(
  chatHistoryId: string, 
  message: Message
) {
  if (!chatHistoryId) return;

  const { error: insertError } = await supabaseClient
    .from('chat_messages')
    .insert({
      chat_history_id: chatHistoryId,
      role: message.role,
      content: message.content
    });

  if (insertError) {
    console.error('Error inserting message:', insertError);
    return;
  }

  if (message.role === 'user') {
    // まずRPCを呼び出してカウントを増やす
    await supabaseClient
      .rpc('increment_count', { row_id: chatHistoryId });

    // 更新日時を更新
    const { error: updateError } = await supabaseClient
      .from('chat_histories')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatHistoryId);

    if (updateError) {
      console.error('Error updating message count:', updateError);
    }
  }
}
