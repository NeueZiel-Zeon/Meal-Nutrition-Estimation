import { AnalysisResults, Message } from "@/types/analysis";

interface ChatContext {
  context: string;
  imageData?: string;
}

async function compressImage(base64Data: string): Promise<string> {
  try {
    // Base64のヘッダー部分を処理
    const base64WithoutHeader = base64Data.replace(
      /^data:image\/\w+;base64,/,
      ""
    );

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
          const maxWidth = 600; // 最大幅をさらに小さく

          if (width > maxWidth) {
            height = Math.floor((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          // より高い圧縮率で圧縮（0.3 = 30%品質）
          const compressedData = canvas.toDataURL("image/jpeg", 0.3);

          // Base64ヘッダーを除去
          const finalData = compressedData.split(",")[1];

          console.log(
            "圧縮後のサイズ:",
            Math.floor((finalData.length * 0.75) / 1024),
            "KB"
          );

          resolve(finalData); // ヘッダーなしのBase64データを返す
        } catch (error) {
          console.error("画像圧縮エラー:", error);
          reject(error);
        }
      };

      img.onerror = (error) => {
        console.error("画像読み込みエラー:", error);
        reject(error);
      };

      img.src = base64Data;
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
      // Base64文字列を圧縮して送信
      const compressedImage = await compressImage(options.imageData);
      formData.append("imageData", compressedImage);
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
