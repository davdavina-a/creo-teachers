import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { skillArea, exerciseType, prompt, response: userResponse, currentLevel } = await request.json();

    const skillFeedbackGuides = {
      main_idea: 'Evaluate whether the thesis statement takes a clear position and whether the supporting points are relevant, specific, and logically connected to the thesis.',
      perspectives: 'Evaluate whether the student acknowledges both viewpoints fairly, integrates them into a coherent discussion (rather than just listing them), and shows how the perspectives relate to each other.',
      academic_expectations: 'Evaluate whether the rewrite uses appropriate academic register, removes colloquialisms, uses formal vocabulary, avoids unjustified first-person assertions, and maintains appropriate tone.',
      argument_strength: 'Evaluate whether the rewrite includes specific evidence or examples, acknowledges a counterargument, provides reasoning connecting evidence to the claim, and develops the argument beyond mere assertion.',
      source_interpretation: 'Evaluate whether the student accurately represents the source findings without overstating, understating, or misrepresenting them. Check for appropriate nuance.',
      student_voice: 'Evaluate whether the student adds their own analytical perspective (questioning, identifying patterns, noting limitations, drawing conclusions) while still engaging with the sources rather than abandoning them.',
      source_integration: 'Evaluate whether the source is integrated meaningfully to justify the claim, rather than being dropped in as decoration. Check that the student explains how the evidence supports the claim.',
    };

    const feedbackGuide = skillFeedbackGuides[skillArea] || 'Evaluate the quality of the academic writing response.';

    const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: `You are an academic writing evaluator for pre-service English teachers (TESL/TESOL students in Malaysia). You evaluate student writing against CEFR standards for HUMAN academic writing, not AI-quality writing.

CALIBRATION: Remember these are university students developing their academic writing. A genuinely good human response at B2 level is a strong achievement. Do not expect C1/C2 quality from responses that show solid competence. Reserve C2 for truly exceptional, publishable-quality work.

CEFR levels for this skill:
- B1 (Threshold): Basic attempt with significant gaps
- B2 (Vantage): Competent handling with some areas for improvement  
- C1 (Effective): Sophisticated, well-developed response
- C2 (Mastery): Exceptional, publishable-quality work

Skill-specific guidance: ${feedbackGuide}

IMPORTANT: Respond ONLY with a valid JSON object. No markdown, no backticks, no preamble.
{"score": 0-100, "cefrLevel": "B1|B2|C1|C2", "strengths": ["strength1", "strength2"], "improvements": ["improvement1", "improvement2"], "feedback": "2-3 sentences of constructive feedback", "revisedExample": "An improved version of key parts of their response (optional, include only if score < 60)"}`,
        messages: [
          {
            role: 'user',
            content: `Exercise type: ${exerciseType}
Skill area: ${skillArea}
Current CEFR level: ${currentLevel || 'Unknown'}

Exercise prompt/instructions:
${JSON.stringify(prompt)}

Student's response:
${userResponse}

Evaluate this response.`,
          },
        ],
      }),
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      console.error('Anthropic API error:', errText);
      return NextResponse.json({ error: 'Failed to evaluate response' }, { status: 500 });
    }

    const data = await apiResponse.json();
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json\s*|```\s*/g, '').trim();
    const evaluation = JSON.parse(clean);

    return NextResponse.json({ evaluation });
  } catch (error) {
    console.error('Evaluate exercise error:', error);
    return NextResponse.json({ error: 'Failed to evaluate response' }, { status: 500 });
  }
}
