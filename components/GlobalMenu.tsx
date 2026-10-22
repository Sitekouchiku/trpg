// components/GlobalMenu.tsx
import fs from 'fs';
import path from 'path';
import Link from 'next/link';

// 表示名の対応表(フォルダ名は小文字で書く)
const LABELS: Record<string, string> = {
  wiki: "百科事典",
  dice: "ダイス",
  docs: "書庫",
  "secret-boards": "秘匿掲示板",
  mypage: "マイページ",
  settings: "設定",
};

// 非表示にしたいフォルダ
const EXCLUDE = ["auth", "submitform", "api"];

// トップに直接並べる項目(この順番で表示)
const TOP_ORDER = ["mypage", "settings"];

// 「各種機能」プルダウン内の並び順(ここにないフォルダは末尾に自動追加)
const DROPDOWN_ORDER = ["dice", "wiki", "secret-boards", "docs"];

const toItem = (name: string) => ({
  name: LABELS[name] ?? name.charAt(0).toUpperCase() + name.slice(1),
  path: `/${name}`,
});

// 指定した順に並べ、リストにないものは末尾へ
const sortByOrder = (names: string[], order: string[]) =>
  [...names].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    return (ia === -1 ? Infinity : ia) - (ib === -1 ? Infinity : ib);
  });

export default function GlobalMenu() {
  const appDirectory = path.join(process.cwd(), 'app');

  const allFolders = fs.readdirSync(appDirectory, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name.toLowerCase())
    .filter(name => !name.startsWith('(') && !name.startsWith('_') && !EXCLUDE.includes(name));

  // トップ固定項目(存在するものだけ)
  const topItems = TOP_ORDER.filter(n => allFolders.includes(n)).map(toItem);

  // 残りはプルダウンへ
  const dropdownNames = allFolders.filter(n => !TOP_ORDER.includes(n));
  const dropdownItems = sortByOrder(dropdownNames, DROPDOWN_ORDER).map(toItem);

  const linkStyle = { textDecoration: "none", color: "#333" } as const;

  return (
    <nav style={{ padding: "10px", borderBottom: "1px solid #eee", display: "flex", gap: "20px", alignItems: "center" }}>
      <Link href="/" style={{ fontWeight: "bold" }}>🏠 Home</Link>

      {topItems.map(item => (
        <Link key={item.path} href={item.path} style={linkStyle}>{item.name}</Link>
      ))}

      {dropdownItems.length > 0 && (
        <details style={{ position: "relative" }}>
          <summary style={{ cursor: "pointer", listStyle: "none", color: "#333" }}>
            各種機能 ▾
          </summary>
          <ul
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              margin: 0,
              padding: "8px 0",
              listStyle: "none",
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "6px",
              minWidth: "140px",
              zIndex: 10,
            }}
          >
            {dropdownItems.map(item => (
              <li key={item.path}>
                <Link href={item.path} style={{ ...linkStyle, display: "block", padding: "6px 16px" }}>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      )}
    </nav>
  );
}