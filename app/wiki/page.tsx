import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '雨氷卓百科事典',
  description: '雨氷卓の世界観の解説記事をまとめています。',
};

// 常に最新のデータを取得するための設定
export const revalidate = 0;

export default async function WikiTop() {
  // Supabaseから全記事の「タイトル」と「作成日時」を取得
  // エラーを避けるため、並べ替えも存在する created_at に統一しています
  const { data: posts, error } = await supabase
    .from('wiki_pages')
    .select('id, title, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>エラーが発生しました</h1>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px'}}>
      <header style={{ borderBottom: '3px solid #333', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>📚 雨氷卓 Wiki</h1>
        <Link href="/" style={{ color: '#666', textDecoration: 'none' }}>← ポータルへ</Link>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 250px', gap: '40px' }}>
        {/* メイン：記事リスト */}
        <main>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ borderLeft: '5px solid #4285F4', paddingLeft: '15px' }}>最近の記事</h2>
            <Link href="/wiki/new">
              <button style={{ 
                padding: '10px 20px', 
                backgroundColor: '#34A853', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px', 
                cursor: 'pointer',
                fontWeight: 'bold'
              }}>
                ＋新規記事を作成するボタン<br />（未リンク）
              </button>
            </Link>
          </div>

          {posts && posts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {posts.map((post) => (
                <Link 
                  key={post.id} 
                  href={`/wiki/${encodeURIComponent(post.title)}`}
                  style={{ 
                    textDecoration: 'none', 
                    color: 'inherit',
                    padding: '20px',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    transition: 'box-shadow 0.2s',
                    display: 'block'
                  }}
                >
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '5px', color: '#0070f3' }}>
                    {post.title}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#888' }}>
                    投稿日: {new Date(post.created_at).toLocaleString('ja-JP')}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p style={{ color: '#888', textAlign: 'center', marginTop: '50px' }}>
              まだ記事がありません。右上のボタンから最初の記事を書きましょう！
            </p>
          )}
        </main>

        {/* サイドバー */}
        <aside style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.1rem', marginTop: 0 }}>Wikiについて</h3>
          <p style={{ fontSize: '0.9rem', color: '#444', lineHeight: '1.6' }}>
            ここは雨氷卓のTRPGセッションに関する情報をまとめるWikiです。
            <br />誰でも閲覧可能ですが、編集にはログインが必要です。
            <br />現在サイトを製作中ですので、<span style={{ color: 'red' }}>ログインはできますが編集はできない状況です。</span>よろしくお願いします。
          </p>
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '10px' }}>クイックリンク</h4>
            <ul style={{ fontSize: '0.85rem', paddingLeft: '20px', color: '#0070f3' }}>
              <li style={{ marginBottom: '5px' }}><Link href="/wiki/help">当Wikiについて（現在作成中）</Link></li>
              <li><Link href="/wiki/rules">利用規約（現在作成中）</Link></li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}