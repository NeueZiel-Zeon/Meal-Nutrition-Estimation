import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log('Middleware: Current path:', req.nextUrl.pathname);
  console.log('Middleware: Session exists:', !!session);

  // 認証が必要なパスの配列
  const authRequiredPaths = ['/meal-analysis', '/dashboard', '/meal-history'];

  // 食事分析ページへの直接アクセスを制限
  if (req.nextUrl.pathname.startsWith('/meal-analysis') && 
      !req.nextUrl.searchParams.has('tab')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // 現在のパスが認証必要なパスかチェック
  const isAuthRequired = authRequiredPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  );

  // 認証が必要なパスで未ログインの場合、ログインページへリダイレクト
  if (isAuthRequired && !session) {
    console.log('Middleware: Redirecting to login');
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // ログイン済みユーザーがauth関連ページにアクセスした場合、dashboardへリダイレクト
  if (session && (
    req.nextUrl.pathname.startsWith('/auth/login') ||
    req.nextUrl.pathname.startsWith('/auth/signup')
  )) {
    console.log('Middleware: Redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

// middlewareが適用されるパスを修正
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 