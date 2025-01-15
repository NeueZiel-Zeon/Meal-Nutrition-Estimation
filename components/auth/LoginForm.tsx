"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { supabaseClient } from '@/lib/supabase/client';

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { supabase } = useSupabase();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !session) {
        let errorMessage = "ログインに失敗しました";
        if (error?.message.includes("Invalid login credentials")) {
          errorMessage = "メールアドレスまたはパスワードが間違っています";
        } else if (error?.message.includes("Email not confirmed")) {
          errorMessage = "メールアドレスが未確認です。確認メールをご確認ください";
        }
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      toast({
        title: "ログイン成功",
        description: "分析画面にリダイレクトします",
      });

      await Promise.all([
        router.refresh(),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);

      window.location.href = '/meal-analysis';
    } catch (error: any) {
      setError(error.message || "ログインに失敗しました。入力内容をご確認ください");
      toast({
        title: "ログインエラー",
        description: error.message || "ログインに失敗しました。入力内容をご確認ください",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4">
      {error && (
        <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">パスワード</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>
      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ログイン中...
          </>
        ) : (
          "ログイン"
        )}
      </Button>
    </form>
  );
} 