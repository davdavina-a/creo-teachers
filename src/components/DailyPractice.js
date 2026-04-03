'use client';
import { useState, useEffect } from 'react';
import { getSkillById, SKILL_AREAS } from '../data/skillAreas';
import ExerciseView from './ExerciseView';

export default function DailyPractice({ userId, skillLevels, onBack, onRefresh }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const [practicing, setPracticing] = useState(false);
  const [completedSkills, setCompletedSkills] = useState([]);

  useEffect(() => {
    generatePlan();
  }, []);

  async function generatePlan() {
    setLoading(true);
    try {
      const res = await fetch('/api/evaluate/daily-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillLevels: skillLevels || {},
          completedSessions: [],
        }),
      });
      if (!res.ok) throw new Error('Failed to generate plan');
      const data = await res.json();
      setPlan(data);
    } catch (err) {
      console.error(err);
      // Fallback: pick 3 weakest skills
      const sorted = SKILL_AREAS
        .map(s => ({ id: s.id, score: skillLevels?.[s.id] ?? 0 }))
        .sort((a, b) => a.score - b.score)
        .slice(0, 3);
      setPlan({
        skills: sorted.map(s => s.id),
        exercises: sorted.map(s => ({ skillId: s.id, exerciseType: s.score < 40 ? 'recognition' : 'production' })),
        rationale: 'Focusing on your areas that need the most development.',
      });
    }
    setLoading(false);
  }

  function handleExerciseComplete() {
    const currentSkill = plan.skills[currentSkillIndex];
    const newCompleted = [...completedSkills, currentSkill];
    setCompletedSkills(newCompleted);
    setPracticing(false);

    if (currentSkillIndex < plan.skills.length - 1) {
      setCurrentSkillIndex(currentSkillIndex + 1);
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
        Planning today&apos;s session...
      </div>
    );
  }

  if (practicing && plan) {
    const currentSkillId = plan.skills[currentSkillIndex];
    return (
      <ExerciseView
        skillId={currentSkillId}
        userId={userId}
        currentScore={skillLevels?.[currentSkillId] ?? 0}
        onComplete={handleExerciseComplete}
        onBack={() => setPracticing(false)}
      />
    );
  }

  const allDone = plan && completedSkills.length >= plan.skills.length;

  return (
    <div className="container-app" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <button
        onClick={onBack}
        style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "1.5rem", background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        ← Back to Dashboard
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "1.875rem" }}>📋</span>
        <h2 style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "1.25rem", fontWeight: 700 }}>Daily Practice</h2>
      </div>

      {plan?.rationale && (
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "1.5rem", marginLeft: "3rem" }}>{plan.rationale}</p>
      )}

      {allDone ? (
        <div style={{ textAlign: "center", padding: "2.5rem 1.5rem", backgroundColor: "#edfbdc", border: "1px solid #b8dfa0", borderRadius: "16px" }}>
          <span style={{ fontSize: "3rem", display: "block", marginBottom: "0.75rem" }}>🎉</span>
          <h3 style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.25rem" }}>Session Complete!</h3>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "1.25rem" }}>
            You&apos;ve completed today&apos;s practice across {completedSkills.length} skill areas.
          </p>
          <button
            onClick={() => { onRefresh?.(); onBack(); }}
            className="btn-primary"
            style={{ display: "inline-block", padding: "0.625rem 1.5rem", backgroundColor: "#2a6b1a" }}
          >
            Back to Dashboard
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {plan?.skills.map((skillId, index) => {
            const skill = getSkillById(skillId);
            const isCompleted = completedSkills.includes(skillId);
            const isCurrent = index === currentSkillIndex && !isCompleted;
            const isLocked = index > currentSkillIndex && !completedSkills.includes(skillId);
            const score = skillLevels?.[skillId] ?? 0;

            return (
              <div
                key={skillId}
                style={{
                  padding: "1.25rem",
                  borderRadius: "12px",
                  border: `1.5px solid ${isCompleted ? '#b8dfa0' : isCurrent ? '#93b5f5' : 'var(--color-border)'}`,
                  backgroundColor: isCompleted ? '#edfbdc' : isCurrent ? 'var(--color-surface)' : 'var(--color-bg)',
                  opacity: isLocked ? 0.6 : 1,
                  boxShadow: isCurrent ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.875rem", fontWeight: 700, flexShrink: 0,
                    backgroundColor: isCompleted ? '#2a6b1a' : isCurrent ? 'var(--color-primary)' : 'var(--color-border)',
                    color: isCompleted || isCurrent ? '#fff' : 'var(--color-text-muted)',
                  }}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "1.125rem" }}>{skill.icon}</span>
                      <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{skill.shortName}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                        {score >= 75 ? 'C2' : score >= 50 ? 'C1' : score >= 25 ? 'B2' : 'B1'}
                      </span>
                    </div>
                    {isCompleted && (
                      <p style={{ fontSize: "0.75rem", color: "#2a6b1a", marginTop: "0.125rem" }}>Completed</p>
                    )}
                  </div>
                  {isCurrent && (
                    <button
                      onClick={() => setPracticing(true)}
                      className="btn-primary"
                      style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                    >
                      Start
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}