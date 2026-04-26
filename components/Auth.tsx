"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";

export default function Auth() {
  // 最新の @supabase/ssr を使ったクライアントの呼び出し方
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

    // ログイン・ログアウトの変更をリアルタイムで検知する
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

    const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // 固定のURLではなく、今開いているサイトのURLを自動取得する
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // 読み込み中の一瞬のチラつきを防ぐ
  if (loading) {
    return <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>読み込み中...</div>;
  }

  return (
    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
      {user ? (
        <div>
          {/* 名前が取得できない場合はメールアドレスを表示 */}
          <p style={{ fontWeight: "bold" }}>👤 {user.user_metadata?.full_name || user.email} さん</p>
          <button 
            onClick={handleLogout} 
            style={{ 
              cursor: "pointer", 
              marginTop: "10px", 
              padding: "6px 12px", 
              borderRadius: "4px", 
              border: "1px solid #ccc" 
            }}
          >
            ログアウト
          </button>
        </div>
      ) : (
        <div>
          <p style={{ marginBottom: "10px" }}>編集に参加するにはログインしてください</p>
          <button 
            onClick={handleLogin}
            style={{ 
              padding: "8px 16px", 
              backgroundColor: "#4285F4", 
              color: "white", 
              border: "none", 
              borderRadius: "4px", 
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Googleでログイン
          </button>
        </div>
      )}
    </div>
  );
}