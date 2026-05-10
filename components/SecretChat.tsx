'use client';

import { useEffect, useState, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SecretChat({ boardId, myId }: { boardId: string, myId: string }) {
  const supabase = createClientComponentClient();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const scrollEndRef = useRef<HTMLDivElement>(null);

  // メッセージ取得 & リアルタイム購読
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('secret_messages')
        .select('*, profiles(username)')
        .eq('board_id', boardId)
        .order('created_at', { ascending: true });
      setMessages(data || []);
    };

    fetchMessages();

    const channel = supabase
      .channel(`realtime:secret_${boardId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'secret_messages', 
        filter: `board_id=eq.${boardId}` 
      }, async (payload) => {
        // 新着メッセージに投稿者の名前を紐付ける
        const { data: userData } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', payload.new.sender_id)
          .single();
        
        const newMessage = { ...payload.new, profiles: userData };
        setMessages((prev) => [...prev, newMessage]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [boardId, supabase]);

  // 送信処理
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const { error } = await supabase.from('secret_messages').insert({
      board_id: boardId,
      sender_id: myId,
      content: input,
    });

    if (error) alert("秘匿の送信に失敗しました...");
    setInput('');
  };

  return (
    <div className="flex flex-col h-[70vh] bg-white/80 rounded-lg shadow-inner border border-orange-200">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.sender_id === myId ? 'items-end' : 'items-start'}`}>
            <span className="text-xs text-gray-500 mb-1">{m.profiles?.username}</span>
            <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${
              m.sender_id === myId ? 'bg-orange-500 text-white rounded-tr-none' : 'bg-gray-200 text-gray-800 rounded-tl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={scrollEndRef} />
      </div>
      <form onSubmit={sendMessage} className="p-4 border-t border-orange-100 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="秘匿会話を入力..."
          className="flex-1 p-2 border border-orange-200 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition shadow-md">
          送信
        </button>
      </form>
    </div>
  );
}