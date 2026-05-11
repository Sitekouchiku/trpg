import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase'; // 自分のsupabaseクライアントのパス

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://trpg-amagori.vercel.app';

  // 1. 固定のページ
  const staticPaths = [
    '',
    '/wiki',
    '/dice',
    '/docs',
    '/submitform',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));

  // 2. Supabaseから全Wiki記事のタイトルを取得
  const { data: posts } = await supabase
    .from('wiki_pages')
    .select('title, updated_at');

  const wikiPaths = (posts || []).map((post) => ({
    url: `${baseUrl}/wiki/${encodeURIComponent(post.title)}`,
    lastModified: new Date(post.updated_at || new Date()),
  }));

  return [...staticPaths, ...wikiPaths];
}