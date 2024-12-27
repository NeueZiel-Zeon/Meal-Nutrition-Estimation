"use client";

import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[350px]">
        <div className="p-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              ログイン
            </h1>
            <p className="text-sm text-muted-foreground">
              アカウントにログインしてください
            </p>
          </div>

          <LoginForm />

          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              アカウントをお持ちでない場合は{" "}
              <Link href="/auth/signup" className="text-primary hover:underline">
                新規登録
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
} 