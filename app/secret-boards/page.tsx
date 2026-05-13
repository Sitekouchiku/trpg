import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function SecretBoardsListPage() {
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

  // 1. サーバー側で「誰がアクセスしているか」を確実に取得する
  const { data: { user } } = await supabase.auth.getUser();

  // 2. データと「エラー」の両方を受け取る
  const { data: boards, error } = await supabase
    .from('secret_boards')
    .select(`
      id,
      title,
      player:profiles!player_id(username),
      kp:profiles!kp_id(username)
    `);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-end mb-8 border-b-4 border-orange-600 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-orange-900">雨氷卓 - 秘匿掲示板</h1>
          <p className="text-orange-700 mt-1 text-sm">閲覧権限がある秘匿情報のみ表示されています</p>
        </div>
        <Link href="/secret-boards/new">
          <button className="bg-orange-600 text-white px-6 py-2 rounded-full font-bold hover:bg-orange-700 shadow-lg transition-transform hover:scale-105 active:scale-95">
            ＋ 新規作成
          </button>
        </Link>
      </div>

      {/* ログインしていない場合の警告 */}
      {!user && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          ユーザーの認証情報が見つかりません。ログインし直してください。
        </div>
      )}

      {/* エラーが起きた場合は画面に表示する（原因究明用） */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
          <p className="font-bold">データ取得エラーが発生しました:</p>
          <p className="font-mono text-sm mt-2">{error.message}</p>
          <p className="font-mono text-sm mt-1">詳細: {error.details || 'なし'}</p>
        </div>
      )}

      <div className="grid gap-4">
        {(!boards || boards.length === 0) && !error && (
          <div className="py-20 text-center border-2 border-dashed border-orange-200 rounded-xl">
            <p className="text-orange-300 text-lg">現在、関与している秘匿情報はありません。</p>
          </div>
        )}
        
        {boards?.map((board) => {
          const playerProfile = Array.isArray(board.player) ? board.player[0] : board.player;
          const kpProfile = Array.isArray(board.kp) ? board.kp[0] : board.kp;

          return (
            <Link key={board.id} href={`/secret-boards/${board.id}`}>
              <div className="group p-5 bg-white border border-orange-100 rounded-lg shadow-sm hover:shadow-md hover:border-orange-400 transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500 group-hover:w-3 transition-all"></div>
                <h2 className="font-bold text-xl text-gray-800 mb-2 pl-2 group-hover:text-orange-700">
                  {board.title || '無題の秘匿'}
                </h2>
                <div className="pl-2 flex gap-4 text-sm text-gray-500 font-medium">
                  <span><span className="text-orange-600">KP:</span> {kpProfile?.username || '不明'}</span>
                  <span><span className="text-orange-600">対象:</span> {playerProfile?.username || '不明'}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}