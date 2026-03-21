import { NextResponse } from "next/server";
import db, { initDb } from "@/lib/database";
import { scoreJobWithAI } from "@/lib/llm";

export interface MatchedJob {
  id: string;
  title: string;
  company: string;
  description: string;
  reasoning: string;
  location: string;
  source: string;
  totalScore: number;
  factors: { label: string; score: number; detail: string; icon: string }[];
  gaps: string[];
  posted: string;
  url: string;
  isAiScored?: boolean;
}

// Ensure DB is initialized
initDb();

function heuristicScore(job: any, cv: any) {
  const text = `${job.title} ${job.company} ${job.location} ${job.description} ${job.tags}`.toLowerCase();
  const skills = JSON.parse(cv.skills || "[]");
  const avoid = JSON.parse(cv.avoid || "[]");
  const preferredLocs = JSON.parse(cv.preferred_locations || "[]");
  const preferredDomains = JSON.parse(cv.preferred_domains || "[]");

  // 1. Skill Match (Personalized Weighting)
  const matchedSkills = skills.filter((s: string) => text.includes(s.toLowerCase()));
  const avoidedSkills = avoid.filter((s: string) => text.includes(s.toLowerCase()));
  
  let skillScore = Math.min(100, Math.round((matchedSkills.length / Math.max(skills.length * 0.25, 1)) * 100));
  
  // Noam's "Force Multipliers"
  if (text.includes("n8n") || text.includes("low-code") || text.includes("automation")) skillScore += 25;
  if (text.includes("a/b") || text.includes("experiment") || text.includes("ga4") || text.includes("google analytics")) skillScore += 15;
  if (text.includes("finops") || text.includes("cloudability") || text.includes("cost optimization")) skillScore += 20;
  if (text.includes("sql") && (text.includes("oracle") || text.includes("ssms"))) skillScore += 10;
  
  skillScore = Math.min(100, skillScore - (avoidedSkills.length * 25));
  skillScore = Math.max(0, skillScore);

  // 2. Location Match
  let locScore = 30;
  for (const pref of preferredLocs) {
    if (job.location.toLowerCase().includes(pref.toLowerCase()) || (job.city && job.city.toLowerCase().includes(pref.toLowerCase()))) { 
      locScore = 100; 
      break; 
    }
  }
  if (job.is_remote === 1) locScore = 100;
  if (text.includes("hybrid")) locScore = Math.max(locScore, 85);

  // 3. Domain & Industry Match (Elite Alignment)
  let domainScore = 40;
  // Specific Career Markers
  if (text.includes("airline") || text.includes("aviation") || text.includes("el al")) domainScore = 100;
  if (text.includes("energy") || text.includes("solar") || text.includes("solaredge")) domainScore = 100;
  if (text.includes("finops") || text.includes("saas") || text.includes("product")) domainScore = Math.max(domainScore, 90);
  
  for (const domain of preferredDomains) {
    if (text.includes(domain.toLowerCase())) domainScore = Math.max(domainScore, 80);
  }

  // 4. Role & Seniority (The "Mid-Senior" Bridge)
  const title = job.title.toLowerCase();
  const target = (cv.seniority || "mid-senior").toLowerCase();
  let roleScore = 60;
  
  // Tactical Role Weighting
  if (title.includes("analyst") || title.includes("bi") || title.includes("product analyst") || title.includes("data analyst")) roleScore += 25;
  if (title.includes("senior")) roleScore += 15; // Noam is mid-senior
  if (title.includes("junior")) roleScore -= 40;

  roleScore = Math.min(100, Math.max(0, roleScore));

  // 5. Skill Gap Diagnosis (Phase 13)
  // Identify common high-value tags mentioned in JD but NOT in Noam's CV
  const commonIndustrySkills = ["Tableau", "AWS", "BigQuery", "Snowflake", "Redshift", "Looker", "Alteryx", "SAS", "R", "Kubernetes", "Docker", "Machine Learning", "Deep Learning"];
  const missingSkills = commonIndustrySkills.filter(s => text.includes(s.toLowerCase()) && !skills.some((cs: string) => cs.toLowerCase() === s.toLowerCase())).slice(0, 3);

  // Balanced Total Score (The Noam Formula)
  const totalScore = Math.round((skillScore * 0.4) + (locScore * 0.2) + (domainScore * 0.2) + (roleScore * 0.2));
  
  return {
    totalScore,
    factors: [
      { label: "Tech Stack", score: skillScore, detail: matchedSkills.length > 5 ? `Elite overlap (${matchedSkills.length} skills)` : `Strong overlap: ${matchedSkills.slice(0, 3).join(", ")}`, icon: skillScore >= 80 ? "🔥" : "✅" },
      { label: "Domain Expertise", score: domainScore, detail: domainScore === 100 ? "Perfect industry fit" : "High industry relevance", icon: domainScore >= 90 ? "💎" : "✅" },
      { label: "Loc. & Lifestyle", score: locScore, detail: locScore === 100 ? "Perfect commute/remote" : "Israel Central", icon: locScore >= 85 ? "📍" : "⚠️" },
      { label: "Career Path", score: roleScore, detail: "Seniority & Title precision", icon: roleScore >= 80 ? "📈" : "✅" },
    ],
    gaps: missingSkills.length > 0 ? [`Missing: ${missingSkills.join(", ")}`] : skillScore < 50 ? ["Significant technical delta"] : [],
    missingSkills // Export for UI
  };
}

export async function GET() {
  try {
    // 1. Get CV Profile
    const cv = db.prepare('SELECT * FROM cv_profiles WHERE id = 1').get() as any;
    if (!cv) throw new Error("CV Profile not found in database");

    // 2. Get Jobs from DB
    const rows = db.prepare(`
      SELECT * FROM jobs 
      WHERE status NOT IN ('skipped')
      ORDER BY score DESC 
      LIMIT 100
    `).all() as any[];

    // 3. Fast Heuristic Initial Pass
    let results: MatchedJob[] = rows.map((r) => {
      const h = heuristicScore(r, cv);
      return {
        id: r.id,
        title: r.title,
        company: r.company,
        description: r.description || "",
        reasoning: r.reasoning || "",
        location: r.location,
        source: r.source,
        totalScore: h.totalScore,
        factors: h.factors,
        gaps: h.gaps,
        posted: r.posted,
        url: r.url,
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

    // 4. AI Deep Scoring for Top 5
    const topN = 5;
    const toDeepScore = results.slice(0, topN);
    const rest = results.slice(topN, 20);

    const deepScored = await Promise.all(toDeepScore.map(async (job) => {
      // Find original row for description/tags
      const fullRow = rows.find(r => r.id === job.id);
      const aiResult = await scoreJobWithAI(job.title, `${fullRow.company} - ${fullRow.location}. Tags: ${fullRow.tags}`, cv);
      return {
        ...job,
        totalScore: aiResult.score,
        factors: aiResult.factors,
        gaps: aiResult.gaps,
        isAiScored: true,
      };
    }));

    const finalResults = [...deepScored, ...rest].sort((a, b) => b.totalScore - a.totalScore);

    return NextResponse.json({ 
      total: finalResults.length, 
      cv_skills: JSON.parse(cv.skills), 
      matches: finalResults 
    });
  } catch (e) {
    console.error("[/api/match]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
