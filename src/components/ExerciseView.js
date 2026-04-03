'use client';
import { useState, useEffect } from 'react';
import { getSkillById } from '../data/skillAreas';
import { supabase } from '@/lib/supabase';

const backBtnStyle = {
  display: "flex", alignItems: "center", gap: "0.375rem",
  fontSize: "0.875rem", color: "var(--color-text-secondary)",
  marginBottom: "1.5rem", background: "none", border: "none",
  cursor: "pointer", padding: 0,
};

const labelStyle = {
  fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.05em", marginBottom: "0.5rem",
};

export default function ExerciseView({ skillId, userId, currentScore, onComplete, onBack }) {
  const skill = getSkillById(skillId);
  const [exercise, setExercise] = useState(null);
  const [exerciseSource, setExerciseSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [writtenResponse, setWrittenResponse] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [exerciseMode, setExerciseMode] = useState(null); // 'recognition' or 'production'
  const [error, setError] = useState(null);
  const startTime = useState(() => Date.now())[0];

  useEffect(() => {
    if (exerciseMode) {
      loadExercise();
    }
  }, [exerciseMode]);

  async function loadExercise() {
    setLoading(true);
    setError(null);
    setFeedback(null);
    setSelectedOption(null);
    setWrittenResponse('');
    setShowExplanation(false);

    try {
      // 50/50 chance of pre-written vs AI-generated
      const usePreWritten = Math.random() < 0.5;

      if (usePreWritten && skill.preWrittenExercises?.length > 0) {
        const targetType = exerciseMode === 'recognition' ? 'multiple_choice' :
          skill.exercises.production.type;
        const matching = skill.preWrittenExercises.filter(e => e.type === targetType);

        if (matching.length > 0) {
          const picked = matching[Math.floor(Math.random() * matching.length)];
          setExercise(picked);
          setExerciseSource('pre_written');
          setLoading(false);
          return;
        }
      }

      // AI-generated
      const exerciseType = exerciseMode === 'recognition' ? 'multiple_choice' :
        skill.exercises.production.type;

      const res = await fetch('/api/evaluate/generate-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillArea: skillId,
          exerciseType,
          currentLevel: currentScore >= 75 ? 'C2' : currentScore >= 50 ? 'C1' : currentScore >= 25 ? 'B2' : 'B1',
        }),
      });

      if (!res.ok) throw new Error('Failed to generate exercise');
      const data = await res.json();
      setExercise(data.exercise);
      setExerciseSource(data.source);
    } catch (err) {
      console.error(err);
      setError('Could not load exercise. Please try again.');
      if (skill.preWrittenExercises?.length > 0) {
        setExercise(skill.preWrittenExercises[0]);
        setExerciseSource('pre_written');
        setError(null);
      }
    }
    setLoading(false);
  }

  async function handleMultipleChoiceSubmit() {
    if (selectedOption === null) return;
    setShowExplanation(true);

    const isCorrect = selectedOption === exercise.correctIndex;
    const score = isCorrect ? Math.min(100, (currentScore || 0) + 5) : Math.max(0, (currentScore || 0) - 2);

    await saveExerciseResponse({
      exercise_type: 'multiple_choice',
      prompt_data: exercise,
      response_data: { selectedOption, isCorrect },
      score: isCorrect ? 100 : 0,
      cefr_level: null,
    });
  }

  async function handleWritingSubmit() {
    if (writtenResponse.trim().length < 20) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/evaluate/evaluate-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillArea: skillId,
          exerciseType: exercise.type,
          prompt: exercise,
          response: writtenResponse,
          currentLevel: currentScore >= 75 ? 'C2' : currentScore >= 50 ? 'C1' : currentScore >= 25 ? 'B2' : 'B1',
        }),
      });

      if (!res.ok) throw new Error('Evaluation failed');
      const data = await res.json();
      setFeedback(data.evaluation);

      await saveExerciseResponse({
        exercise_type: exercise.type,
        prompt_data: exercise,
        response_data: { writtenResponse },
        score: data.evaluation.score,
        cefr_level: data.evaluation.cefrLevel,
        ai_feedback: data.evaluation,
      });
    } catch (err) {
      console.error(err);
      setError('Could not evaluate your response. Please try again.');
    }
    setSubmitting(false);
  }

  async function saveExerciseResponse(data) {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    try {
      await supabase.from('exercise_responses').insert({
        user_id: userId,
        skill_area: skillId,
        exercise_source: exerciseSource || 'pre_written',
        time_spent_seconds: timeSpent,
        ...data,
      });

      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase
        .from('practice_activity')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_date', today)
        .single();

      if (existing) {
        const skills = existing.skills_practiced || [];
        if (!skills.includes(skillId)) skills.push(skillId);
        await supabase
          .from('practice_activity')
          .update({
            exercises_completed: existing.exercises_completed + 1,
            skills_practiced: skills,
            total_time_seconds: existing.total_time_seconds + timeSpent,
          })
          .eq('id', existing.id);
      } else {
        await supabase.from('practice_activity').insert({
          user_id: userId,
          activity_date: today,
          exercises_completed: 1,
          skills_practiced: [skillId],
          total_time_seconds: timeSpent,
        });
      }

      if (data.score !== undefined && data.score !== null) {
        const { data: currentSkillData } = await supabase
          .from('skill_levels')
          .select('*')
          .eq('user_id', userId)
          .eq('skill_area', skillId)
          .single();

        if (currentSkillData) {
          const newScore = Math.round(currentSkillData.score * 0.7 + data.score * 0.3);
          await supabase
            .from('skill_levels')
            .update({ score: newScore, cefr_level: data.cefr_level || currentSkillData.cefr_level })
            .eq('id', currentSkillData.id);
        }
      }
    } catch (err) {
      console.error('Failed to save exercise response:', err);
    }
  }

  if (!exerciseMode) {
    return (
      <div className="container-app" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
        <button onClick={onBack} style={backBtnStyle}>
          ← Back to Dashboard
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <span style={{ fontSize: "1.875rem" }}>{skill.icon}</span>
          <div>
            <h2 style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "1.25rem", fontWeight: 700 }}>{skill.name}</h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>{skill.description}</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
          <button
            onClick={() => setExerciseMode('recognition')}
            className="card"
            style={{ textAlign: "left", padding: "1.5rem", cursor: "pointer", width: "100%", display: "block" }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🔍</div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontWeight: 600, marginBottom: "0.25rem" }}>
              {skill.exercises.recognition.label}
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
              {skill.exercises.recognition.description}
            </p>
            <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>~{skill.exercises.recognition.timeEstimate} min</div>
          </button>

          <button
            onClick={() => setExerciseMode('production')}
            className="card"
            style={{ textAlign: "left", padding: "1.5rem", cursor: "pointer", width: "100%", display: "block" }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>✍️</div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontWeight: 600, marginBottom: "0.25rem" }}>
              {skill.exercises.production.label}
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
              {skill.exercises.production.description}
            </p>
            <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>~{skill.exercises.production.timeEstimate} min</div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <button
        onClick={() => { setExerciseMode(null); setExercise(null); setFeedback(null); }}
        style={backBtnStyle}
      >
        ← Back to {skill.shortName}
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <span style={{ fontSize: "1.5rem" }}>{skill.icon}</span>
        <h2 style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "1.125rem", fontWeight: 700 }}>{skill.shortName}</h2>
        <span style={{ fontSize: "0.75rem", padding: "0.125rem 0.5rem", borderRadius: "999px", backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" }}>
          {exerciseMode === 'recognition' ? skill.exercises.recognition.label : skill.exercises.production.label}
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
          Preparing your exercise...
        </div>
      ) : error && !exercise ? (
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <p style={{ color: "var(--color-danger)", marginBottom: "1rem" }}>{error}</p>
          <button onClick={loadExercise} className="btn-primary" style={{ display: "inline-block", padding: "0.5rem 1rem" }}>
            Try Again
          </button>
        </div>
      ) : exercise?.type === 'multiple_choice' ? (
        <MultipleChoiceExercise
          exercise={exercise}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          showExplanation={showExplanation}
          onSubmit={handleMultipleChoiceSubmit}
          onNext={() => { loadExercise(); }}
          onFinish={() => { onComplete?.(); setExerciseMode(null); setExercise(null); }}
        />
      ) : (
        <WritingExercise
          exercise={exercise}
          writtenResponse={writtenResponse}
          setWrittenResponse={setWrittenResponse}
          submitting={submitting}
          feedback={feedback}
          onSubmit={handleWritingSubmit}
          onNext={() => { loadExercise(); }}
          onFinish={() => { onComplete?.(); setExerciseMode(null); setExercise(null); }}
        />
      )}
    </div>
  );
}

function MultipleChoiceExercise({ exercise, selectedOption, setSelectedOption, showExplanation, onSubmit, onNext, onFinish }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {exercise.passage && (
        <div className="card" style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          <p style={{ ...labelStyle, color: "var(--color-text-muted)" }}>Read the passage</p>
          {exercise.passage}
        </div>
      )}

      <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>{exercise.question}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {exercise.options.map((option, i) => {
          const isCorrect = i === exercise.correctIndex;
          const isSelected = selectedOption === i;

          let borderColor = 'var(--color-border)';
          let bgColor = 'var(--color-surface)';

          if (showExplanation) {
            if (isCorrect) {
              borderColor = '#b8dfa0';
              bgColor = '#edfbdc';
            } else if (isSelected && !isCorrect) {
              borderColor = '#f87171';
              bgColor = '#fef2f2';
            }
          } else if (isSelected) {
            borderColor = '#2D5BE3';
            bgColor = '#EAE8FF';
          }

          return (
            <button
              key={i}
              onClick={() => !showExplanation && setSelectedOption(i)}
              disabled={showExplanation}
              style={{
                width: "100%", textAlign: "left", padding: "0.875rem",
                borderRadius: "10px", border: `1.5px solid ${borderColor}`,
                backgroundColor: bgColor, fontSize: "0.875rem",
                color: "var(--color-text)", cursor: showExplanation ? "default" : "pointer",
                display: "block",
              }}
            >
              <span style={{ fontWeight: 600, color: "var(--color-text-muted)", marginRight: "0.5rem" }}>{String.fromCharCode(65 + i)}.</span>
              {option}
              {showExplanation && isCorrect && <span style={{ marginLeft: "0.5rem", color: "#2a6b1a" }}>✓</span>}
              {showExplanation && isSelected && !isCorrect && <span style={{ marginLeft: "0.5rem", color: "#ef4444" }}>✗</span>}
            </button>
          );
        })}
      </div>

      {!showExplanation ? (
        <button
          onClick={onSubmit}
          disabled={selectedOption === null}
          className="btn-primary"
          style={{ width: "100%", opacity: selectedOption === null ? 0.4 : 1, cursor: selectedOption === null ? "not-allowed" : "pointer" }}
        >
          Check Answer
        </button>
      ) : (
        <>
          <div style={{ backgroundColor: "#FEF3C7", border: "1px solid #F59E0B", borderRadius: "10px", padding: "1rem", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
            <p style={{ fontWeight: 600, color: "#92400e", marginBottom: "0.25rem" }}>Explanation</p>
            {exercise.explanation}
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={onNext} className="btn-primary" style={{ flex: 1 }}>
              Next Exercise
            </button>
            <button onClick={onFinish} className="btn-secondary" style={{ padding: "0.75rem 1.25rem" }}>
              Done
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function WritingExercise({ exercise, writtenResponse, setWrittenResponse, submitting, feedback, onSubmit, onNext, onFinish }) {
  const wordCount = writtenResponse.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {exercise.topic && (
        <div className="card" style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
          <p style={{ ...labelStyle, color: "var(--color-text-muted)" }}>Topic</p>
          {exercise.topic}
        </div>
      )}

      {exercise.originalText && (
        <div className="card" style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
          <p style={{ ...labelStyle, color: "var(--color-text-muted)" }}>Original Text</p>
          {exercise.originalText}
        </div>
      )}

      {exercise.viewpointA && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ backgroundColor: "#EAE8FF", border: "1px solid #c5bef8", borderRadius: "10px", padding: "1rem", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
            <p style={{ ...labelStyle, color: "#2D5BE3" }}>Viewpoint A</p>
            {exercise.viewpointA}
          </div>
          <div style={{ backgroundColor: "#EAE8FF", border: "1px solid #c5bef8", borderRadius: "10px", padding: "1rem", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
            <p style={{ ...labelStyle, color: "#4338CA" }}>Viewpoint B</p>
            {exercise.viewpointB}
          </div>
        </div>
      )}

      {exercise.sourceExcerpt && (
        <div className="card" style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
          <p style={{ ...labelStyle, color: "var(--color-text-muted)" }}>Source</p>
          {exercise.sourceExcerpt}
        </div>
      )}

      {(exercise.claim && exercise.sourceToUse) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ backgroundColor: "#EAE8FF", border: "1px solid #c5bef8", borderRadius: "10px", padding: "1rem", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
            <p style={{ ...labelStyle, color: "#2D5BE3" }}>Claim to Justify</p>
            {exercise.claim}
          </div>
          <div className="card" style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
            <p style={{ ...labelStyle, color: "var(--color-text-muted)" }}>Source to Use</p>
            {exercise.sourceToUse}
          </div>
        </div>
      )}

      {exercise.instructions && (
        <div style={{ backgroundColor: "#FEF3C7", border: "1px solid #F59E0B", borderRadius: "10px", padding: "1rem", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
          <p style={{ ...labelStyle, color: "#F59E0B" }}>Instructions</p>
          {exercise.instructions}
        </div>
      )}

      {!feedback && (
        <>
          <div style={{ position: "relative" }}>
            <textarea
              value={writtenResponse}
              onChange={(e) => setWrittenResponse(e.target.value)}
              placeholder="Write your response here..."
              rows={8}
              style={{ display: "block", width: "100%", padding: "0.75rem 1rem", fontSize: "0.875rem", fontFamily: "Georgia, 'Times New Roman', serif", border: "1.5px solid var(--color-border)", borderRadius: "10px", backgroundColor: "var(--color-surface)", color: "var(--color-text)", resize: "vertical", outline: "none" }}
            />
            <div style={{ position: "absolute", bottom: "0.75rem", right: "0.75rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
              {wordCount} word{wordCount !== 1 ? 's' : ''}
            </div>
          </div>
          <button
            onClick={onSubmit}
            disabled={wordCount < 10 || submitting}
            className="btn-primary"
            style={{ width: "100%", opacity: (wordCount < 10 || submitting) ? 0.4 : 1, cursor: (wordCount < 10 || submitting) ? "not-allowed" : "pointer" }}
          >
            {submitting ? 'Evaluating your response...' : 'Submit for Feedback'}
          </button>
        </>
      )}

      {feedback && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Score and CEFR */}
          <div className="card" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{feedback.score}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Score</div>
            </div>
            <div style={{ height: 40, width: 1, backgroundColor: "var(--color-border)" }} />
            <div>
              <span style={{
                fontSize: "0.875rem", fontWeight: 700, padding: "0.25rem 0.625rem",
                borderRadius: "999px", color: feedback.cefrLevel === 'C2' ? '#2a6b1a' : '#fff',
                backgroundColor: feedback.cefrLevel === 'C2' ? '#D1F0B1' : feedback.cefrLevel === 'C1' ? '#F59E0B' : feedback.cefrLevel === 'B2' ? '#4338CA' : '#2D5BE3',
              }}>
                {feedback.cefrLevel}
              </span>
            </div>
          </div>

          <div className="card" style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
            {feedback.feedback}
          </div>

          {feedback.strengths?.length > 0 && (
            <div style={{ backgroundColor: "#edfbdc", border: "1px solid #b8dfa0", borderRadius: "10px", padding: "1rem" }}>
              <p style={{ ...labelStyle, color: "#2a6b1a" }}>Strengths</p>
              <ul style={{ display: "flex", flexDirection: "column", gap: "0.375rem", paddingLeft: 0, listStyle: "none", margin: 0 }}>
                {feedback.strengths.map((s, i) => (
                  <li key={i} style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                    <span style={{ color: "#2a6b1a" }}>✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {feedback.improvements?.length > 0 && (
            <div style={{ backgroundColor: "#EAE8FF", border: "1px solid #c5bef8", borderRadius: "10px", padding: "1rem" }}>
              <p style={{ ...labelStyle, color: "var(--color-primary)" }}>Areas for Improvement</p>
              <ul style={{ display: "flex", flexDirection: "column", gap: "0.375rem", paddingLeft: 0, listStyle: "none", margin: 0 }}>
                {feedback.improvements.map((s, i) => (
                  <li key={i} style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                    <span style={{ color: "var(--color-primary)" }}>→</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {feedback.revisedExample && (
            <div style={{ backgroundColor: "#FEF3C7", border: "1px solid #F59E0B", borderRadius: "10px", padding: "1rem" }}>
              <p style={{ ...labelStyle, color: "#F59E0B" }}>Suggested Revision</p>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", fontStyle: "italic" }}>{feedback.revisedExample}</p>
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={onNext} className="btn-primary" style={{ flex: 1 }}>
              Next Exercise
            </button>
            <button onClick={onFinish} className="btn-secondary" style={{ padding: "0.75rem 1.25rem" }}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}