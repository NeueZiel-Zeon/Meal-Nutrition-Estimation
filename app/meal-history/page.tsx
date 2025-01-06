"use client";

import { MainNav } from "@/components/dashboard/main-nav";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useToast } from "@/components/ui/use-toast";
import { AnalysisHistory } from "@/components/AnalysisHistory";

export default function MealHistoryPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "ログアウト成功",
        description: "ログイン画面に戻ります",
      });

      router.push("/auth/login");
    } catch (error: any) {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-col md:flex">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              ログアウト
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">食事履歴</h1>
        <div className="max-w-4xl mx-auto">
          <AnalysisHistory />
        </div>
      </div>
    </div>
  );
} 