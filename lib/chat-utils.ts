import { AnalysisResults, Message } from "@/types/analysis";

interface ChatContext {
  context: string;
  imageData?: string;
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
  },
  mode: "analyze" | "chat"
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("message", input);

    if (options.context) {
      formData.append("imageContext", options.context);
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

    // 分析モード - 画像から食事内容の説明を取得
    if (mode === "analyze" && options instanceof File) {
      formData.append("file", options);

      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("APIリクエストに失敗しました");
      }

      const data = await response.json();
      return data.imageContext; // 画像の分析結果テキストを返す
    }

    // チャットモード
    if (mode === "chat" && !("type" in options)) {
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
