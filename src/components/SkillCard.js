'use client';

import { getCEFRLevel, CEFR_LEVELS } from '../data/skillAreas';

export default function SkillCard({ skill, score, onClick }) {
  const level = getCEFRLevel(score ?? 0);
  const percentage = score ?? 0;

  return (
    <button
      onClick={() => onClick(skill.id)}
      className="card"
      style={{ width: "100%", textAlign: "left", padding: "1.25rem", cursor: "pointer", display: "block" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.75rem" }}>
        <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{skill.icon}</span>
        <div>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "0.9rem", fontWeight: 600 }}>{skill.name}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginTop: "0.2rem" }}>{skill.description}</div>
        </div>
      </div>

      {/* CEFR Level badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "999px", color: level.code === 'C2' ? '#2a6b1a' : '#fff', backgroundColor: level.color }}>{level.code}</span>
        <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{level.label}</span>
        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginLeft: "auto" }}>{percentage}%</span>
      </div>

      {/* Progress bar with CEFR segments */}
      <div style={{ position: "relative", height: "8px", backgroundColor: "var(--color-border)", borderRadius: "999px", overflow: "hidden" }}>
        {CEFR_LEVELS.slice(1).map(l => (
          <div key={l.code} style={{ position: "absolute", top: 0, bottom: 0, width: "1px", backgroundColor: "var(--color-surface)", zIndex: 1, left: `${l.min}%` }} />
        ))}
        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, borderRadius: "999px", width: `${Math.max(percentage, 2)}%`, backgroundColor: level.color }} />
      </div>

      {/* CEFR scale labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.25rem" }}>
        {CEFR_LEVELS.map(l => (
          <span key={l.code} style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", width: "25%", textAlign: l.code === 'B1' ? 'left' : l.code === 'C2' ? 'right' : 'center' }}>
            {l.code}
          </span>
        ))}
      </div>

      {/* Practice link */}
      <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", fontWeight: 600, color: "var(--color-primary)" }}>
        Practise this skill →
      </div>
    </button>
  );
}