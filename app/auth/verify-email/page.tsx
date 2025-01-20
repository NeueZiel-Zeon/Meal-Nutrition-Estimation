"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 pb-4 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">メール確認</h1>
            <p className="text-gray-500">
              確認メールを送信しました。<br />
              メールをご確認の上、記載されているリンクをクリックしてください。
            </p>
          </div>

          <div className="text-center">
          <p className="text-gray-500">
              ※確認メールが届かない場合は、
              <br />迷惑メールフォルダ等もご確認ください
          </p>
            <Button variant="link" className="text-sm" asChild>
              <Link href="/auth/login">
                ログイン画面に戻る
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 