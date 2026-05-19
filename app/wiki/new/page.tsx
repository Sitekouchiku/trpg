'use client'

import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from 'next/dynamic';
import { useSearchParams } from "next/navigation"; 
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

const Editor = dynamic(() => import('./Editor'), { ssr: false });

export default function NewWikiPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editTitle = searchParams.get("edit");

  // ★追加: 編集対象のレコードIDを記憶するステート
  const [postId, setPostId] = useState<string | number | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryInput, setCategoryInput] = useState(""); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(!!editTitle); 

  // 編集モードの場合に既存データを取得してセットする
  useEffect(() => {
    if (editTitle) {
      const fetchOriginalPost = async () => {
        const { data, error } = await supabase
          .from("wiki_pages")
          .select("*")
          .eq("title", editTitle)
          .maybeSingle();

        if (data && !error) {
          setPostId(data.id); // ★重要: データベース上のIDをここで記憶する
          setTitle(data.title);
          setContent(data.content);
          
          if (data.category && Array.isArray(data.category)) {
            setCategoryInput(data.category.join(", "));
          }
          
          setIsEditMode(true);
        }
        setIsLoading(false); 
      };

      fetchOriginalPost();
    }
  }, [editTitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      alert("タイトルと本文を入力してください");
      return;
    }

    setIsSubmitting(true);

    const categoryArray = categoryInput
      .split(',')
      .map(cat => cat.trim())
      .filter(cat => cat !== "");

    if (isEditMode && postId) {
      // ーーー 🔑【編集（UPDATE）処理】 ーーー
      console.log("IDで狙い撃ち更新します。対象ID:", postId);

      const { data, error } = await supabase
        .from('wiki_pages')
        .update({
          title,
          content,
          category: categoryArray
        })
        .eq('id', postId) // ★変更: タイトルではなく、一意の「id」を条件にして確実に更新する
        .select();

      if (error) {
        alert("❌ 更新エラーが発生しました:\n" + error.message);
        setIsSubmitting(false);
      } else if (!data || data.length === 0) {
        alert("⚠️ 警告: セキュリティルール（RLS）にブロックされたか、対象のデータが見つかりませんでした。");
        setIsSubmitting(false);
      } else {
        alert("✨ 記事を更新しました！");
        window.location.href = `/wiki/${encodeURIComponent(title)}`;
      }

    } else {
      // ーーー 📝【新規作成（INSERT）処理】 ーーー
      const { error } = await supabase
        .from('wiki_pages')
        .insert([{ 
          title, 
          content, 
          category: categoryArray
        }]);

      if (error) {
        alert("保存エラー: " + error.message);
        setIsSubmitting(false);
      } else {
        alert("記事を公開しました！");
        window.location.href = `/wiki/${encodeURIComponent(title)}`;
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', textAlign: 'center' }}>
        <p style={{ fontSize: '1.2rem', color: '#666' }}>記事データを読み込み中...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      <h1>{isEditMode ? "🔑 記事の編集" : "📝 新規記事の作成"}</h1>

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

        {/* カテゴリ入力 */}
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

        <button type="submit" disabled={isSubmitting} style={{ padding: '12px 40px', backgroundColor: isEditMode ? '#f0ad4e' : '#34A853', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          {isSubmitting ? "保存中..." : isEditMode ? "更新を保存する" : "記事を公開する"}
        </button>
      </form>
    </div>
  );
}