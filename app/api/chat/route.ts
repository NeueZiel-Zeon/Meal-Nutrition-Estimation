import { Anthropic } from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { Message } from "@/types/analysis";

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

const VITAMIN_UNITS = {
  vitaminA: "μg",
  vitaminD: "μg",
  vitaminE: "mg",
  vitaminK: "μg",
  vitaminB1: "mg",
  vitaminB2: "mg",
  vitaminB3: "mg",
  vitaminB5: "mg",
  vitaminB6: "mg",
  vitaminB7: "μg",
  vitaminB9: "μg",
  vitaminB12: "μg",
  vitaminC: "mg",
} as const;

const MINERAL_UNITS = {
  calcium: "mg",
  phosphorus: "mg",
  magnesium: "mg",
  sodium: "mg",
  potassium: "mg",
  sulfur: "mg",
  chlorine: "μg",
  iron: "mg",
  copper: "mg",
  zinc: "mg",
  selenium: "μg",
  manganese: "mg",
  iodine: "mg",
  cobalt: "μg",
  molybdenum: "μg",
  chromium: "mg",
} as const;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const message = formData.get("message") as string | null;
    const analysisData = formData.get("analysisData") as string | null;
    const chatHistory = formData.get("chatHistory") as string | null;

    if (!message || !analysisData) {
      return NextResponse.json(
        { error: "必要なデータが不足しています" },
        { status: 400 }
      );
    }

    const parsedAnalysisData = JSON.parse(analysisData);
    const previousMessages = chatHistory ? JSON.parse(chatHistory) : [];

    console.log("Preparing content for AI...");
    const content: ContentBlock[] = [
      {
        type: "text",
        text: `
        前回までの会話：
        ${previousMessages.map((m: Message) => 
          `${m.role}: ${m.content}`
        ).join('\n')}

        検出された料理：
        ${parsedAnalysisData.detectedDishes?.join("、") || "不明"}

        カロリー：${parsedAnalysisData.calories}kcal

        栄養素：
        - タンパク質：${parsedAnalysisData.nutrients.protein}g
        - 脂質：${parsedAnalysisData.nutrients.fat}g
        - 炭水化物：${parsedAnalysisData.nutrients.carbs}g
        
        ビタミン：
        ${Object.entries(parsedAnalysisData.nutrients.vitamins)
          .map(
            ([name, value]) =>
              `- ${name}: ${value}${
                VITAMIN_UNITS[name as keyof typeof VITAMIN_UNITS]
              }`
          )
          .join("\n    ")}

        ミネラル：
        ${Object.entries(parsedAnalysisData.nutrients.minerals)
          .map(
            ([name, value]) =>
              `- ${name}: ${value}${
                MINERAL_UNITS[name as keyof typeof MINERAL_UNITS]
              }`
          )
          .join("\n    ")}

        ユーザーの質問：${message}`,
      },
    ];

    // 画像URLが存在する場合は画像を追加
    if (parsedAnalysisData.image_url) {
      try {
        const imageResponse = await fetch(parsedAnalysisData.image_url);
        const contentType =
          imageResponse.headers.get("content-type") || "image/jpeg";
        const arrayBuffer = await imageResponse.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString("base64");

        content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: contentType,
            data: base64Data,
          },
        });
        console.log("Image content type:", contentType);
      } catch (error) {
        console.error("Error fetching and converting image:", error);
      }
    }

    console.log("Calling Anthropic API...");
    const stream = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: content as any,
        },
      ],
      stream: true,
      system: `あなたは栄養士として、ユーザーの食事写真を基に、健康的な食生活のアドバイスを提供します。
              以下の形式で回答してください：

              1. 回答は適切な段落に分けて記述
              2. 重要なポイントは改行して箇条書きで表示
              3. 具体的な提案は番号付きリストで表示
              4. 長文の場合は、見出しを付けて内容を整理

              専門的な知識を活かしながら、丁寧な口調で会話してください。
              また、常に人間が読みやすいように見出しや箇条書きを使用することを意識してください。`,
    });

    // ストリーミングレスポンスを作成
    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        let accumulatedText = "";
        let buffer = "";
        
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && 
                'delta' in chunk && 
                'text' in chunk.delta && 
                typeof chunk.delta.text === 'string') {
              accumulatedText += chunk.delta.text;
              buffer += chunk.delta.text;
              
              // バッファが一定サイズになるか、改行文字を含む場合に送信
              if (buffer.length >= 100 || buffer.includes('\n')) {
                controller.enqueue(
                  encoder.encode(
                    JSON.stringify({ response: accumulatedText }) + "\n"
                  )
                );
                buffer = "";
              }
            }
          }
          
          // 残りのバッファがある場合は送信
          if (buffer.length > 0) {
            controller.enqueue(
              encoder.encode(
                JSON.stringify({ response: accumulatedText }) + "\n"
              )
            );
          }
          
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(customStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
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
