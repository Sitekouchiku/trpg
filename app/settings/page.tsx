// app/settings/page.tsx
// app/settings/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'

// タイトルなどの設定は外に出す
export const metadata: Metadata = {
  title: '設定',
}

export default function SettingsPage() {
  return (
    <main>
      <h1>設定</h1>
      <p>
        設定用のページです。<br />
        {/* href="/profile" のように、先頭に / をつけるのが安全です */}
        <Link href="/settings/profile" className="text-orange-500 hover:underline">
          プロフィール設定はこちら
        </Link>
      </p>
    </main>
  );
}