# Meal Nutrition Estimation

食事の写真から栄養価を分析し、健康的な食生活をサポートするWebアプリケーション

## 主な機能

- 🍽️ **食事写真の分析**: 
  - 写真をアップロードするだけで、AIが食事内容を認識
  - 詳細な栄養価情報（カロリー、タンパク質、脂質、炭水化物など）を提供
  - ビタミンやミネラルなどの微量栄養素も分析

- 📊 **ダッシュボード**:
  - 日々の栄養摂取状況をグラフィカルに表示
  - 期間別の栄養摂取傾向分析
  - 最近の食事記録の確認

- 💬 **AIチャットサポート**:
  - 分析結果に基づいた栄養アドバイス
  - 食事改善のためのレコメンデーション
  - 健康的な食生活に関する質問対応

- 📱 **ユーザー管理**:
  - セキュアなアカウント管理
  - 食事記録の保存と履歴表示
  - メールによる認証システム

## 技術スタック

- **フロントエンド**: Next.js, TypeScript, Tailwind CSS, shadcn/ui
- **バックエンド**: Supabase, Anthropic Claude API
- **認証**: Supabase Auth
- **データ可視化**: Recharts

## セットアップ手順

1. リポジトリのクローン:
```bash
git clone https://github.com/NeueZiel-Zeon/Meal-Nutrition-Estimation.git
cd Meal-Nutrition-Estimation
```

2. 依存関係のインストール:
```bash
npm install
```

3. 環境変数の設定:
`.env.local`ファイルを作成し、必要な環境変数を設定:
```
ANTHROPIC_API_KEY=your_anthropic_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=your_site_url
```

4. 開発サーバーの起動:
```bash
npm run dev
```

## 使用方法

1. アカウントを作成またはログイン
2. ダッシュボードから「食事分析」を選択
3. 食事の写真をアップロード
4. AIによる分析結果を確認
5. 必要に応じてAIチャットで詳細なアドバイスを受ける

## リリース戦略

### Phase 1: iOS版
- **プラットフォーム**: iOS
- **ターゲット**: 日本市場
- **選定理由**: 健康意識が高く、アプリへの支払い意欲が高い

### Phase 2: Android版
- **プラットフォーム**: Android
- **リリース時期**: iOS版リリース後3ヶ月
- **戦略**: iOS版でのフィードバックを活かした展開

### 料金プラン: フリーミアムモデル

#### 無料プラン機能
- 基本的な食事分析（1日3回まで）
- 基本的な栄養情報表示

#### プレミアムプラン機能
- 無制限の食事分析
- 詳細な栄養アドバイス
- AIチャット機能
- データのエクスポート

## チャット機能強化案
- 古いチャット履歴の自動削除（例：30日以上前）
- メッセージ内容の長さ制限
- 1分析あたりのチャット回数制限
- 必要に応じて有料プランへのアップグレード検討

## ライセンス

MIT
