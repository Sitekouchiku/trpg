// components/GlobalMenu.tsx
import fs, { Dirent } from 'fs';
import path from 'path';
import Link from 'next/link';

export default function GlobalMenu() {
  // 1. appディレクトリのパスを取得
  const appDirectory = path.join(process.cwd(), 'app');
  
  // 2. フォルダ一覧を取得して、メニュー項目を生成
  const folders = fs.readdirSync(appDirectory, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory()) // フォルダだけを抽出
    .filter(dirent => !dirent.name.startsWith('(') && !dirent.name.startsWith('_') && dirent.name !== 'api') // 特殊なフォルダを除外
    .filter(dirent => {
        const excludelist = ["auth","[appId]"]// ここに非表示にしたいサイトを入れる
        return !excludelist.includes(dirent.name) && !dirent.name.startsWith('(') && !dirent.name.startsWith('_');
    })
    .map(dirent => {
      // フォルダ名から表示用の名前を作る（例: "dice" -> "Dice"）
      const name = dirent.name.charAt(0).toUpperCase() + dirent.name.slice(1);
      return {
        name: name,
        path: `/${dirent.name}`
      };
    });

  return (
    <nav style={{ padding: "10px", borderBottom: "1px solid #eee", display: "flex", gap: "20px" }}>
      <Link href="/" style={{ fontWeight: "bold" }}>🏠 Home</Link>
      {folders.map((item) => (
        <Link key={item.path} href={item.path} style={{ textDecoration: "none", color: "#333" }}>
          {item.name === "Wiki" ? "📚 Wiki" : 
           item.name === "Dice" ? "🎲 Dice" : 
           item.name === "Docs" ? "📖 Docs" :
           item.name}
        </Link>
      ))}
    </nav>
  );
}