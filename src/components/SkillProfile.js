"use client";

const LEVEL_CONFIG = {
  "B1": { color: "#C4832D", width: "25%", label: "B1", sublabel: "Threshold" },
  "B2": { color: "#2B5EA7", width: "50%", label: "B2", sublabel: "Vantage" },
  "C1": { color: "#3A8A5C", width: "75%", label: "C1", sublabel: "Effective" },
  "C2": { color: "#7B2D8E", width: "100%", label: "C2", sublabel: "Mastery" },
};

export default function SkillProfile({ result, onContinue }) {
  if (!result || !result.skills) return null;

  const groups = [
    {
      title: "Ideas & Arguments",
      skills: result.skills.filter((s) =>
        ["Main idea and supporting statements", "Strength and development of argument", "Meeting academic expectations", "Acknowledging and integrating perspectives"].includes(s.area)
      ),
    },
    {
      title: "Working with Sources",
      skills: result.skills.filter((s) =>
        ["Source interpretation and use", "Source integration for justification"].includes(s.area)
      ),
    },
    {
      title: "Voice & Perspective",
      skills: result.skills.filter((s) =>
        ["Student voice in relation to sources"].includes(s.area)
      ),
    },
  ];

  return (
    <div className="container-app" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <p style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-primary)", marginBottom: "0.5rem" }}>Step 4 of 4</p>
        <h1 style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "1.5rem", fontWeight: 700 }}>Your Writing Profile</h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", marginTop: "0.5rem" }}>Here is where you stand across 7 academic writing skills, assessed using the CEFR framework. This will guide your personalised learning path.</p>
      </div>

      {result.summary && (
        <div className="card" style={{ marginBottom: "1.5rem", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{result.summary}</p>
        </div>
      )}

      {groups.map((group) => (
        <div key={group.title} style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text)", marginBottom: "0.75rem" }}>{group.title}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {group.skills.map((skill) => {
              const config = LEVEL_CONFIG[skill.level] || { color: "var(--color-text-muted)", width: "10%", label: skill.level, sublabel: "" };
              return (
                <div key={skill.area} className="card" style={{ padding: "1rem 1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text)", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontWeight: 500, flex: 1, paddingRight: "0.5rem" }}>{skill.area}</p>
                    <span style={{
                      fontSize: "0.75rem", fontWeight: 700, color: config.color,
                      fontFamily: "'Helvetica Neue', Arial, sans-serif",
                      padding: "0.2rem 0.65rem", borderRadius: "12px",
                      backgroundColor: config.color + "18",
                      whiteSpace: "nowrap",
                    }}>{config.label} {config.sublabel}</span>
                  </div>
                  <div style={{ width: "100%", height: "6px", borderRadius: "3px", backgroundColor: "var(--color-border)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: "3px", width: config.width,
                      backgroundColor: config.color, transition: "width 0.6s ease",
                    }} />
                  </div>
                  {skill.feedback && (
                    <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.5rem", lineHeight: 1.5 }}>{skill.feedback}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {["B1", "B2", "C1", "C2"].map((level) => (
          <div key={level} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: LEVEL_CONFIG[level].color }} />
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>{LEVEL_CONFIG[level].label} {LEVEL_CONFIG[level].sublabel}</span>
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={onContinue}>Continue to Crēo Teachers</button>
    </div>
  );
}