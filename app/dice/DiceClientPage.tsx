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

    // ★ ダイスの個数に応じて出目のフォントサイズを決定
    let rollingFontSize = "1.8rem";
    if (numDice > 100) {
      rollingFontSize = "0.5rem";
    } else if (numDice > 10) {
      rollingFontSize = "0.8rem";
    }

    // シャッフル演出（0.1秒ごと）
    intervalRef.current = setInterval(() => {
      const tempResults = rollDice(numSides, numDice);
      setResultNode(
        <div style={{ fontSize: rollingFontSize }}>
          <span style={{ fontSize: "1.8rem" }}>ロール中</span><br />
          {tempResults.join(", ")}
        </div>
      );
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
    const diceString = finalResults.join(", "); // 出目の文字列

    // 折り畳み判定：ダイス10個以上 または 文字数が半角で40文字を超える場合
    const shouldCollapse = numDice >= 10 || diceString.length > 40;

    let specialNode: React.ReactNode = null;

    // --- 1d100の特殊判定（クリティカル/ファンブルの赤文字演出） ---
    if (numDice === 1 && numSides === 100) {
      const rollResult = finalResults[0];
      if (rollResult === 1) {
        specialNode = (
          <span>
            <span style={{ color: "red", fontWeight: "bold" }}>　<br />確定的クリティカル！　</span>
            <span style={{ color: "black", fontSize: "0.7em" }}>
              <br />（技能成長は以下）<br />１クリ：1d100<br />２～５クリ：1d20<br />成功：1d5<br />失敗：+1<br />ファンブル：なし
            </span>
          </span>
        );
      } else if (rollResult <= 5) {
        specialNode = (
          <span>
            <span style={{ color: "red", fontWeight: "bold" }}>　<br />クリティカル！　</span>
            <span style={{ color: "black", fontSize: "0.7em" }}>
              <br />（技能成長は以下）<br />１クリ：1d20<br />２～５クリ：1d10<br />成功：1d3<br />失敗・ファンブル：なし
            </span>
          </span>
        );
      } else if (rollResult === 100) {
        specialNode = (
          <span>
            <span style={{ color: "red", fontWeight: "bold" }}>　<br />致命的ファンブル！　</span>
            <span style={{ color: "black", fontSize: "0.7em" }}><br />（残念ですねぇ！）</span>
          </span>
        );
      } else if (rollResult >= 96) {
        specialNode = (
          <span>
            <span style={{ color: "red", fontWeight: "bold" }}>　<br />ファンブル！　</span>
            <span style={{ color: "black", fontSize: "0.7em" }}><br />（おゎぁぁぁ…）</span>
          </span>
        );
      }
    }

    // 最終テキストの組み立て（タグを埋め込む）
    setResultNode(
      <div>
        {shouldCollapse ? (
          // --- 折り畳み表示（ダイスが多い場合） ---
          <div>
            <div>合計: {total}</div>
            <details style={{ fontSize: "1rem", marginTop: "10px", cursor: "pointer" }}>
              <summary style={{ color: "#005faf", fontWeight: "normal" }}>
                （クリックして各出目の結果を表示）
              </summary>
              <div style={{ 
                marginTop: "10px", 
                fontWeight: "normal", 
                fontSize: "1.2rem", 
                wordBreak: "break-all",
                color: "#444",
                padding: "10px",
                backgroundColor: "#f9f9f9",
                borderRadius: "5px",
                textAlign: "left"
              }}>
                ロール結果: {diceString}
              </div>
            </details>
          </div>
        ) : (
          // --- 通常表示（ダイスが少ない場合） ---
          <div>
            ロール結果: {diceString}
            {numDice > 1 ? ` (合計: ${total})` : ""}
            {specialNode}
          </div>
        )}
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
        window.location.href = "https://satsuki-amagori.github.io/wikipedia/pages/concept/34009e687a0cb10a4637c1a40d24b4e47ea3ba749d07a4e647f0538a93367c769b23ec0ffcaa23b2173629382d9e5948ef6b64528f64f92ee50657c0e617ccec.html";
      }, 5000);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", padding: "20px", textAlign: "center", }}>
      <h1>CoCダイスロール</h1>
      <div style={{ marginBottom: "20px" }}>
        <span style={{ fontSize: "1.2rem", display: "block", color: "#d9534f", }}>Caution！</span>
        <span style={{ fontSize: "0.8rem", fontWeight: "bold" }}>
          このサイトでは音が出ます。<br />必要に応じて音量調節してください。
        </span>
      </div>
      
      <div style={{ marginBottom: "20px", backgroundColor: "#00000000", padding: "15px", borderRadius: "8px" }}>
        <label>回数: </label>
        <input 
          type="number" 
          value={numDice} 
          onChange={(e) => setNumDice(Number(e.target.value))}
          style={{ width: "60px", marginRight: "10px", padding: "5px", border: "1px solid #ccc" }}
        />
        <label>面数: </label>
        <input 
          type="number" 
          value={numSides} 
          onChange={(e) => setNumSides(Number(e.target.value))}
          style={{ width: "60px", padding: "5px", border: "1px solid #ccc" }}
        />
      </div>

      <button 
        onClick={handleRoll} 
        disabled={isRolling}
        style={{
          padding: "12px 24px",
          fontSize: "1.2rem",
          cursor: isRolling ? "not-allowed" : "pointer",
          backgroundColor: isRolling ? "#aaa" : "#005faf",
          color: "white",
          border: "none",
          borderRadius: "5px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
        }}
      >
        {isRolling ? "ロール中..." : "ダイスロール！"}
      </button>

      <div style={{ marginTop: "30px" }}>
        <h2 style={{ fontSize: "1rem", color: "#000000", borderBottom: "1px solid #eee", paddingBottom: "5px" }}>結果</h2>
        <div style={{ fontSize: "1.5rem", fontWeight: "bold", minHeight: "120px", padding: "10px" }}>
          {resultNode}
        </div>
      </div>

      {/* 音声ファイルのパスが正しいか確認してください */}
      <audio ref={audioRef} src="/dice-music.mp3" onEnded={handleAudioEnded} />

      <div style={{ marginTop: "50px" }}>
        <a href="/" style={{ color: "#000000", textDecoration: "none", fontSize: "0.9rem" }}>← ポータルへ戻る</a>
      </div>
    </div>
  );
}