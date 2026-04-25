// app/layout.tsx のイメージ
import { Yuji_Syuku } from 'next/font/google'; // フォントをインポート
import './globals.css'; // さっき作ったCSSを読み込む

const yuji = Yuji_Syuku({ 
  weight: '400',
  subsets: ['latin'], 
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      {/* classNameに yuji.className を入れることで、サイト全体に適用されます */}
      <body className={yuji.className}>
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
}