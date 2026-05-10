'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function ProfileSettings() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user?.id,
        email: user?.email,
        username: username,
      });

    if (error) {
      alert('そのユーザー名は既に使われているか、無効です。');
    } else {
      alert('ニックネームを登録しました！');
      router.push('/secret-boards'); // 登録後は掲示板一覧へ
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white border-2 border-orange-200 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-orange-800 mb-6">雨氷卓へようこそ</h1>
      <p className="text-sm text-gray-600 mb-4">活動に使用するニックネームを決めてください。</p>
      <form onSubmit={saveProfile} className="space-y-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="例: rin_m"
          className="w-full p-3 border-2 border-orange-100 rounded focus:border-orange-400 outline-none"
          required
        />
        <button
          disabled={loading}
          className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition"
        >
          {loading ? '登録中...' : 'この名前で始める'}
        </button>
      </form>
    </div>
  );
}