"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Page = { id: number; title: string; locked: boolean };

export default function LockManager() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("wiki_pages")
        .select("id, title, locked")
        .order("title", { ascending: true });
      if (error) {
        setMessage("記事の取得に失敗しました: " + error.message);
      } else {
        setPages((data as Page[]) ?? []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const toggle = async (page: Page) => {
    const next = !page.locked;
    setSavingId(page.id);
    setMessage(null);

    // 先に画面を更新(失敗したら戻す)
    setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, locked: next } : p)));

    const { error } = await supabase.rpc("set_wiki_locked", {
      page_id: page.id,
      new_locked: next,
    });

    if (error) {
      setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, locked: page.locked } : p)));
      setMessage("更新に失敗しました: " + error.message);
    }
    setSavingId(null);
  };

  if (loading) return <p>読み込み中...</p>;

  return (
    <div>
      {message && <p style={{ color: "crimson" }}>{message}</p>}
      {pages.length === 0 ? (
        <p>記事がありません。</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {pages.map((page) => (
            <li
              key={page.id}
              style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}
            >
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={page.locked}
                  disabled={savingId === page.id}
                  onChange={() => toggle(page)}
                />
                <span>{page.title}</span>
                {page.locked && <span style={{ fontSize: "0.8rem" }}>🔒</span>}
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}