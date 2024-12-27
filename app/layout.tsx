import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import SupabaseProvider from '@/components/providers/SupabaseProvider';
import SupabaseListener from '@/components/providers/SupabaseListener';
import { getServerClient } from '@/lib/supabase/server';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '食事分析アプリ',
  description: '食事の写真から栄養分析を行うアプリケーション',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = getServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <SupabaseProvider session={session}>
          <SupabaseListener serverAccessToken={session?.access_token} />
          {children}
          <Toaster />
        </SupabaseProvider>
      </body>
    </html>
  );
}
