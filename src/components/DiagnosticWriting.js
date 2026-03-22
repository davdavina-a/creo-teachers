"use client";

import { useState } from "react";

const PROMPT = `Read the following statement from a published study:\n\n"Technology in the classroom does not automatically improve learning outcomes; its effectiveness depends on how teachers integrate it into their teaching practice."\n\nIn 150–250 words, write an academic paragraph responding to this statement. You may agree, disagree, or present a nuanced position. Support your argument with reasoning or examples.`;

export default function DiagnosticWriting({ onComplete }) {
  const [writing, setWriting] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const wordCount = writing.trim().split(/\s+/).filter(Boolean).length;
  const tooShort = wordCount < 100;
  const tooLong = wordCount > 350;

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writing, prompt: PROMPT }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to get feedback. Please try again.");
      }
      const result = await res.json();
      onComplete({ writing, wordCount, prompt: PROMPT, result });
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="container-app" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <p style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-primary)", marginBottom: "0.5rem" }}>Step 3 of 4</p>
        <h1 style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "1.5rem", fontWeight: 700 }}>Your Writing Profile</h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", marginTop: "0.5rem" }}>Write a short academic paragraph so we can personalise your learning path. There are no right or wrong answers.</p>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <p style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "var(--color-primary)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Writing Prompt</p>
        <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{PROMPT}</p>
      </div>

      <div className="card">
        <textarea
          value={writing}
          onChange={(e) => setWriting(e.target.value)}
          placeholder="Start writing your paragraph here..."
          rows={10}
          style={{
            display: "block", width: "100%", padding: "1rem", fontSize: "0.95rem",
            fontFamily: "Georgia, 'Times New Roman', serif", border: "1.5px solid var(--color-border)",
            borderRadius: "8px", backgroundColor: "var(--color-bg)", color: "var(--color-text)",
            outline: "none", resize: "vertical", lineHeight: 1.7,
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem" }}>
          <p style={{
            fontSize: "0.8rem",
            color: tooShort ? "var(--color-warning)" : tooLong ? "var(--color-danger)" : "var(--color-text-muted)",
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
          }}>
            {wordCount} {wordCount === 1 ? "word" : "words"}
            {tooShort && wordCount > 0 ? " (aim for at least 150)" : ""}
            {tooLong ? " (try to keep it under 250)" : ""}
          </p>
          <div style={{
            width: "40px", height: "4px", borderRadius: "2px", backgroundColor: "var(--color-border)",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%", borderRadius: "2px", transition: "width 0.3s ease",
              width: `${Math.min((wordCount / 250) * 100, 100)}%`,
              backgroundColor: tooShort ? "var(--color-warning)" : tooLong ? "var(--color-danger)" : "var(--color-success)",
            }} />
          </div>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", color: "var(--color-danger)", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: "1.5rem" }}>
        <button className="btn-primary" onClick={handleSubmit} disabled={loading || tooShort}>
          {loading ? "Analysing your writing..." : "Submit"}
        </button>
        {loading && (
          <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.75rem" }}>
            This may take a moment. We are reading your writing carefully.
          </p>
        )}
      </div>
    </div>
  );
}