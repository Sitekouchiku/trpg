'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr'; // ここを変更
import { useRouter } from 'next/navigation';

export default function ProfileSettings() {
  // 環境変数を使ってブラウザ用クライアントを作成
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("ログインセッションが切れています。");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        username: username,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error(error);
      alert(`エラー: ${error.message}`);
    } else {
      alert('ニックネームを登録しました！');
      router.push('/secret-boards');
      router.refresh();
    }
    setLoading(false);
  };

  // ... (return以降のJSXは変更なしでOK)
  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white border-2 border-orange-200 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-orange-800 mb-6">ニックネーム</h1>
      <p className="text-sm text-gray-600 mb-4">新規登録・変更はすべてこのページで行えます。</p>
      <form onSubmit={saveProfile} className="space-y-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="どんな文字でも対応してます"
          className="w-full p-3 border-2 border-orange-100 rounded focus:border-orange-400 outline-none"
          required
        />
        <button
          disabled={loading}
          className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition"
        >
          {loading ? '登録中...' : '名前を登録（変更）'}
        </button>
      </form>
    </div>
  );
}