import Database from 'better-sqlite3';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const DATA_URL = "https://github.com/benzaquenruth/data_analyst_job_postings/raw/main/Job%20Listings%20Database.xlsx";
const DB_PATH = path.join(process.cwd(), 'jobhunter.db');

async function migrate() {
  console.log("🚀 Starting JobHunter OS Migration...");
  
  const db = new Database(DB_PATH);
  
  // Create tables if not exists
  db.exec("DROP TABLE IF EXISTS jobs"); // Drop for clean migration with new columns
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      description TEXT,
      reasoning TEXT,
      is_remote BOOLEAN DEFAULT 0,
      city TEXT,
      location TEXT,
      source TEXT,
      score INTEGER,
      fit INTEGER,
      tags TEXT,
      posted TEXT,
      url TEXT,
      cover_letter TEXT,
      status TEXT DEFAULT 'new',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("📥 Fetching dataset from GitHub...");
  const resp = await fetch(DATA_URL);
  if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
  
  const buffer = await resp.arrayBuffer();
  const wb = XLSX.read(new Uint8Array(buffer), { type: 'array', cellDates: true });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  console.log(`📊 Processing ${rows.length} rows...`);

  const insert = db.prepare(`
    INSERT OR REPLACE INTO jobs (
      id, title, company, description, reasoning, is_remote, city, location, source, score, fit, tags, posted, url, cover_letter
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const parseScore = (raw) => {
    if (raw == null || raw === "") return 50;
    const n = Number(raw);
    if (isNaN(n)) return 50;
    return n <= 1 ? Math.round(n * 100) : Math.min(100, Math.round(n));
  };

  const extractTags = (row) => {
    const fields = ["Skills", "Tech Stack", "Tools", "Requirements", "Keywords"];
    for (const f of fields) {
      if (row[f]) return JSON.stringify(String(row[f]).split(/[,;|\/]/).map(s => s.trim()).slice(0, 5));
    }
    return "[]";
  };

  const postedLabel = (raw) => {
    if (!raw) return "Recently";
    const d = new Date(String(raw));
    if (isNaN(d.getTime())) return "Recently";
    const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return `${Math.floor(diffDays / 7)}w ago`;
  };

  let count = 0;
  db.transaction(() => {
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const title = r["Title"] ?? r["Job Title"] ?? r["title"] ?? r["Position"];
      if (!title) continue;

      const relevance = parseScore(r["Rating"] ?? r["Job Relevance Score"] ?? r["Relevance Score"]);
      const fit = parseScore(r["Fit for the job"] ?? r["Fit Score"] ?? relevance);
      const score = Math.round((relevance * 0.6) + (fit * 0.4));

      insert.run(
        String(i),
        String(title),
        String(r["Company Name"] ?? r["Company"] ?? ""),
        String(r["Job Description"] ?? ""),
        String(r["Reasoning"] ?? ""),
        r["Remote"] === true || r["Remote"] === "Remote" || r["Remote"] === "Yes" ? 1 : 0,
        String(r["City"] ?? ""),
        String(r["City"] ?? r["Location"] ?? "Israel"),
        String(r["Platform"] ?? r["Source"] ?? "Job Board"),
        score,
        fit,
        extractTags(r),
        postedLabel(r["Date"] ?? r["Date Posted"] ?? r["Posted Date"]),
        String(r["Link"] ?? r["URL"] ?? ""),
        String(r["Cover Letter"] ?? "")
      );
      count++;
    }
  })();

  console.log(`✅ Migration complete. ${count} jobs imported into SQLite.`);
}

migrate().catch(console.error);
