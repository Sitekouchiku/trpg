import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase'; // 自分のsupabaseクライアントのパス
// app/sitemap.ts

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://trpg-amagori.vercel.app';

  // 1. 固定ページ
  const staticPaths = ['', '/wiki', '/dice', '/docs', '/submitform'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));

  // 2. Wiki記事を全件取得
  const { data: posts, error } = await supabase
    .from('wiki_pages')
    .select('title, created_at'); // updated_atがなければcreated_atでOK

  // もしエラーが出ている場合は、固定ページだけ返す（ログはVercelで確認可能）
  if (error || !posts) {
    console.error('Supabase fetch error:', error);
    return staticPaths;
  }

  // 3. Wiki記事をサイトマップ形式に変換
  const wikiPaths = posts.map((post) => ({
    url: `${baseUrl}/wiki/${encodeURIComponent(post.title)}`,
    lastModified: new Date(post.created_at),
  }));

  return [...staticPaths, ...wikiPaths];
}