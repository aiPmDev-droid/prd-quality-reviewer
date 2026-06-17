import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Add it to .env.local or environment variables."
      );
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

function getModelName(): string {
  return process.env.GEMINI_MODEL || "gemini-2.0-flash";
}

export async function reviewPRD(prdText: string): Promise<string> {
  const ai = getClient();
  const modelName = getModelName();
  console.log(`[PRD Reviewer] Using model: ${modelName}`);
  const model = ai.getGenerativeModel({ model: modelName });

  const prompt = `You are an expert Product Manager reviewing a Product Requirements Document (PRD).
Review the PRD below using the **SMART criteria** and return ONLY valid JSON (no markdown fences, no extra text).

{
  "overall": <0-100>,
  "smart": {
    "specific": { "score": <0-100>, "reasoning": "...", "suggestions": "..." },
    "measurable": { "score": <0-100>, "reasoning": "...", "suggestions": "..." },
    "achievable": { "score": <0-100>, "reasoning": "...", "suggestions": "..." },
    "relevant": { "score": <0-100>, "reasoning": "...", "suggestions": "..." },
    "timeBound": { "score": <0-100>, "reasoning": "...", "suggestions": "..." }
  },
  "summary": "<2-3 sentence executive summary of strengths and weaknesses>"
}

Scoring guidelines:
- **Specific** — Is the goal clearly stated? Are requirements unambiguous? Do they avoid vague language?
- **Measurable** — Are success metrics defined? Can you quantify whether the goal is met? Are KPIs specified?
- **Achievable** — Are the goals realistic given scope, resources, and timeline? Are technical constraints acknowledged?
- **Relevant** — Does the PRD align with business objectives? Is the problem worth solving now?
- **Time-bound** — Are deadlines or milestones defined? Is there a clear timeline or release cadence?

PRD to review:
---
${prdText}
---`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  return text.trim();
}