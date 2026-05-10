// src/lib/secret-post.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

export async function sendSecretMessage(targetEmail: string, content: string, roomId: string, kpId: string) {
  const { data: receiver } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', targetEmail)
    .single();

  if (!receiver) throw new Error('ユーザーが見つかりません');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('ログインしていません');

  const { error } = await supabase.from('secret_posts').insert({
    sender_id: user.id,
    receiver_id: receiver.id,
    kp_id: kpId,
    content: content,
    room_id: roomId
  });

  if (error) throw error;
}