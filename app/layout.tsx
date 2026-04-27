// app/layout.tsx のイメージ
import { Yuji_Syuku } from 'next/font/google'; // フォントをインポート
import './globals.css'; // さっき作ったCSSを読み込む
import BrowsingHistory from '@/components/BrowsingHistory';

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
        {/* ★ 全てのページの裏側で「保存」が自動で走るようになります */}
        <BrowsingHistory mode="save" />
        
        {/* children には各ページ（page.tsx）の中身が入ります */}
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
}