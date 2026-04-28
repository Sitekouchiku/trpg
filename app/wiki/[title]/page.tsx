import { supabase } from "../../../lib/supabase";
import { notFound } from "next/navigation";
import type { Metadata } from "next";


// 1. 動的にメタデータを設定（ブラウザのタブ名にタイトルを反映）
export async function generateMetadata({ params }: { params: Promise<{ title: string }> }): Promise<Metadata> {
  const { title } = await params;
  const decodedTitle = decodeURIComponent(title);
  return {
    title: `${decodedTitle} - Wiki`,
  };
}

export default async function WikiPage({ params }: { params: Promise<{ title: string }> }) {
  // 2. URLパラメータの解決とデコード
  const resolvedParams = await params;
  const title = decodeURIComponent(resolvedParams.title);

  // 3. Supabaseから記事データを取得
  const { data: post, error } = await supabase
    .from('wiki_pages')
    .select('*')
    .eq('title', title)
    .maybeSingle();

  // 記事がない、またはエラーの場合は404ページを表示
  if (error || !post) {
    notFound();
  }

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      
      {/* 4. カテゴリ表示（配列対応） */}
      <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {post.category && Array.isArray(post.category) && post.category.length > 0 ? (
          post.category.map((cat: string) => (
            <span key={cat} style={{ 
              backgroundColor: '#f0f0f0', 
              padding: '4px 12px', 
              borderRadius: '16px', 
              fontSize: '0.75rem',
              color: '#555',
              fontWeight: 'bold',
              border: '1px solid #ddd'
            }}>
              {cat}
            </span>
          ))
        ) : (
          <span style={{ fontSize: '0.75rem', color: '#999' }}>カテゴリなし</span>
        )}
      </div>

      {/* 5. 記事タイトル */}
      <h1 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginTop: '0', fontSize: '2rem' }}>
        {post.title}
      </h1>

      {/* 6. 記事本文（HTMLとして描画） */}
      <article 
        className="wiki-content"
        style={{ lineHeight: '1.8', fontSize: '1.1rem', marginTop: '20px' }}
        dangerouslySetInnerHTML={{ __html: post.content }} 
      />

      {/* 7. フッター（戻るリンク） */}
      <div style={{ marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <a href="/" style={{ color: '#005faf', textDecoration: 'none', fontWeight: 'bold' }}>
          ← ポータルへ戻る
        </a>
      </div>
    </div>
  );
}