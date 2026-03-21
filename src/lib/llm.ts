import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export interface LLMMatchResult {
  score: number;
  factors: { label: string; score: number; detail: string; icon: string }[];
  gaps: string[];
}

export async function scoreJobWithAI(jobTitle: string, jobDescription: string, cvProfile: any): Promise<LLMMatchResult> {
  const prompt = `
You are an expert technical recruiter. Score the following JOB against the candidate's CV PROFILE.

CV PROFILE:
Skills: ${cvProfile.skills}
Experience: ${cvProfile.experience_years} years
Target Seniority: ${cvProfile.seniority}
Preferred Locations: ${cvProfile.preferred_locations}
Avoid: ${cvProfile.avoid}

JOB:
Title: ${jobTitle}
Description: ${jobDescription}

Provide the result in EXACTLY this JSON format:
{
  "score": number (0-100),
  "factors": [
    { "label": "Tech Stack", "score": number, "detail": "string", "icon": "✅" or "⚠️" },
    { "label": "Cultural/Domain", "score": number, "detail": "string", "icon": "✅" or "⚠️" },
    { "label": "Seniority", "score": number, "detail": "string", "icon": "✅" or "⚠️" }
  ],
  "gaps": ["string", "string"]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Clean JSON if needed
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("AI Scoring Error:", error);
    // Fallback to basic scoring if AI fails
    return {
      score: 50,
      factors: [
        { label: "AI Scoring", score: 0, detail: "Error during deep analysis", icon: "⚠️" }
      ],
      gaps: ["System error during deep analysis"]
    };
  }
}
