'use client';

import { useState, useEffect, useCallback } from 'react';
// ここを最新のライブラリに切り替えています
import { createBrowserClient } from '@supabase/ssr';

export default function SecretChat({ boardId, myId }: { boardId: string; myId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');

  // ブラウザ用クライアントの初期化
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from('secret_messages')
      .select('*')
      .eq('board_id', boardId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("履歴取得エラー:", error);
    } else {
      setMessages(data || []);
    }
  }, [boardId, supabase]);

  useEffect(() => {
    fetchMessages();

    // リアルタイム通信の設定
    const channel = supabase
      .channel(`chat:${boardId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'secret_messages', 
          filter: `board_id=eq.${boardId}` 
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId, supabase, fetchMessages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const { error } = await supabase.from('secret_messages').insert({
      board_id: boardId,
      sender_id: myId,
      content: input,
    });

    if (error) {
      console.error("送信エラー:", error);
      alert("送信に失敗しました");
    } else {
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white border-2 border-orange-200 rounded-lg shadow-inner">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 mt-10 text-sm italic font-serif">
            ――まだ秘匿は語られていません。
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_id === myId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                msg.sender_id === myId
                  ? 'bg-orange-600 text-white rounded-tr-none'
                  : 'bg-orange-100 text-gray-800 rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              <span className="block text-[10px] mt-1 opacity-70 text-right">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-orange-100 bg-orange-50 rounded-b-lg">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-3 border-2 border-orange-100 rounded-lg focus:outline-none focus:border-orange-400 resize-none h-14 text-sm"
            placeholder="メッセージを入力..."
          />
          <button
            type="submit"
            className="bg-orange-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-700 transition-all active:scale-95 shadow-md"
          >
            送信
          </button>
        </div>
      </form>
    </div>
  );
}