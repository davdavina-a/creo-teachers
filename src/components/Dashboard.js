'use client';
import { useState, useEffect, useCallback } from 'react';
import { SKILL_AREAS, getCEFRLevel } from '../data/skillAreas';
import { supabase } from '@/lib/supabase';
import SkillCard from './SkillCard';
import HeatmapCalendar from './HeatmapCalendar';
import ExerciseView from './ExerciseView';
import DailyPractice from './DailyPractice';

export default function Dashboard({ userId, userProfile }) {
  const [skillLevels, setSkillLevels] = useState({});
  const [activityData, setActivityData] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'exercise' | 'daily'
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load skill levels
      const { data: skills } = await supabase
        .from('skill_levels')
        .select('*')
        .eq('user_id', userId);

      const levels = {};
      (skills || []).forEach(s => {
        levels[s.skill_area] = s.score;
      });
      setSkillLevels(levels);

      // Load activity data for heatmap (last 120 days)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 120);
      const { data: activity } = await supabase
        .from('practice_activity')
        .select('*')
        .eq('user_id', userId)
        .gte('activity_date', startDate.toISOString().split('T')[0])
        .order('activity_date', { ascending: false });

      setActivityData(activity || []);

      // Calculate streaks
      if (activity && activity.length > 0) {
        const dates = activity.map(a => a.activity_date).sort().reverse();
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // Current streak
        let streak = 0;
        let checkDate = dates.includes(today) ? today : dates.includes(yesterday) ? yesterday : null;
        if (checkDate) {
          const dateSet = new Set(dates);
          let d = new Date(checkDate);
          while (dateSet.has(d.toISOString().split('T')[0])) {
            streak++;
            d.setDate(d.getDate() - 1);
          }
        }
        setCurrentStreak(streak);

        // Longest streak
        let longest = 0;
        let tempStreak = 1;
        const sortedDates = [...new Set(dates)].sort();
        for (let i = 1; i < sortedDates.length; i++) {
          const prev = new Date(sortedDates[i - 1]);
          const curr = new Date(sortedDates[i]);
          const diffDays = (curr - prev) / 86400000;
          if (diffDays === 1) {
            tempStreak++;
          } else {
            longest = Math.max(longest, tempStreak);
            tempStreak = 1;
          }
        }
        longest = Math.max(longest, tempStreak);
        setLongestStreak(longest);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleSkillClick(skillId) {
    setSelectedSkill(skillId);
    setView('exercise');
  }

  if (view === 'exercise' && selectedSkill) {
    return (
      <ExerciseView
        skillId={selectedSkill}
        userId={userId}
        currentScore={skillLevels[selectedSkill] ?? 0}
        onComplete={() => loadData()}
        onBack={() => { setView('dashboard'); setSelectedSkill(null); loadData(); }}
      />
    );
  }

  if (view === 'daily') {
    return (
      <DailyPractice
        userId={userId}
        skillLevels={skillLevels}
        onBack={() => { setView('dashboard'); loadData(); }}
        onRefresh={loadData}
      />
    );
  }

  // Overall progress
  const totalScores = SKILL_AREAS.map(s => skillLevels[s.id] ?? 0);
  const avgScore = totalScores.length > 0 ? Math.round(totalScores.reduce((a, b) => a + b, 0) / totalScores.length) : 0;
  const overallLevel = getCEFRLevel(avgScore);
  const totalExercises = activityData.reduce((sum, a) => sum + (a.exercises_completed || 0), 0);

  return (
    <div className="container-app" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "1.5rem", fontWeight: 700 }}>
            Welcome back{userProfile?.anonymous_id ? `, ${userProfile.anonymous_id}` : ''}
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Continue developing your academic writing skills
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Overall Level</div>
          <span style={{ fontSize: "1rem", fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: "999px", color: overallLevel.code === 'C2' ? '#2a6b1a' : '#fff', backgroundColor: overallLevel.color, display: "inline-block", marginTop: "0.25rem" }}>
            {overallLevel.code}
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>
          Loading your progress...
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
            {[
              { value: totalExercises, label: "exercises done" },
              { value: `${avgScore}%`, label: "average score" },
              { value: `${Object.values(skillLevels).filter(s => s >= 50).length}/${SKILL_AREAS.length}`, label: "skills at C1+" },
            ].map(({ value, label }) => (
              <div key={label} className="card" style={{ textAlign: "center", padding: "1rem" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{value}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Daily Practice CTA */}
          <button
            onClick={() => setView('daily')}
            className="btn-primary"
            style={{ width: "100%", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderRadius: "12px" }}
          >
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 700, fontSize: "1rem" }}>Daily Practice</div>
              <div style={{ fontSize: "0.85rem", opacity: 0.85, marginTop: "0.2rem" }}>Curated exercises based on your progress. ~10-15 minutes.</div>
            </div>
            <span style={{ fontSize: "1.25rem" }}>→</span>
          </button>

          {/* Heatmap Calendar */}
          <div style={{ marginBottom: "1.5rem" }}>
            <HeatmapCalendar
              activityData={activityData}
              currentStreak={currentStreak}
              longestStreak={longestStreak}
            />
          </div>

          {/* Skill Grid */}
          <h2 style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Your Skills</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {SKILL_AREAS.map(skill => (
              <SkillCard
                key={skill.id}
                skill={skill}
                score={skillLevels[skill.id] ?? 0}
                onClick={handleSkillClick}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}