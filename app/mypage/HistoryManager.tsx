"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type History = {
  id: number;
  page_id: number;
  title: string;
  content: string | null;
  saved_at: string;
};

export default function HistoryManager() {
  const [items, setItems] = useState<History[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("wiki_page_history")
      .select("id, page_id, title, content, saved_at")
      .order("saved_at", { ascending: false })
      .limit(50);
    if (error) setMessage("履歴の取得に失敗しました: " + error.message);
    else setItems((data as History[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const restore = async (h: History) => {
    if (!confirm(`「${h.title}」を ${new Date(h.saved_at).toLocaleString("ja-JP")} の状態に戻しますか?`)) return;
    setBusyId(h.id);
    setMessage(null);
    const { error } = await supabase.rpc("restore_wiki_history", { history_id: h.id });
    if (error) setMessage("復元に失敗しました: " + error.message);
    else {
      setMessage("復元しました。");
      await load(); // 復元前の状態も履歴に増えるので再読込
    }
    setBusyId(null);
  };

  if (loading) return <p>読み込み中...</p>;

  return (
    <div>
      {message && <p style={{ color: message === "復元しました。" ? "green" : "crimson" }}>{message}</p>}
      {items.length === 0 ? (
        <p>履歴はまだありません。</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {items.map((h) => (
            <li key={h.id} style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                <div>
                  <strong>{h.title}</strong>
                  <div style={{ fontSize: "0.8rem", color: "#666" }}>
                    {new Date(h.saved_at).toLocaleString("ja-JP")} / {(h.content ?? "").length.toLocaleString()}文字
                  </div>
                </div>
                <button
                  onClick={() => restore(h)}
                  disabled={busyId === h.id}
                  style={{ padding: "6px 12px", cursor: "pointer" }}
                >
                  この版に戻す
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}