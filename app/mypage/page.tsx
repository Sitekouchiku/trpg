"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import LockManager from "./LockManager";
import HistoryManager from "./HistoryManager";

type Role = "user" | "admin";

export default function MyPage() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<Role>("user");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setLoggedIn(true);

      const { data: roleData } = await supabase.rpc("my_role");
      setRole(roleData === "admin" ? "admin" : "user");

      const { data: prof } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();
      setUsername(prof?.username ?? null);

      setLoading(false);
    };
    load();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/mypage` },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/mypage";
  };

  const container = { maxWidth: "800px", margin: "0 auto", padding: "20px" } as const;
  const card = { border: "1px solid #ddd", borderRadius: "8px", padding: "16px", marginTop: "20px" } as const;
  const button = {
    backgroundColor: "#005faf", color: "white", border: "none",
    padding: "10px 20px", borderRadius: "5px", fontWeight: "bold", cursor: "pointer",
  } as const;

  if (loading) {
    return <div style={container}>読み込み中...</div>;
  }

  // 未ログイン = 執筆者
  if (!loggedIn) {
    return (
      <div style={container}>
        <h1>マイページ</h1>
        <section style={card}>
          <h2 style={{ marginTop: 0 }}>現在の資格:執筆者</h2>
          <p>一部コンテンツの作成ができます。編集・削除はできません。</p>
        </section>
        <section style={card}>
          <h2 style={{ marginTop: 0 }}>編集者になるには</h2>
          <p>
            Googleアカウントでログインすると「編集者」になり、Lockedされていない記事を編集できます。
          </p>
          <button onClick={handleLogin} style={button}>Googleでログイン</button>
        </section>
        <p style={{ marginTop: "30px" }}>
          <Link href="/wiki">記事一覧へ</Link>
        </p>
      </div>
    );
  }

  // ログイン済み
  const isAdmin = role === "admin";

  return (
    <div style={container}>
      <h1>マイページ</h1>
      <p>ユーザー名：{username ?? "名無しさん"}</p>

      <section style={card}>
        <h3 style={{ marginTop: 0 }}>
          現在の資格:{isAdmin ? "管理者(認定編集者)" : "編集者"}
        </h3>
        {isAdmin ? (
          <p>すべてのコンテンツの作成・編集・削除ができます。Lockedの設定もできます。</p>
        ) : (
          <p>
            一部コンテンツの作成と編集ができます。Lockedされたコンテンツの編集と、記事の削除はできません。
          </p>
        )}
      </section>

      {isAdmin && (
        <section style={card}>
          <h3 style={{ marginTop: 0 }}>管理者メニュー</h3>

          <h4>記事のLock設定</h4>
          <p style={{ fontSize: "0.9rem", color: "#666" }}>
            チェックを入れた記事は、編集者が編集できなくなります。
          </p>
          <LockManager />

          <h4 style={{ marginTop: "32px" }}>編集履歴(直近50件)</h4>
          <p style={{ fontSize: "0.9rem", color: "#666" }}>
            更新前の内容が自動保存されています。「この版に戻す」で復元できます。
          </p>
          <HistoryManager />
        </section>
      )}

      <div style={{ marginTop: "30px", display: "flex", gap: "16px", alignItems: "center" }}>
        <Link href="/wiki">記事一覧へ</Link>
        <button onClick={handleLogout} style={{ ...button, backgroundColor: "#888" }}>
          ログアウト
        </button>
      </div>
    </div>
  );
}