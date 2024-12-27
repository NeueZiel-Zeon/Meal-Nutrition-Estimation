import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[350px]">
        <div className="p-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              メール確認
            </h1>
            <p className="text-sm text-muted-foreground">
              確認メールを送信しました。メールの指示に従ってアカウントを有効化してください。
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/auth/login" className="text-primary hover:underline">
              ログイン画面に戻る
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
} 