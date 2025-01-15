"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SignUpForm } from "@/components/auth/SignUpForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 pb-4 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">アカウント作成</h1>
            <p className="text-gray-500">新しいアカウントを作成してください</p>
          </div>

          <SignUpForm />

          <div className="text-center">
            <Button variant="link" className="text-sm" asChild>
              <Link href="/auth/login">
                既にアカウントをお持ちの方はこちら
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 