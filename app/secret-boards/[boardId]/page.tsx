import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import SecretChat from '@/components/SecretChat';
import Link from 'next/link';

export default async function BoardPage({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch (error) {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  // 掲示板情報とメンバー情報を一気に取得
  const { data: board } = await supabase
    .from('secret_boards')
    .select(`
      *,
      board_members(user_id, profiles(username))
    `)
    .eq('id', boardId)
    .single();

  if (!board) notFound();

  // 自分が管理者(KP)かどうか
  const isOwner = board.kp_id === user.id;

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-screen bg-orange-50/30">
      <header className="flex justify-between items-center mb-6 border-b-2 border-orange-500 pb-2">
        <div>
          <Link href="/secret-boards" className="text-sm text-orange-600 hover:underline">← 一覧</Link>
          <h1 className="text-2xl font-bold text-orange-900">{board.title}</h1>
        </div>
        {isOwner && (
          <span className="bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded font-bold">管理者モード</span>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* メインチャット */}
        <div className="md:col-span-3">
          <SecretChat boardId={boardId} myId={user.id} />
        </div>

        {/* サイドバー（メンバー管理など） */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-100">
            <h2 className="font-bold text-orange-800 mb-3 border-b border-orange-100 pb-1 text-sm">参加者</h2>
            <ul className="text-sm space-y-2">
              {board.board_members.map((m: any) => (
                <li key={m.user_id} className="flex justify-between items-center text-gray-700">
                  <span>{m.profiles.username}</span>
                  {m.user_id === board.kp_id && <span className="text-[10px] bg-gray-100 px-1 rounded text-gray-400">KP</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}