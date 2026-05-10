import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import SecretChat from '@/components/SecretChat'; // @が使えない場合は ../../../components/SecretChat

export default async function BoardPage({ params }: { params: { boardId: string } }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return <div>ログインが必要です</div>;

  // ボードの存在確認（RLSにより、権限がないとここではデータが取れず404になります）
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
      <SecretChat boardId={params.boardId} myId={session.user.id} />
    </div>
  );
}