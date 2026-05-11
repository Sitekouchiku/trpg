"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function Auth() {
  const [user, setUser] = useState<any>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ログイン時刻を整形する関数
  const formatDateTime = (dateString: string) => {
    if (!dateString) return "不明";
    return new Date(dateString).toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      try {
        // 1. ユーザー情報の取得
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // 2. SupabaseのDB(profilesテーブル)からユーザー名を取得しようと試みる
          // ※テーブル名やカラム名はご自身の環境に合わせて調整してください
          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", user.id)
            .single();

          if (profile?.username) {
            setProfileName(profile.username);
          }
        }
      } catch (error) {
        console.error("データ取得エラー:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getData();

    // 認証状態の監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_OUT") {
        setProfileName(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // ログイン処理
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) alert(error.message);
  };

  // ログアウト処理
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("ログアウトに失敗しました");
    } else {
      // 画面をリロードして状態をリセット
      window.location.reload();
    }
  };

  if (isLoading) return <div className="p-4">読み込み中..</div>;

return (
    <div className="p-8 max-w-md mx-auto bg-white border-2 border-orange-100 rounded-3xl shadow-xl space-y-6">
      {user ? (
        <div className="space-y-6 text-center">
          {/* 文章形式の表示 */}
          <div className="space-y-2">
            <p className="text-lg text-orange-900 leading-relaxed">
              ようこそ、<span className="text-orange-600 font-extrabold underline decoration-orange-300 underline-offset-4">
                {profileName || user.user_metadata?.full_name || user.email}
              </span> さん！
            </p>
            <p className="text-xs text-orange-700/70 font-medium">
              ログイン時刻は <span className="text-orange-800">{formatDateTime(user.last_sign_in_at)}</span> です。<br /><br />
              初回ログイン時は<a href="/settings" className="text-blue-500 hover:underline">Settings</a>⇒プロフィール設定はこちらからニックネームを登録してください。
              ニックネームを登録すると、秘匿会話や掲示板でその名前が表示されるようになります。
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSignOut}
              className="w-full py-2.5 text-orange-400 border border-orange-200 rounded-xl hover:bg-orange-50 hover:text-orange-500 hover:border-orange-300 transition-all duration-300 text-sm font-bold tracking-widest"
            >
              ログアウト
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-6 py-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-orange-600 tracking-tighter">ログイン</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              ログインすると、秘匿会話や限定機能へアクセスできます。
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="group relative w-full py-4 bg-linear-to-br from-orange-500 via-orange-600 to-amber-500 text-white rounded-full font-black shadow-[0_4px_20px_rgba(249,115,22,0.4)] hover:shadow-[0_6px_25px_rgba(249,115,22,0.5)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="text-lg">Googleでログイン</span>
            </span>
            {/* 太陽の光のようなホバーエフェクト */}
            <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </button>
        </div>
      )}
    </div>
  );
}