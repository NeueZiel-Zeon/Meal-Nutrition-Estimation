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
    const formData = await request.formData();
    const message = formData.get("message") as string | null;
    const analysisData = formData.get("analysisData") as string | null;

    if (!message) {
      return NextResponse.json(
        { error: "メッセージが必要です" },
        { status: 400 }
      );
    }

    if (!analysisData) {
      return NextResponse.json(
        { error: "分析データが必要です" },
        { status: 400 }
      );
    }

    const parsedAnalysisData = JSON.parse(analysisData);

    console.log("Preparing content for AI...");
    const content: ContentBlock[] = [
      {
        type: "text",
        text: `
        検出された料理：
        ${parsedAnalysisData.detected_dishes?.join('、') || '不明'}

        カロリー：${parsedAnalysisData.calories}kcal

        栄養素：
        - タンパク質：${parsedAnalysisData.nutrients.protein}g
        - 脂質：${parsedAnalysisData.nutrients.fat}g
        - 炭水化物：${parsedAnalysisData.nutrients.carbs}g

        不足している栄養素：
        ${parsedAnalysisData.deficient_nutrients?.join('、')}

        過剰な栄養素：
        ${parsedAnalysisData.excessive_nutrients?.join('、')}

        改善点：
        ${parsedAnalysisData.improvements?.join('\n')}

        ユーザーの質問：${message}`,
      },
    ];

    // 画像URLが存在する場合は画像を追加
    if (parsedAnalysisData.image_url) {
      try {
        // 画像をフェッチ
        const imageResponse = await fetch(parsedAnalysisData.image_url);
        // Content-Typeを取得
        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
        const arrayBuffer = await imageResponse.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString('base64');
        
        content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: contentType,
            data: base64Data,
          },
        });
        console.log('Image content type:', contentType);
      } catch (error) {
        console.error('Error fetching and converting image:', error);
      }
    }

    console.log("Calling Anthropic API...");
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

    console.log("Processing AI response...");
    const textContent = response.content[0];
    if (!textContent || !("text" in textContent)) {
      throw new Error("Invalid response format");
    }

    return NextResponse.json({
      response: textContent.text,
    });

  } catch (error) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
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

