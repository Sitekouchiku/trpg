import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function Home() {
  // 試しに最新の5件の記事を取得してみる
  const { data: posts } = await supabase
    .from('wiki_pages')
    .select('title')
    .limit(5);

  return (
    <div className="container">
      <h1>TRPG百科事典 ポータル</h1>
      
      <section style={{ marginTop: '20px' }}>
        <h2>✅ Supabase 接続完了！</h2>
        <p>あなたの「本棚」と正常につながっています。</p>
      </section>

      <section style={{ marginTop: '40px' }}>
        <h3>最近の記事</h3>
        <ul>
          {posts?.map((post) => (
            <li key={post.title}>
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