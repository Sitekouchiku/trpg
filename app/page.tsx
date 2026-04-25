export default function Home() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>🛠️ Supabase 接続テスト</h1>
      <div style={{ background: "#f0f0f0", padding: "20px", borderRadius: "8px" }}>
        <p><strong>URLの設定:</strong> {url ? "✅ 設定済み" : "❌ 未設定"}</p>
        <p><strong>Keyの設定:</strong> {key ? "✅ 設定済み" : "❌ 未設定"}</p>
      </div>
      {url && key ? (
        <p style={{ color: "green", marginTop: "20px" }}>
          🚀 完璧です！これでデータベースを操作する準備が整いました。
        </p>
      ) : (
        <p style={{ color: "red", marginTop: "20px" }}>
          ⚠️ 設定がまだ反映されていないようです。VercelのEnvironment Variablesを再確認してください。
        </p>
      )}
    </div>
  );
}