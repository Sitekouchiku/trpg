'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function NewBoardPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [targetUsername, setTargetUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const createBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. 自分の情報を取得
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ログインが必要です');

      // 2. 相手のusernameからIDを検索
      const { data: opponent, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', targetUsername)
        .single();

      if (userError || !opponent) {
        alert('指定されたユーザー名が見つかりません。');
        return;
      }

      // 3. 秘匿ボードを作成
      const { data: newBoard, error: boardError } = await supabase
        .from('secret_boards')
        .insert({
          title: title,
          kp_id: user.id,      // 作成した人をKPとする
          player_id: opponent.id // 検索した相手をPLとする
        })
        .select()
        .single();

      if (boardError) throw boardError;

      // 4. 完成したらその部屋へ飛ばす
      router.push(`/secret-boards/${newBoard.id}`);
      router.refresh();

    } catch (err) {
      console.error(err);
      alert('作成に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-orange-50 rounded-lg shadow-md mt-10">
      <h1 className="text-xl font-bold text-orange-800 mb-6">新しい秘匿掲示板を作成</h1>
      <form onSubmit={createBoard} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">掲示板タイトル</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例：HO1への秘匿"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">相手のユーザー名（@なし）</label>
          <input 
            type="text" 
            value={targetUsername}
            onChange={(e) => setTargetUsername(e.target.value)}
            placeholder="player_name"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button 
          disabled={loading}
          className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition"
        >
          {loading ? '作成中...' : '掲示板を作成する'}
        </button>
      </form>
    </div>
  );
}