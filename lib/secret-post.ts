// src/lib/secret-post.ts
import { createBrowserClient } from '@supabase/ssr'

// ブラウザ側で動作するクライアントを作成
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function sendSecretMessage(targetEmail: string, content: string, roomId: string, kpId: string) {
  // 1. 受信者のプロフィール(id)を取得
  const { data: receiver } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', targetEmail)
    .single();

  if (!receiver) throw new Error('ユーザーが見つかりません');

  // 2. 自分のユーザー情報を取得
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('ログインしていません');

  // 3. メッセージを投稿
  const { error } = await supabase.from('secret_posts').insert({
    sender_id: user.id,
    receiver_id: receiver.id,
    kp_id: kpId,
    content: content,
    room_id: roomId
  });

  if (error) throw error;
}