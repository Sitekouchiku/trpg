import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 1. Supabaseクライアントの初期化
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 2. セッションの取得（これでセッションの有効期限が更新されます）
  const { data: { session } } = await supabase.auth.getSession();

  // 3. アクセス制御のロジック
  const url = new URL(request.url);

  // ログインしていない場合、トップページかログインページ以外ならリダイレクト
  // ※ここはプロジェクトの構成に合わせて調整してください
  if (!session && url.pathname.startsWith('/secret-boards')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. プロフィール未設定（ニックネームなし）のチェック
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', session.user.id)
      .single();

    // ニックネームがなく、かつ現在「設定画面」にいない場合のみリダイレクト
    if (!profile?.username && url.pathname !== '/settings/profile') {
      return NextResponse.redirect(new URL('/settings/profile', request.url));
    }
  }

  return response;
}

// 5. Middlewareを適用するパスの設定
export const config = {
  matcher: [
    /*
     * 次のパスを除外して実行する:
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化)
     * - favicon.ico (ファビコン)
     * - public フォルダ内の画像など
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};