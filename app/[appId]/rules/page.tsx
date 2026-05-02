import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import styles from "./rules.module.css";

// 1. 【ここから】インターフェース定義：データの「設計図」を一番上に書きます
interface SystemDoc {
  title: string;
  content: string;
}
// 【ここまで】

export default async function DynamicRulesPage({ 
  params 
}: { 
  params: Promise<{ appId: string }> 
}) {
  const { appId } = await params;

  // 2. データの取得
  const { data, error } = await supabase
    .from("system_docs")
    .select("*")
    .eq("app_id", appId)
    .eq("doc_type", "rules")
    .single();

    // ★ ここに2行、確認用のログを追加します！ ★
  console.log("リクエストされたappId:", appId);
  console.log("Supabaseからのデータ:", data, " / エラー:", error);
  // 3. 型の適用
  const doc = data as SystemDoc;

  // 4. エラーハンドリング
  if (error || !doc) return notFound();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{doc.title}</h1>
      
      <div className={styles.content}>
        {/* doc が SystemDoc 型だとわかっているので、line は自動で文字列として扱われます */}
        {doc.content.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            <br />
          </span>
        ))}
      </div>

      <footer className={styles.footer}>
        <a href={`/${appId}`} style={{ color: '#0070f3' }}>
          ← {appId} アプリへ戻る
        </a>
      </footer>
    </div>
  );
}