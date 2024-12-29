import { Anthropic } from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

type ContentBlock = {
  type: "text" | "image";
  text?: string;
  source?: {
    type: "base64";
    media_type: string;
    data: string;
  };
};

export const maxDuration = 300; // 5分
export const dynamic = "force-dynamic";
export const runtime = "edge";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 4 * 1024 * 1024) {
      // 4MB制限
      return NextResponse.json(
        { error: "リクエストサイズが大きすぎます（制限: 4MB）" },
        { status: 413 }
      );
    }

    const response = NextResponse.next();

    // CORSヘッダーを設定
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const message = formData.get("message") as string | null;
    const imageContext = formData.get("imageContext") as string | null;

    // 画像分析モード
    if (file) {
      const bytes = await file.arrayBuffer();
      const base64Image = Buffer.from(bytes).toString("base64");

      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: file.type as
                    | "image/jpeg"
                    | "image/png"
                    | "image/gif"
                    | "image/webp",
                  data: base64Image,
                },
              },
              {
                type: "text",
                text: "この食事の写真を見て、栄養バランスや健康的な食事についてアドバイスできるように、写真の内容を詳しく観察してください",
              },
            ],
          },
        ],
        system:
          "あなたは栄養士として、ユーザーの食事写真を基に、健康的な食生活のアドバイスを提供します。専門的な知識を活かしながら、丁寧な口調で会話してください。",
      });

      // content[0]がテキストであることを確認
      const textContent = response.content.find((c) => c.type === "text");
      if (!textContent || !("text" in textContent)) {
        throw new Error("Invalid response format");
      }

      return NextResponse.json({
        imageContext: textContent.text,
      });
    }

    // チャットモード
    if (message && imageContext) {
      const content: ContentBlock[] = [
        {
          type: "text",
          text: `前提の文脈: ${imageContext}\n\nユーザーの質問: ${message}`,
        },
      ];

      if (formData.get("imageData")) {
        content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: "image/jpeg",
            data: formData.get("imageData") as string,
          },
        });
      }

      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: content as any,
          },
        ],
        system: `あなたは栄養士として、ユーザーの食事写真を基に、健康的な食生活のアドバイスを提供します。
                以下の形式で回答してください：

                1. 回答は適切な段落に分けて記述
                2. 重要なポイントは改行して箇条書きで表示
                3. 具体的な提案は番号付きリストで表示
                4. 長文の場合は、見出しを付けて内容を整理

                専門的な知識を活かしながら、丁寧な口調で会話してください。
                また、常に人間が読みやすいように見出しや箇条書きを使用することを意識してください。`,
      });

      const textContent = response.content.find((c) => c.type === "text");
      if (!textContent || !("text" in textContent)) {
        throw new Error("Invalid response format");
      }

      return NextResponse.json({
        response: textContent.text,
      });
    }

    return NextResponse.json(
      { error: "無効なリクエストです" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "APIリクエストに失敗しました" },
      { status: 500 }
    );
  }
}

// OPTIONSリクエストのハンドリングを追加
export async function OPTIONS() {
  const response = new NextResponse(null, {
    status: 204,
  });

  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  return response;
}
