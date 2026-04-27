"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
// 履歴コンポーネントを読み込む（パスは作成した場所に合わせて調整してください）
import BrowsingHistory from "./BrowsingHistory";

export default function Auth() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${window.location.pathname}`,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div>
      {user ? (
        <div>
          {/* 今回のログイン時刻 */}
          <p style={{ fontWeight: "bold", margin: "10px 0" }}>
            ログイン時刻 : {new Date(user.last_sign_in_at).toLocaleString('ja-JP')}
          </p>
          
          {/* ウェルカムメッセージ */}
          <p style={{ fontWeight: "bold", marginBottom: "20px" }}>
            ようこそ！ {user.user_metadata?.name || user.email} さんのマイページです。
          </p>

          <button 
            onClick={handleLogout}
            style={{ 
              padding: "10px 20px", 
              cursor: "pointer",
              backgroundColor: "#f5f5f5",
              border: "1px solid #999",
              borderRadius: "4px"
            }}
          >
            ログアウト
          </button>

          {/* ★ ここが追加：ログアウトボタンのすぐ下に履歴を表示 */}
          <div style={{ marginTop: "20px" }}>
            <BrowsingHistory mode="display" />
          </div>
        </div>
      ) : (
        <button 
          onClick={handleLogin}
          style={{ padding: "10px 20px", cursor: "pointer" }}
        >
          Googleでログイン
        </button>
      )}
    </div>
  );
}