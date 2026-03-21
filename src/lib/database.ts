import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'jobhunter.db');

const db = new Database(DB_PATH);

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      description TEXT,
      location TEXT,
      posted TEXT,
      url TEXT,
      status TEXT DEFAULT 'new',
      score INTEGER DEFAULT 0,
      tags TEXT,
      reasoning TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cv_profiles (
      id INTEGER PRIMARY KEY CHECK (id = 1), -- Single profile for now
      skills TEXT, -- JSON array
      experience_years INTEGER,
      seniority TEXT,
      preferred_locations TEXT, -- JSON array
      preferred_domains TEXT, -- JSON array
      languages TEXT, -- JSON array
      avoid TEXT, -- JSON array
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3. Match Actions Table (Skip/Apply history)
  db.exec(`
    CREATE TABLE IF NOT EXISTS match_actions (
      job_id TEXT PRIMARY KEY,
      action TEXT NOT NULL, -- 'applied', 'skipped'
      action_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Initialize default CV profile if not exists
  const row = db.prepare('SELECT * FROM cv_profiles WHERE id = 1').get();
  if (!row) {
    db.prepare(`
      INSERT INTO cv_profiles (id, skills, experience_years, seniority, preferred_locations, preferred_domains, languages, avoid)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      JSON.stringify(["React", "TypeScript", "Node.js", "Python", "SQL", "PostgreSQL", "Next.js", "Git", "REST API"]),
      6,
      'senior',
      JSON.stringify(["Tel Aviv", "Herzliya", "Remote", "Hybrid"]),
      JSON.stringify(["SaaS", "FinTech", "ProductTech", "B2B"]),
      JSON.stringify(["Hebrew", "English"]),
      JSON.stringify(["Scala", "Kafka", ".NET", "C#", "PHP"])
    );
  }
}

export default db;
