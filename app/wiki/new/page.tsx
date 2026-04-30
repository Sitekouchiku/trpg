'use client'

import { useState } from "react";
import { supabase } from "@/lib/supabase"; 
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('./Editor'), { ssr: false });

export default function NewWikiPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryInput, setCategoryInput] = useState(""); // カテゴリ入力用
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      alert("タイトルと本文を入力してください");
      return;
    }

    setIsSubmitting(false);
    setIsSubmitting(true);

    // カンマ区切りを配列に変換
    const categoryArray = categoryInput
      .split(',')
      .map(cat => cat.trim())
      .filter(cat => cat !== "");

    const { error } = await supabase
      .from('wiki_pages')
      .insert([{ 
        title, 
        content, 
        category: categoryArray // ★ 既存のcategoryカラムに配列を渡す
      }]);

    if (error) {
      alert("保存エラー: " + error.message);
      setIsSubmitting(false);
    } else {
      router.push(`/wiki/${encodeURIComponent(title)}`);
      router.refresh();
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      <h1>📝 新規記事の作成</h1>

      <form onSubmit={handleSubmit}>
        {/* タイトル入力 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>記事タイトル</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required 
            style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '5px' }}
          />
        </div>

        {/* カテゴリ入力（既存カラム用） */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>
            カテゴリ（「,」区切りで複数入力可）
          </label>
          <input 
            type="text" 
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            placeholder="例: NPC, 地名, 重要"
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
          />
        </div>

        {/* 本文（Tiptapエディタ） */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>本文</label>
          <Editor value={content} onChange={setContent} />
        </div>

        <button type="submit" disabled={isSubmitting} style={{ padding: '12px 40px', backgroundColor: '#34A853', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          {isSubmitting ? "保存中..." : "記事を公開する"}
        </button>
      </form>
    </div>
  );
}