import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Auth from "../components/Auth"; // 今作った部品を読み込む
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '雨氷卓ポータル',
  description: '雨氷卓（TRPG）の情報をまとめるサイトです',
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
        <h2>サイトについて</h2>
        <p>このサイトは、雨氷卓KPが個人的に作成したコンテンツ群です。<br />
           現在、旧サイトから開発環境のリニューアルを行い、{/* */}
           内容の移植並びにサイトのコンテンツ充実化を実施{/* */}
           しております。一部機能は機能の追加・統合のため{/* */}
           名称を変更している場合があります。<br />
           なお、以前のサイト（<a href="https://satsuki-amagori.github.io/portal/">リンク</a>）{/* */}
           は、こちらのサイトへリダイレクト設定をしておりますので、{/* */}
           内容の閲覧はできなくなっております。

        </p>
        <h2>サイトマップ</h2>
        <p>
           ・<a href="/dice">ダイスロール</a><br />
           ・<a href="/wiki">雨氷卓百科事典</a><br />
           ・<a href="/docs">書庫</a><br />
           ・<a href="/secret-boards">秘匿掲示板</a><br />
           ・<a href="/settings">設定</a><br />
           ・<a href="/submitform">編集権について</a><br />
        </p>
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2><a href="/wiki">雨氷卓百科事典</a>の記事（最新５件）</h2>
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
        <p>© 2026 雨氷卓KP</p>
        <p></p>
      </div>
    </div>
  );
}