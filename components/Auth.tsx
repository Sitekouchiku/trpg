"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
// 履歴コンポーネントを読み込む
import BrowsingHistory from "./BrowsingHistory";

export default function Auth() {
  // ブラウザ用クライアントの初期化
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));
  
  const [user, setUser] = useState<any>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // profilesテーブルからユーザーネームを取得する関数
  const fetchProfileName = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();
      
      if (data && !error) {
        setProfileName(data.username);
      }
    } catch (e) {
      console.error("プロフィール取得エラー:", e);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const getUser = async () => {
      try {
        // 安全なユーザー取得メソッドを使用
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.warn("セッションが見つかりません:", error.message);
          if (isMounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        if (isMounted && user) {
          setUser(user);
          await fetchProfileName(user.id);
        }
      } catch (e) {
        console.error("ユーザー取得中に例外が発生しました:", e);
      } finally {
        // 成功・失敗に関わらず読み込み中を解除
        if (isMounted) setLoading(false);
      }
    };

    getUser();

    // 認証状態の変化を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchProfileName(currentUser.id);
      } else {
        setProfileName(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${window.location.pathname}`,
        // Cookieの巨大化を防ぐため、最小限のパラメータにする
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // 状態を完全にリセットするためにリロード
  };

  if (loading) {
    return (
      <div className="p-4 text-orange-800 font-bold animate-pulse">
        読み込み中...
      </div>
    );
  }

  return (
    <div className="p-4 border border-orange-100 rounded-lg bg-orange-50/30">
      {user ? (
        <div>
          {/* 今回のログイン時刻 */}
          <p style={{ fontWeight: "bold", margin: "10px 0" }} className="text-sm text-gray-600">
            ログイン時刻 : {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('ja-JP') : '取得中...'}
          </p>
          
          {/* ウェルカムメッセージ */}
          <p style={{ fontWeight: "bold", marginBottom: "20px" }} className="text-lg text-orange-900">
            ようこそ！ <span className="text-orange-600 underline">{profileName || user.user_metadata?.name || user.email}</span> さんのマイページです。
          </p>

          <button 
            onClick={handleLogout}
            style={{ 
              padding: "10px 20px", 
              cursor: "pointer",
              backgroundColor: "#fff",
              border: "1px solid #fb923c",
              borderRadius: "4px"
            }}
            className="hover:bg-orange-100 transition-colors"
          >
            ログアウト
          </button>

          {/* 履歴を表示 */}
          <div style={{ marginTop: "20px" }} className="pt-4 border-t border-orange-200">
            <BrowsingHistory mode="display" />
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="mb-4 text-gray-600">セッションを開始して秘匿ボードに参加しましょう</p>
          <button 
            onClick={handleLogin}
            className="bg-orange-600 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-200"
          >
            Googleでログイン
          </button>
        </div>
      )}
    </div>
  );
}