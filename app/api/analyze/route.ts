import { Anthropic } from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

// APIルートを動的に設定
export const maxDuration = 300; // 5分
export const dynamic = 'force-dynamic';
export const runtime = 'edge'; // エッジランタイムを使用

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  // 食事分析のエンドポイント
  // POSTメソッドで画像データを受け取り、分析結果を返す
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const dishName = formData.get('dishName') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString('base64');

    console.log('Calling Claude API...');

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        temperature: 0,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: base64Image
              }
            },
            {
              type: "text",
              text: `この食事の写真を分析し、以下の形式のJSONで回答してください：${
                dishName ? `\n\n※この料理は「${dishName}」です。` : ''
              }

              {
              "detectedDishes": [${
                dishName ? `"${dishName}"` : '"料理名1", "料理名2", ...'
              }],
              "foodItems": ["食材1", "食材2", ...],
              "calories": 数値,
              "portions": {
                  "食材1": 100,
                  "食材2": 150,
                  ...
              },
              "nutrients": {
                  "protein": 数値,
                  "fat": 数値,
                  "carbs": 数値,
                  "vitamins": {
                  "vitaminA": 数値,  // マイクログラム
                  "vitaminD": 数値,  // マイクログラム
                  "vitaminE": 数値,  // ミリグラム
                  "vitaminK": 数値,  // マイクログラム
                  "vitaminB1": 数値, // ミリグラム
                  "vitaminB2": 数値, // ミリグラム
                  "vitaminB3": 数値, // ミリグラム
                  "vitaminB5": 数値, // ミリグラム
                  "vitaminB6": 数値, // ミリグラム
                  "vitaminB7": 数値, // マイクログラム
                  "vitaminB9": 数値, // マイクログラム
                  "vitaminB12": 数値,// マイクログラム
                  "vitaminC": 数値   // ミリグラム
                  },
                  "minerals": {
                  "calcium": 数値,    // ミリグラム
                  "phosphorus": 数値,    // ミリグラム
                  "magnesium": 数値,  // ミリグラム
                  "sodium": 数値, // ミリグラム
                  "potassium": 数値,  // ミリグラム
                  "sulfur": 数値,     // ミリグラム
                  "chlorine": 数値,   // マイクログラム
                  "iron": 数値,   // ミリグラム
                  "copper": 数値,     // ミリグラム
                  "zinc": 数値,   // ミリグラム
                  "selenium": 数値,     // マイクログラム
                  "manganese": 数値,       // ミリグラム
                  "iodine": 数値,  // ミリグラム
                  "cobalt": 数値, // マイクログラム
                  "molybdenum": 数値,   // マイクログラム
                  "chromium": 数値        // ミリグラム
                  }
              },
              "deficientNutrients": ["ビタミンA", "カルシウム", ...],
              "excessiveNutrients": ["ナトリウム", "鉄分", ...],
              "improvements": ["改善提案1", "改善提案2", "改善提案3"]
              }

              料理名は、写真から判断できる具体的な料理名を日本語で記載してください。
              例：「ハンバーグ」「味噌汁」「サラダ」など
              
              vitaminsとmineralsは、極端に少ないと判断される場合は0で返してください。
              ビタミンB群やミネラルは、量の推定が難しいので深く考えてください。推定ができないと判断される場合は、0で返してください。
              不足・過剰な栄養素は必ず日本語の栄養素名で返してください。`
            }
          ]
        }],
        system: `あなたは食事の画像分析を行う栄養士アシスタントです。必ず指定されたJSON形式でのみ回答してください。説明文は含めないでください。
                推測した料理名から、画像では見えない部分の栄養素も推測してください。（例：牛丼の場合、写真では見えなくてもお米の栄養素も推測してください。）`
      });

      console.log('Claude Response:', JSON.stringify(response, null, 2));

      const textContent = response.content.find(c => c.type === 'text');
      if (!textContent || !('text' in textContent)) {
        throw new Error('Invalid response format');
      }

      const content = textContent.text;
      console.log('Parsed content:', content);

      const analysisResults = JSON.parse(content);
      return NextResponse.json(analysisResults);

    } catch (apiError: any) {
      console.error('Claude API Error:', apiError);
      return NextResponse.json(
        { 
          error: 'Claude APIエラー',
          details: apiError.message
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Request Error:', error);
    return NextResponse.json(
      { 
        error: '分析リクエストエラー',
        details: error.message
      },
      { status: 500 }
    );
  }
} 