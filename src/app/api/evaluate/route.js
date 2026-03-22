import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { writing, prompt } = await req.json();

    if (!writing || writing.trim().length < 50) {
      return NextResponse.json({ error: "Writing sample is too short." }, { status: 400 });
    }

    const systemPrompt = `You are an academic writing evaluator for pre-service teachers in Malaysia. You evaluate writing across exactly 9 skill areas. For each skill area, assign one of three levels: Emerging, Developing, or Proficient. Also provide one short sentence of feedback per skill (teacher-friendly, encouraging, no more than 15 words).

The 9 skill areas are:
1. Identifying a main idea and supporting statements
2. Acknowledging different perspectives
3. Meeting academic expectations
4. Strength of academic argument
5. Source interpretation
6. Use of sources
7. Student voice in relation to sources
8. Justification of ideas
9. Integration of sources for justification

Also provide a brief overall summary (2-3 sentences, warm and encouraging tone).

IMPORTANT: Respond ONLY with valid JSON in this exact format, no markdown, no backticks, no extra text:
{"summary":"...","skills":[{"area":"Identifying a main idea and supporting statements","level":"Emerging","feedback":"..."},{"area":"Acknowledging different perspectives","level":"Developing","feedback":"..."},{"area":"Meeting academic expectations","level":"Emerging","feedback":"..."},{"area":"Strength of academic argument","level":"Developing","feedback":"..."},{"area":"Source interpretation","level":"Emerging","feedback":"..."},{"area":"Use of sources","level":"Emerging","feedback":"..."},{"area":"Student voice in relation to sources","level":"Developing","feedback":"..."},{"area":"Justification of ideas","level":"Developing","feedback":"..."},{"area":"Integration of sources for justification","level":"Emerging","feedback":"..."}]}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `Here is the writing prompt that was given:\n\n${prompt}\n\nHere is the student's writing:\n\n${writing}\n\nPlease evaluate this writing across all 9 skill areas.`,
          },
        ],
        system: systemPrompt,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Anthropic API error:", errBody);
      return NextResponse.json({ error: "AI evaluation failed. Please try again." }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

    // Parse the JSON response, stripping any accidental markdown fences
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const result = JSON.parse(cleaned);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Evaluation error:", err);
    return NextResponse.json({ error: "Something went wrong during evaluation." }, { status: 500 });
  }
}