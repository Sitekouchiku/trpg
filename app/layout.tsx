import { Yuji_Syuku } from 'next/font/google';
import './globals.css';
import BrowsingHistory from '@/components/BrowsingHistory';
import GlobalMenu from "@/components/GlobalMenu";
import { createServerClient } from '@supabase/ssr'; // auth-helpers から ssr に変更
import { cookies } from 'next/headers';

const yuji = Yuji_Syuku({ 
  weight: '400',
  subsets: ['latin'], 
  display: 'swap',
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // 1. Cookieの取得 (Next.js 15対応のため await が必要)
  const cookieStore = await cookies();

  // 2. Supabaseクライアントの初期化 (最新の @supabase/ssr を使用)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // サーバーコンポーネントからのCookieセットエラーを無視
          }
        },
      },
    }
  );

  // 3. セッション情報の取得
  // ※RootLayoutでは表示に必要なデータ取得に留めるのがベストプラクティスです
  const { data: { session } } = await supabase.auth.getSession();

  // プロフィール情報が必要な場合はここで取得してもOKですが、
  // リダイレクト処理（未設定なら /settings/profile へ飛ばす等）は、
  // ここではなく middleware.ts に切り出すのが最も安全で確実です。
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', session.user.id)
      .single();
      
    // 必要に応じて profile の情報を GlobalMenu などに渡すことができます
  }

  return (
    <html lang="ja">
      <body className={yuji.className}>
        <meta name="google-site-verification" content="googlec252d31c5620fb17.html" />
        <BrowsingHistory mode="save" />
        <GlobalMenu />
        {/* divをより意味のある main タグに変更（任意） */}
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}