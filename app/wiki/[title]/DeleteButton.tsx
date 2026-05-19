"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";

export function DeleteButton({ id, title }: { id: string; title: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // 1. 誤操作防止の確認
    if (!confirm(`「${title}」を本当に削除しますか？\n（この操作は取り消せません）`)) return;

    setIsDeleting(true);

    // 2. Supabaseに削除リクエストを送信
    const { error } = await supabase
      .from("wiki_pages")
      .delete()
      .eq("id", id);

    if (error) {
      alert(`削除に失敗しました: ${error.message}\n※管理者としてログインしているか確認してください。`);
      setIsDeleting(false);
    } else {
      alert("記事を削除しました。");
      window.location.href = "/"; // 削除完了後はポータル（トップ）に戻す
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      style={{ 
        backgroundColor: isDeleting ? '#aaa' : '#d9534f', 
        color: 'white', 
        border: 'none', 
        padding: '10px 20px', 
        borderRadius: '5px', 
        fontSize: '0.9rem', 
        fontWeight: 'bold', 
        cursor: isDeleting ? 'not-allowed' : 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      {isDeleting ? "削除中..." : "🗑️ この記事を削除する"}
    </button>
  );
}