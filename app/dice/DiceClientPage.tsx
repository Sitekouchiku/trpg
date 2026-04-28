"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function DicePage() {
  const [numDice, setNumDice] = useState(1);
  const [numSides, setNumSides] = useState(100);
  
  // 文字列ではなくHTMLタグ（JSX）を保存できるように React.ReactNode に変更
  const [resultNode, setResultNode] = useState<React.ReactNode>("結果がここに表示されます");
  const [isRolling, setIsRolling] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // setIntervalのIDをReact内で安全に保持するためのRef
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const router = useRouter();

  const rollDice = (sides: number, count: number) => {
    return Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
  };

  const handleRoll = () => {
    if (isRolling || numDice <= 0 || numSides <= 0) return;

    setIsRolling(true);
    setResultNode("ロール中...");

    // 前回のインターバルがもし残っていたら確実に消す
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // 音楽の安全なリセットと再生
    if (audioRef.current) {
      audioRef.current.pause(); // 一旦停止させることでバグを防ぐ
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Audio error:", e));
    }

    // シャッフル演出（0.1秒ごと）
    intervalRef.current = setInterval(() => {
      const tempResults = rollDice(numSides, numDice);
      setResultNode(`ロール中: ${tempResults.join(", ")}`);
    }, 100);
  };

  // ★音声が終わった時に呼ばれる関数（Audioタグから直接呼び出す）
  const handleAudioEnded = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const finalResults = rollDice(numSides, numDice);
    const total = finalResults.reduce((sum, v) => sum + v, 0);

    let specialNode: React.ReactNode = null;

    // --- 1d100の特殊判定（クリティカル/ファンブルの赤文字演出を復活） ---
    if (numDice === 1 && numSides === 100) {
      const rollResult = finalResults[0];
      if (rollResult === 1) {
        specialNode = (
          <span>
            <span style={{ color: "red", fontWeight: "bold" }}>　確定的クリティカル！　</span>
            <span style={{ color: "black", fontSize: "0.7em" }}>
              <br />（技能成長は以下）<br />１クリ：1d100<br />２～５クリ：1d20<br />成功：1d5<br />失敗：+1<br />ファンブル：なし
            </span>
          </span>
        );
      } else if (rollResult <= 5) {
        specialNode = (
          <span>
            <span style={{ color: "red", fontWeight: "bold" }}>　クリティカル！　</span>
            <span style={{ color: "black", fontSize: "0.7em" }}>
              <br />（技能成長は以下）<br />１クリ：1d20<br />２～５クリ：1d10<br />成功：1d3<br />失敗・ファンブル：なし
            </span>
          </span>
        );
      } else if (rollResult === 100) {
        specialNode = (
          <span>
            <span style={{ color: "red", fontWeight: "bold" }}>　致命的ファンブル！　</span>
            <span style={{ color: "black", fontSize: "0.7em" }}><br />（残念ですねぇ！）</span>
          </span>
        );
      } else if (rollResult >= 96) {
        specialNode = (
          <span>
            <span style={{ color: "red", fontWeight: "bold" }}>　ファンブル！　</span>
            <span style={{ color: "black", fontSize: "0.7em" }}><br />（おゎぁぁぁ…）</span>
          </span>
        );
      }
    }

    // 最終テキストの組み立て（タグを埋め込む）
    setResultNode(
      <div>
        ロール結果: {finalResults.join(", ")}
        {numDice > 1 ? ` (合計: ${total})` : ""}
        {specialNode}
      </div>
    );
    
    setIsRolling(false);

    // 【秘密のギミック】11d16で合計90以上のとき
    if (numDice === 11 && numSides === 16 && total >= 90) {
      setResultNode((prev) => (
        <div>
          {prev}
          <p style={{ color: "blue", fontWeight: "bold", marginTop: "10px" }}>
            5秒後に転送されます...
          </p>
        </div>
      ));
      setTimeout(() => {
        // 外部サイト（GithubPages）への転送なので、router.pushではなくwindow.location.hrefが安全です
        window.location.href = "https://satsuki-amagori.github.io/wikipedia/pages/concept/34009e687a0cb10a4637c1a40d24b4e47ea3ba749d07a4e647f0538a93367c769b23ec0ffcaa23b2173629382d9e5948ef6b64528f64f92ee50657c0e617ccec.html";
      }, 5000);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", padding: "20px", textAlign: "center" }}>
      <h1>CoCダイスロール</h1>
      
      <div style={{ marginBottom: "20px" }}>
        <label>回数: </label>
        <input 
          type="number" 
          value={numDice} 
          onChange={(e) => setNumDice(Number(e.target.value))}
          style={{ width: "60px", marginRight: "10px", padding: "5px" }}
        />
        <label>面数: </label>
        <input 
          type="number" 
          value={numSides} 
          onChange={(e) => setNumSides(Number(e.target.value))}
          style={{ width: "60px", padding: "5px" }}
        />
      </div>

      <button 
        onClick={handleRoll} 
        disabled={isRolling}
        style={{
          padding: "10px 20px",
          fontSize: "1.2rem",
          cursor: isRolling ? "not-allowed" : "pointer",
          backgroundColor: "#005faf",
          color: "white",
          border: "none",
          borderRadius: "5px"
        }}
      >
        {isRolling ? "ロール中..." : "ダイスロール！"}
      </button>

      <div style={{ marginTop: "30px" }}>
        <h2 style={{ fontSize: "1rem", color: "#666" }}>結果</h2>
        {/* 文字列ではなくNodeを展開するのでそのまま置く */}
        <div style={{ fontSize: "1.5rem", fontWeight: "bold", minHeight: "100px" }}>
          {resultNode}
        </div>
      </div>

      {/* ★修正ポイント：audioタグの機能で終わったことを検知する */}
      <audio ref={audioRef} src="/dice-music.mp3" onEnded={handleAudioEnded} />

      <div style={{ marginTop: "50px" }}>
        <a href="/" style={{ color: "#999", textDecoration: "none" }}>ポータルへ戻る</a>
      </div>
    </div>
  );
}