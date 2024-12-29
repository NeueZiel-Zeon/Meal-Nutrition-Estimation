import { AnalysisResults, Message } from "@/types/analysis";

interface ChatContext {
  context: string;
  imageData?: string;
}

async function compressImage(base64Data: string): Promise<string> {
  // Base64データをBlobに変換
  const blob = await fetch(base64Data).then((res) => res.blob());

  // Canvas要素を作成
  const img = new Image();
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  return new Promise((resolve) => {
    img.onload = () => {
      // 画像サイズを調整（例：最大幅1024px）
      let width = img.width;
      let height = img.height;
      const maxWidth = 1024;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // 画像を描画
      ctx?.drawImage(img, 0, 0, width, height);

      // 圧縮して返す（品質0.7）
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };

    img.src = base64Data;
  });
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
      // 画像を圧縮してから追加
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
