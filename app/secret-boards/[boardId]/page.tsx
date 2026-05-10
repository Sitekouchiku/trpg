import { createServerClient } from '@supabase/ssr'; // 変更
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation'; // redirectを追加
import SecretChat from '@/components/SecretChat';

export default async function BoardPage({ params }: { params: { boardId: string } }) {
  const cookieStore = cookies();

  // サーバー用クライアントの作成
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value;
        },
      },
    }
  );

  // 安全なユーザー取得方法に変更
  const { data: { user } } = await supabase.auth.getUser();

  // ログインしていない場合はログイン画面（またはトップ）へ
  if (!user) {
    redirect('/'); 
  }

  // ボードの存在確認
  const { data: board } = await supabase
    .from('secret_boards')
    .select('*')
    .eq('id', params.boardId)
    .single();

  if (!board) notFound();

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <a href="/secret-boards" className="text-orange-600 hover:underline">← 一覧に戻る</a>
      </div>
      <h1 className="text-xl font-bold mb-4 text-orange-900 leading-tight">
        {board.title} <span className="text-sm font-normal text-gray-500">(秘匿会話)</span>
      </h1>
      {/* user.id を渡す */}
      <SecretChat boardId={params.boardId} myId={user.id} />
    </div>
  );
}