# 当アプリケーションにおけるNext.jsの機能活用

## 1. App Router
### 使用箇所
- `app/`ディレクトリ配下のフォルダ構造によるルーティング
  - `app/page.tsx` - ホームページ
  - `app/dashboard/page.tsx` - ダッシュボード
  - `app/meal-analysis/page.tsx` - 食事分析
  - `app/meal-history/page.tsx` - 食事履歴
  - `app/auth/login/page.tsx` - ログイン

### 利点
- ファイルシステムベースのルーティングにより、直感的なURL構造を実現
- 各ページのコードが独立して管理可能
- 自動的なコード分割によるパフォーマンスの最適化

## 2. Server Components
### 使用箇所
- `app/layout.tsx` - ルートレイアウト
- `app/page.tsx` - メインページ
```typescript
export const dynamic = "force-dynamic";
```

### 利点
- サーバーサイドでのレンダリングによる高速な初期表示
- SEO対策の容易さ
- クライアントサイドのJavaScriptバンドルサイズの削減

## 3. Client Components
### 使用箇所
- `components/MealAnalysis.tsx`
- `components/ChatInterface.tsx`
- `components/ImageUpload.tsx`
```typescript
"use client";
```

### 利点
- インタラクティブな機能の実装
- クライアントサイドでのステート管理
- リアルタイムな更新処理

## 4. API Routes
### 使用箇所
- `app/api/analyze/route.ts` - 食事分析API
- `app/api/chat/route.ts` - チャットAPI
```typescript
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
```

### 利点
- サーバーレス関数としての実行
- エッジでの高速な処理
- APIエンドポイントの簡単な実装

## 5. Middleware
### 使用箇所
- `middleware.ts`
```typescript
export async function middleware(req: NextRequest) {
  // 認証チェックと適切なリダイレクト
}
```

### 利点
- リクエストの前処理による認証制御
- ルーティングの動的な制御
- セキュリティの向上

## 6. 環境変数
### 使用箇所
- `.env.local`での環境変数管理
- `NEXT_PUBLIC_`プレフィックスによるクライアントサイド利用

### 利点
- 開発/本番環境の設定分離
- セキュアな機密情報の管理
- クライアント/サーバー間での適切な変数アクセス制御

## 7. Image Optimization
### 使用箇所
- `next/image`コンポーネントの使用
```typescript
import Image from "next/image";
```

### 利点
- 自動的な画像最適化
- レスポンシブ対応
- 遅延読み込みによるパフォーマンス向上

## 8. Dynamic Imports
### 使用箇所
- コンポーネントの動的インポート
- ページ単位でのコード分割

### 利点
- 必要な時点でのコード読み込み
- 初期ロード時間の短縮
- メモリ使用の最適化

## 9. Layout System
### 使用箇所
- `app/layout.tsx` - グローバルレイアウト
- `app/meal-analysis/layout.tsx` - 分析ページ用レイアウト

### 利点
- 共通UIの効率的な管理
- ネストされたレイアウトの実現
- メタデータの階層的な管理 