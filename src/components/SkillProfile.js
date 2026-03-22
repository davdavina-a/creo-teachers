"use client";

const LEVEL_CONFIG = {
  "Emerging": { color: "var(--color-emerging)", width: "33%", label: "Emerging" },
  "Developing": { color: "var(--color-developing)", width: "66%", label: "Developing" },
  "Proficient": { color: "var(--color-proficient)", width: "100%", label: "Proficient" },
};

export default function SkillProfile({ result, onContinue }) {
  if (!result || !result.skills) return null;

  const groups = [
    {
      title: "Ideas & Arguments",
      skills: result.skills.filter((s) =>
        ["Identifying a main idea and supporting statements", "Justification of ideas", "Meeting academic expectations", "Strength of academic argument"].includes(s.area)
      ),
    },
    {
      title: "Working with Sources",
      skills: result.skills.filter((s) =>
        ["Source interpretation", "Use of sources", "Integration of sources for justification"].includes(s.area)
      ),
    },
    {
      title: "Voice & Perspective",
      skills: result.skills.filter((s) =>
        ["Acknowledging different perspectives", "Student voice in relation to sources"].includes(s.area)
      ),
    },
  ];

  return (
    <div className="container-app" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <p style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-primary)", marginBottom: "0.5rem" }}>Step 4 of 4</p>
        <h1 style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "1.5rem", fontWeight: 700 }}>Your Writing Profile</h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", marginTop: "0.5rem" }}>Here is where you stand across 9 academic writing skills. This will guide your personalised learning path.</p>
      </div>

      {/* Overall summary */}
      {result.summary && (
        <div className="card" style={{ marginBottom: "1.5rem", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{result.summary}</p>
        </div>
      )}

      {/* Skill groups */}
      {groups.map((group) => (
        <div key={group.title} style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text)", marginBottom: "0.75rem" }}>{group.title}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {group.skills.map((skill) => {
              const config = LEVEL_CONFIG[skill.level] || { color: "var(--color-text-muted)", width: "10%", label: skill.level };
              return (
                <div key={skill.area} className="card" style={{ padding: "1rem 1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text)", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontWeight: 500 }}>{skill.area}</p>
                    <span style={{
                      fontSize: "0.75rem", fontWeight: 700, color: config.color,
                      fontFamily: "'Helvetica Neue', Arial, sans-serif",
                      padding: "0.15rem 0.6rem", borderRadius: "12px",
                      backgroundColor: config.color + "18",
                    }}>{config.label}</span>
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

      {/* Legend */}
      <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {["Emerging", "Developing", "Proficient"].map((level) => (
          <div key={level} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: LEVEL_CONFIG[level].color }} />
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>{level}</span>
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={onContinue}>Continue to Crēo Teachers</button>
    </div>
  );
}