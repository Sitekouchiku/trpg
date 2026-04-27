"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BrowsingHistory({ mode }: { mode: "save" | "display" }) {
  const [history, setHistory] = useState<{ title: string; url: string }[]>([]);
  const pathname = usePathname(); // 現在のURLパスを取得

  useEffect(() => {
    // 1. 履歴を読み出す（今回はURLとタイトルのセットで保存）
    const saved = JSON.parse(localStorage.getItem("global_history") || "[]");

    if (mode === "save") {
      const currentUrl = window.location.pathname;
      if (currentUrl === "/") {
        return; // ここで処理をストップ
      }
      // 2. 保存モード：現在のページタイトルとURLを保存
      const currentTitle = document.title || "無題のページ";

      // 同じURLがあれば一度消して、最新として先頭に置く
      const newHistory = [
        { title: currentTitle, url: currentUrl },
        ...saved.filter((item: any) => item.url !== currentUrl)
      ].slice(0, 3); // 直近3件

      localStorage.setItem("global_history", JSON.stringify(newHistory));
      setHistory(newHistory);
    } else {
      setHistory(saved);
    }
  }, [mode, pathname]);

  if (mode === "display" && history.length > 0) {
    return (
      <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h4 style={{ margin: "0 0 10px 0", fontSize: "0.9rem" }}>🕒 最近チェックしたページ</h4>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.85rem" }}>
          {history.map((item, index) => (
            <li key={index} style={{ marginBottom: "5px" }}>
              <Link href={item.url} style={{ color: "#0070f3", textDecoration: "none" }}>
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
}