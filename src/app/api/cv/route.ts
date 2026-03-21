import { NextResponse } from "next/server";
import db, { initDb } from "@/lib/database";

// Ensure DB is initialized
initDb();

export async function GET() {
  try {
    const cv = db.prepare('SELECT * FROM cv_profiles WHERE id = 1').get() as any;
    if (!cv) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Parse JSON fields
    const profile = {
      ...cv,
      skills: JSON.parse(cv.skills || "[]"),
      preferred_locations: JSON.parse(cv.preferred_locations || "[]"),
      preferred_domains: JSON.parse(cv.preferred_domains || "[]"),
      languages: JSON.parse(cv.languages || "[]"),
      avoid: JSON.parse(cv.avoid || "[]"),
    };

    return NextResponse.json(profile);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { skills, experience_years, seniority, preferred_locations, preferred_domains, languages, avoid } = body;

    const sql = `
      UPDATE cv_profiles SET 
        skills = ?, 
        experience_years = ?, 
        seniority = ?, 
        preferred_locations = ?, 
        preferred_domains = ?, 
        languages = ?, 
        avoid = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `;

    db.prepare(sql).run(
      Array.isArray(skills) ? JSON.stringify(skills) : skills,
      experience_years,
      seniority,
      Array.isArray(preferred_locations) ? JSON.stringify(preferred_locations) : preferred_locations,
      Array.isArray(preferred_domains) ? JSON.stringify(preferred_domains) : preferred_domains,
      Array.isArray(languages) ? JSON.stringify(languages) : languages,
      Array.isArray(avoid) ? JSON.stringify(avoid) : avoid
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
