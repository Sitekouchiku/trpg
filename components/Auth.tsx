"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
// 履歴コンポーネントを読み込む
import BrowsingHistory from "./BrowsingHistory";

export default function Auth() {
  // ブラウザ用クライアントの初期化（Next.jsの再レンダリング対策でuseStateを使用）
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  const [user, setUser] = useState<any>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // profilesテーブルからユーザーネームを取得する関数
  const fetchProfileName = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
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

    const initializeAuth = async () => {
      try {
        // 1. まず現在のユーザーを確認（getUserを使用）
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();

        if (error || !currentUser) {
          if (isMounted) {
            setUser(null);
            setLoading(false);
          }
        } else {
          if (isMounted) {
            setUser(currentUser);
            await fetchProfileName(currentUser.id);
            setLoading(false);
          }
        }
      } catch (e) {
        console.error("初期化エラー:", e);
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    // 2. 状態変化を監視（サインイン/アウト時に即座に反映させるため）
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        const newUser = session?.user ?? null;
        setUser(newUser);
        if (newUser) await fetchProfileName(newUser.id);
        setLoading(false);
      }

      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfileName(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogin = async () => {
    // 確実に「交換所（callback）」を経由させるための設定
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // nextパラメータを含めてリダイレクト先を指定
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("ログインエラー:", error.message);
      alert("ログインに失敗しました。");
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("ログアウトエラー:", error.message);
    }
    // 状態を完全にクリアするためにリロード（必須ではないが確実）
    window.location.reload();
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
          <p className="text-sm text-gray-600 font-bold my-[10px]">
            ログイン時刻 :{" "}
            {user.last_sign_in_at
              ? new Date(user.last_sign_in_at).toLocaleString("ja-JP")
              : "取得中..."}
          </p>

          {/* ウェルカムメッセージ */}
          <p className="text-lg text-orange-900 font-bold mb-[20px]">
            ようこそ！{" "}
            <span className="text-orange-600 underline">
              {profileName || user.user_metadata?.full_name || user.email}
            </span>{" "}
            さんのマイページです。
          </p>

          <button
            onClick={handleLogout}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
              backgroundColor: "#fff",
              border: "1px solid #fb923c",
              borderRadius: "4px",
            }}
            className="hover:bg-orange-100 transition-colors"
          >
            ログアウト
          </button>

          {/* 履歴を表示 */}
          <div className="mt-[20px] pt-4 border-t border-orange-200">
            <BrowsingHistory mode="display" />
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="mb-4 text-gray-600">
            セッションを開始して秘匿ボードに参加しましょう
          </p>
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