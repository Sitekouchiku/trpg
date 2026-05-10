import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function SecretBoardsPage() {
  // 修正点1: cookies() を await する
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // 修正点2: get() ではなく getAll() と setAll() を使用する
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // サーバーコンポーネント内からはCookieをセットできないため、
            // ここでエラーをキャッチして無視します（Middleware側で処理されるため問題ありません）
          }
        },
      },
    }
  );

  // 以下、元のデータ取得処理
  const { data: { session } } = await supabase.auth.getSession();

  // 自分が参加している秘匿ボードを取得
  const { data: boards } = await supabase
    .from('secret_boards')
    .select(`
      id,
      title,
      player:profiles!player_id(username),
      kp:profiles!kp_id(username)
    `);

  return (
    <div className="max-w-4xl mx-auto p-6">

        <div className="flex justify-between items-center mb-6 border-b-2 border-orange-500 pb-2">
        <h1 className="text-3xl font-bold text-orange-800">雨氷卓 - 秘匿掲示板</h1>
        <Link href="/secret-boards/new">
            <button className="bg-orange-600 text-white px-4 py-2 rounded-full text-sm hover:bg-orange-700 shadow-md">
            ＋ 新規作成
            </button>
        </Link>
        </div>
      <div className="grid gap-4">
        {boards?.length === 0 && <p className="text-gray-500">現在、公開されている秘匿情報はありません。</p>}
        {boards?.map((board) => {
          // TypeScriptに「これは配列の0番目だよ」と教えてあげる
          const playerProfile = Array.isArray(board.player) ? board.player[0] : board.player;
          const kpProfile = Array.isArray(board.kp) ? board.kp[0] : board.kp;

          return (
            <Link key={board.id} href={`/secret-boards/${board.id}`}>
              <div className="p-4 bg-orange-50 border-l-4 border-orange-500 hover:bg-orange-100 transition cursor-pointer shadow-sm rounded-r">
                <h2 className="font-bold text-lg">{board.title || '無題の秘匿'}</h2>
                <p className="text-sm text-gray-600">
                  KP: {kpProfile?.username} / 対象: {playerProfile?.username}
                </p>
              </div>
            </Link>
          );
          
        })}
      </div>
    </div>
    // app/secret-boards/page.tsx 内のタイトル付近に追加
  );
}