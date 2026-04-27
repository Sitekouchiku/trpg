"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function DicePage() {
  const [numDice, setNumDice] = useState(1);
  const [numSides, setNumSides] = useState(100);
  const [result, setResult] = useState("");
  const [isRolling, setIsRolling] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  const rollDice = (sides: number, count: number) => {
    return Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
  };

  const handleRoll = () => {
    if (isRolling || numDice <= 0 || numSides <= 0) return;

    setIsRolling(true);
    setResult("ロール中...");

    // 音楽再生
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }

    // シャッフル演出（0.1秒ごと）
    const intervalId = setInterval(() => {
      const tempResults = rollDice(numSides, numDice);
      setResult(`ロール中: ${tempResults.join(", ")}`);
    }, 100);

    // 音楽が終わったら結果確定（元コードの再現）
    if (audioRef.current) {
      audioRef.current.onended = () => {
        clearInterval(intervalId);
        const finalResults = rollDice(numSides, numDice);
        const total = finalResults.reduce((sum, v) => sum + v, 0);

        let finalText = `ロール結果: ${finalResults.join(", ")}`;
        if (numDice > 1) finalText += ` (合計: ${total})`;
        
        setResult(finalText);
        setIsRolling(false);

        // 【秘密のギミック】11d16で合計90以上のとき
        if (numDice === 11 && numSides === 16 && total >= 90) {
          setResult(prev => prev + "\n5秒後に転送されます...");
          setTimeout(() => {
            // 転送先（例：内藤浩文の秘密のページなど）
            router.push("/wiki/内藤浩文"); 
          }, 5000);
        }
      };
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

      <div style={{ marginTop: "30px", whiteSpace: "pre-line" }}>
        <h2 style={{ fontSize: "1rem", color: "#666" }}>結果</h2>
        <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{result}</p>
      </div>

      {/* 隠しオーディオ */}
      <audio ref={audioRef} src="/dice-music.mp3" />

      <div style={{ marginTop: "50px" }}>
        <a href="/" style={{ color: "#999", textDecoration: "none" }}>ポータルへ戻る</a>
      </div>
    </div>
  );
}