// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // nextパラメータがあればそこへ、なければトップページへリダイレクト
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    
    // サーバー用のSupabaseクライアントを初期化（Cookieの読み書きを設定）
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // Next.jsの仕様上、ここではエラーを無視するハンドリングが必要
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // Server Componentからの呼び出し時はセットできないため無視
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: "", ...options });
            } catch (error) {
              // Server Componentからの呼び出し時は削除できないため無視
            }
          },
        },
      }
    );

    // 取得したcodeをSessionに変換し、Cookieに焼き付ける（黄金ルートの核心）
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // 成功した場合、指定されたパス（デフォルトはトップページ）へリダイレクト
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error("Session exchange error:", error.message);
    }
  }

  // codeが無い、またはエラーになった場合は、エラーパラメータを付けてトップページ等へ戻す
  return NextResponse.redirect(`${origin}/?error=auth_failed`);
}