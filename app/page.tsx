import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Auth from "../components/Auth"; // 今作った部品を読み込む
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '雨氷卓ポータル',
  description: '雨氷卓のTRPGセッション情報をまとめるサイトです',
};

// 1. ページの一番上（import文のあたり）にこれを追加してキャッシュを無効化
export const dynamic = 'force-dynamic'; 

export default async function Home() {
  // 2. 作成日時(created_at)の降順（新しい順）で並び替えて取得
  const { data: posts } = await supabase
    .from('wiki_pages')
    .select('title')
    .order('created_at', { ascending: false }) // これが重要！
    .limit(5);

  // ...あとの表示処理はそのまま
  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>雨氷卓ポータル</h1>
      
      {/* ログインエリアを追加 */}
      <section style={{ marginTop: '20px' }}>
        <Auth />
      </section>

      <section style={{ marginTop: '40px' }}>
        <meta name="google-site-verification" content="uq2wZ9OR8DAUpV3OGrCWTt3ug60eiLrjZcBpRxgRox4" />
        <h2>このサイトは何？</h2>
        <p>雨氷卓KPが個人的に作成したサイト群です。<br />現在旧サイトから開発環境のリニューアルを行い、より高度なサイトを構築しています。</p>
        <h2>サイトマップ</h2>
        <p>・<a href="/wiki">雨氷卓百科事典</a><br />・<a href=""></a></p>
      </section>

      <section style={{ marginTop: '40px' }}>
        <h3>最近の<a href="/wiki">雨氷卓百科事典</a>の記事（旧サイトから移植中）</h3>
        <ul>
          {posts?.map((post) => (
            <li key={post.title} style={{ marginBottom: '10px' }}>
              <Link href={`/wiki/${encodeURIComponent(post.title)}`}>
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div style={{ marginTop: '40px', fontSize: '0.9rem', color: '#666' }}>
        <p>※こちらのサイトから作成された記事が、最近の記事に反映されていない事象が発生しております。原因究明までお待ちください。</p>
      </div>
    </div>
  );
}