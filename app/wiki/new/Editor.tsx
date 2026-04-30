'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

interface EditorProps {
  value: string;
  onChange: (content: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false, // ★ここを追加
    onUpdate: ({ editor }) => {
      // エディタの内容が変更されるたびにHTMLを出力して親に渡す
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return <p>エディタを読み込み中...</p>;
  }

  // ツールバーのボタン用の共通スタイル
  const btnStyle = (isActive: boolean) => ({
    padding: '5px 10px',
    marginRight: '5px',
    backgroundColor: isActive ? '#e2e8f0' : '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#333'
  });

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff' }}>
      
      {/* ツールバー部分 */}
      <div style={{ padding: '10px', backgroundColor: '#f1f5f9', borderBottom: '1px solid #ccc', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={btnStyle(editor.isActive('heading', { level: 2 }))}>
          大見出し
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} style={btnStyle(editor.isActive('heading', { level: 3 }))}>
          小見出し
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={btnStyle(editor.isActive('bold'))}>
          太字
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={btnStyle(editor.isActive('italic'))}>
          斜体
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} style={btnStyle(editor.isActive('strike'))}>
          打消し線
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={btnStyle(editor.isActive('bulletList'))}>
          箇条書き
        </button>
      </div>

      {/* エディタの入力エリア */}
      <div style={{ padding: '20px', minHeight: '300px', cursor: 'text' }} onClick={() => editor.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>

      {/* Tiptapのデフォルトのアウトライン（黒枠）を消すためのCSS */}
      <style jsx global>{`
        .tiptap { outline: none; }
        .tiptap p { margin: 0 0 1rem 0; line-height: 1.6; }
        .tiptap h2 { font-size: 1.5rem; margin-top: 1.5rem; border-bottom: 1px solid #eee; }
        .tiptap h3 { font-size: 1.25rem; margin-top: 1.2rem; }
        .tiptap ul { padding-left: 1.5rem; }
      `}</style>
    </div>
  );
}