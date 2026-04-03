import { NextResponse } from 'next/server';

// Algorithm: prioritise weakest skills, rotate through all 7 over 2-3 days
export async function POST(request) {
  try {
    const { skillLevels, completedSessions } = await request.json();
    // skillLevels: { main_idea: 45, perspectives: 30, ... }
    // completedSessions: [{ session_date, planned_skills }]

    const allSkills = [
      'main_idea', 'perspectives', 'academic_expectations',
      'argument_strength', 'source_interpretation', 'student_voice',
      'source_integration'
    ];

    // Get skills practised in the last session to avoid immediate repetition
    const lastSession = completedSessions?.[0];
    const recentlyPractised = lastSession?.planned_skills || [];

    // Sort skills by score (ascending = weakest first)
    const sorted = allSkills
      .map(id => ({ id, score: skillLevels?.[id] ?? 0 }))
      .sort((a, b) => a.score - b.score);

    // Pick 3-4 skills for today, prioritising:
    // 1. Weakest skills not done yesterday
    // 2. Then weakest skills overall
    const notRecent = sorted.filter(s => !recentlyPractised.includes(s.id));
    const recent = sorted.filter(s => recentlyPractised.includes(s.id));

    let todaysSkills = [];

    // Take up to 3 from not-recently-practised (weakest first)
    for (const skill of notRecent) {
      if (todaysSkills.length >= 3) break;
      todaysSkills.push(skill.id);
    }

    // If we still need more, pull from recent (still weakest first)
    for (const skill of recent) {
      if (todaysSkills.length >= 3) break;
      todaysSkills.push(skill.id);
    }

    // For each chosen skill, decide exercise type
    // Alternate: weaker skills get production tasks, stronger get recognition
    const exercises = todaysSkills.map(skillId => {
      const score = skillLevels?.[skillId] ?? 0;
      const exerciseType = score < 40 ? 'recognition' : score < 65 ? 'mixed' : 'production';
      return { skillId, exerciseType };
    });

    return NextResponse.json({
      date: new Date().toISOString().split('T')[0],
      skills: todaysSkills,
      exercises,
      rationale: generateRationale(todaysSkills, skillLevels, recentlyPractised),
    });
  } catch (error) {
    console.error('Daily plan error:', error);
    return NextResponse.json({ error: 'Failed to generate daily plan' }, { status: 500 });
  }
}

function generateRationale(skills, levels, recent) {
  const weakest = skills.filter(s => (levels?.[s] ?? 0) < 40);
  const developing = skills.filter(s => {
    const score = levels?.[s] ?? 0;
    return score >= 40 && score < 65;
  });

  let rationale = "Today's practice focuses on ";
  if (weakest.length > 0) {
    rationale += `building your foundational skills`;
  } else if (developing.length > 0) {
    rationale += `strengthening your developing areas`;
  } else {
    rationale += `refining your advanced skills`;
  }
  rationale += '. ';

  if (recent.length > 0) {
    rationale += 'We\'ve rotated from yesterday\'s focus areas to give you a well-rounded practice cycle.';
  }

  return rationale;
}
