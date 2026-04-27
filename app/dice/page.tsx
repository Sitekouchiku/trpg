import { Metadata } from 'next';
import DiceClientPage from "./DiceClientPage"; // ステップ1で作ったファイルを読み込む

// タイトル設定はここ（サーバー側）で行う
export const metadata: Metadata = {
  title: 'ダイスロール',
  description: 'ダイスロールを行うサイトです。',
};

export default function Page() {
  // 実際の画面の中身は DiceClientPage に丸投げする
  return <DiceClientPage />;
}