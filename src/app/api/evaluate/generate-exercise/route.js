import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { skillArea, exerciseType, currentLevel, previousTopics } = await request.json();

    const skillPrompts = {
      main_idea: {
        multiple_choice: `Generate a multiple-choice exercise about identifying thesis statements. Create a short academic paragraph (60-80 words) on a topic related to education, language learning, or teaching methodology. Then provide a question asking which sentence is the thesis statement, with 4 options (the 4 sentences of the paragraph). Include the correct answer index (0-3) and an explanation of why it's the thesis.`,
        writing: `Generate a writing exercise about formulating thesis statements. Provide an academic topic related to education, language learning, or teaching methodology. The student must write a thesis statement and two supporting points. Make the topic appropriate for ${currentLevel || 'B1'} level academic writing.`,
      },
      perspectives: {
        multiple_choice: `Generate a multiple-choice exercise about integrating perspectives. Provide 4 short paragraphs on the same educational topic. One should excellently integrate multiple perspectives with attribution, one should merely list opposing views, one should be one-sided, and one should be vague. Ask which paragraph best integrates multiple perspectives. Include the correct answer index and explanation.`,
        writing: `Generate a writing exercise about integrating perspectives. Provide two opposing viewpoints (each 30-50 words) on an educational topic with fictional source attributions. The student must write a paragraph integrating both viewpoints. Topic should be appropriate for ${currentLevel || 'B1'} level.`,
      },
      academic_expectations: {
        multiple_choice: `Generate a multiple-choice exercise about academic conventions. Provide a paragraph (60-80 words) that contains several departures from academic register (colloquialisms, informal tone, first-person opinion without evidence, vague language). Ask which element is NOT a departure from academic conventions (include one element that is actually appropriate). Provide 4 options, the correct index, and explanation.`,
        rewriting: `Generate a rewriting exercise for academic register. Provide an informal paragraph (60-80 words) on an educational topic that uses colloquial language, contractions, and informal expressions. The student must rewrite it in academic register. Topic should be appropriate for ${currentLevel || 'B1'} level.`,
      },
      argument_strength: {
        multiple_choice: `Generate a multiple-choice exercise about argument strength. Provide 4 short arguments (2-3 sentences each) on the same educational topic. They should range from weakest (assertion without evidence) to strongest (claim + evidence + counterargument + reasoning). Ask which is strongest. Include correct index and explanation.`,
        rewriting: `Generate a rewriting exercise for argument development. Provide a weak argument (40-60 words) that makes a claim but lacks evidence, counterargument acknowledgement, and detailed reasoning. The student must strengthen it. Topic should relate to education and be appropriate for ${currentLevel || 'B1'} level.`,
      },
      source_interpretation: {
        multiple_choice: `Generate a multiple-choice exercise about source interpretation. Create a fictional research finding passage (60-80 words) with a fictional author name and year, containing nuanced findings (e.g., positive effect in one area but not another). Provide 4 summary options: one accurate, one overstating, one understating, one misrepresenting. Include correct index and explanation.`,
        writing: `Generate a writing exercise about source interpretation. Provide a fictional source excerpt (80-100 words) from a fictional study with author name and year. The findings should be nuanced (not straightforwardly positive or negative). The student must write 1-2 sentences accurately representing the findings. Appropriate for ${currentLevel || 'B1'} level.`,
      },
      student_voice: {
        multiple_choice: `Generate a multiple-choice exercise about student voice in academic writing. Provide 4 short paragraphs that use sources in different ways: one showing strong student voice with critical engagement, one merely listing sources without commentary, one with only personal opinion and no sources, and one sitting on the fence without taking a position. Ask which best demonstrates student voice in relation to sources. Include correct index and explanation.`,
        rewriting: `Generate a rewriting exercise for student voice. Provide a paragraph (60-80 words) that reports several fictional sources without any analytical commentary, questions, or writer position. The student must rewrite to add their own voice while keeping the source references. Appropriate for ${currentLevel || 'B1'} level.`,
      },
      source_integration: {
        multiple_choice: `Generate a multiple-choice exercise about source integration purpose. Show a sentence or short passage that uses a source, and ask whether the source is being used as: (A) justification with meaningful engagement, (B) decoration/padding without substance, (C) critical analysis, or (D) mere name-dropping. Include the correct index and explanation.`,
        writing: `Generate a writing exercise about integrating sources for justification. Provide a claim about education/teaching and a fictional source excerpt (60-80 words) with author and year. The student must write a paragraph integrating the source to justify the claim meaningfully. Appropriate for ${currentLevel || 'B1'} level.`,
      },
    };

    const exerciseKey = exerciseType === 'rewriting' ? 'rewriting' : exerciseType === 'writing' ? 'writing' : 'multiple_choice';
    const prompt = skillPrompts[skillArea]?.[exerciseKey];

    if (!prompt) {
      return NextResponse.json({ error: 'Invalid skill area or exercise type' }, { status: 400 });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: `You are an exercise generator for an academic writing skills application used by pre-service English teachers (TESL/TESOL) in Malaysia. Generate exercises that are educationally sound and culturally appropriate. 

IMPORTANT: Respond ONLY with a valid JSON object. No markdown, no backticks, no preamble. The JSON must match exactly one of these structures:

For multiple_choice exercises:
{"type":"multiple_choice","passage":"...optional passage...","question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}

For writing exercises:
{"type":"writing","topic":"...or empty...","instructions":"...","sourceExcerpt":"...optional...","claim":"...optional...","viewpointA":"...optional...","viewpointB":"...optional..."}

For rewriting exercises:
{"type":"rewriting","originalText":"...","instructions":"..."}

${previousTopics ? `Avoid these topics which were used recently: ${previousTopics.join(', ')}` : ''}`,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', errText);
      return NextResponse.json({ error: 'Failed to generate exercise' }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    
    // Parse the JSON response, stripping any accidental markdown fences
    const clean = text.replace(/```json\s*|```\s*/g, '').trim();
    const exercise = JSON.parse(clean);

    return NextResponse.json({ exercise, source: 'ai_generated' });
  } catch (error) {
    console.error('Generate exercise error:', error);
    return NextResponse.json({ error: 'Failed to generate exercise' }, { status: 500 });
  }
}
