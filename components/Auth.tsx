"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";

export default function Auth() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 現在のログイン状態を取得
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    // ログイン・ログアウトの変更をリアルタイムで検知
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // 現在のページ(例: /rooms/123)を取得し、nextパラメータに付与
        redirectTo: `${window.location.origin}/auth/callback?next=${window.location.pathname}`,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // 読み込み中の表示
  if (loading) {
    return <div>読み込み中...</div>;
  }

  // 画面のUI部分をしっかり return する
  return (
    <div>
      {user ? (
        <div>
          <p>ログイン中: {user.email}</p>
          <button 
            onClick={handleLogout}
            style={{ padding: "8px 16px", cursor: "pointer" }}
          >
            ログアウト
          </button>
        </div>
      ) : (
        <button 
          onClick={handleLogin}
          style={{ padding: "8px 16px", cursor: "pointer" }}
        >
          Googleでログイン
        </button>
      )}
    </div>
  );
}