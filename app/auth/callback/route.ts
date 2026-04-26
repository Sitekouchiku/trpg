import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    // ちゃんと待つ（Next.js 15のルール）
    const cookieStore = await cookies();

    // 最新の @supabase/ssr を使った安全な書き方
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // エラーを握りつぶす（サーバー側の制約回避）
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {
              // エラーを握りつぶす
            }
          },
        },
      }
    );

    await supabase.auth.exchangeCodeForSession(code);
  }

  // ログイン成功後、トップページへ戻る
  return NextResponse.redirect(origin);
}