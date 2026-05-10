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

  if (isLoading) return <div className="p-4">読み込み中...</div>;

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      {user ? (
        <div className="space-y-3">
          <div className="border-b pb-2">
            <h3 className="text-sm text-gray-500">ユーザー名：</h3>
            <p className="text-lg font-bold">
              {/* 優先順位: DBのユーザー名 > Googleの名前 > メールアドレス */}
              {profileName || user.user_metadata?.full_name || user.email}
            </p>
          </div>

          <div>
            <h3 className="text-sm text-gray-500">ログイン時刻：</h3>
            <p className="text-sm text-gray-700">
              {formatDateTime(user.last_sign_in_at)}
            </p>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            ログアウト
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-4 text-gray-600">ログインすると、認証が必要な項目を閲覧できます。</p>
          <button
            onClick={handleGoogleLogin}
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Googleでログイン
          </button>
        </div>
      )}
    </div>
  );
}