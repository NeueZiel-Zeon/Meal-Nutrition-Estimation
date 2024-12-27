"use client";

import { Card } from "@/components/ui/card";
import { SignUpForm } from "@/components/auth/SignUpForm";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[350px]">
        <div className="p-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              アカウント作成
            </h1>
            <p className="text-sm text-muted-foreground">
              必要な情報を入力してください
            </p>
          </div>

          <SignUpForm />

          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              すでにアカウントをお持ちの場合は{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                ログイン
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
} 