import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Auth from "../components/Auth"; // 今作った部品を読み込む
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '雨氷卓ポータル',
  description: '雨氷卓のTRPGセッション情報をまとめるサイトです',
};

export default async function Home() {
  // 試しに最新の5件の記事を取得してみる
  const { data: posts } = await supabase
    .from('wiki_pages')
    .select('title')
    .limit(5);

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>雨氷卓ポータル</h1>
      
      {/* ログインエリアを追加 */}
      <section style={{ marginTop: '20px' }}>
        <Auth />
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2>このサイトは何？</h2>
        <p>雨氷卓KPが個人的に作成したサイト群です。<br />現在旧サイトから開発環境のリニューアルを行い、より高度なサイトを構築しています。</p>
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
        <p>※新しい記事を表示するには、Supabaseの管理画面からデータを追加してください。</p>
      </div>
    </div>
  );
}