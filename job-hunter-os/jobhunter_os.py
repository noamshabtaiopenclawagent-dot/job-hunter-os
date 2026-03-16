#!/usr/bin/env python3
"""
Job Hunter OS (v1)
- Scanner: pulls jobs from public API (Remotive)
- Matcher: scores jobs against profile keywords + location policy
- Applier (safe mode): prepares application drafts only (no auto-submit)

Run:
  python3 jobhunter_os.py --query "data analyst" --limit 30
Outputs:
  - openclaw-mission-control/job-hunter-os/data/raw_jobs.json
  - openclaw-mission-control/job-hunter-os/data/shortlist.json
"""

from __future__ import annotations
import argparse
import datetime as dt
import json
import os
import re
import urllib.parse
import urllib.request
from dataclasses import dataclass, asdict
from typing import List, Dict, Any

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(ROOT, "data")
os.makedirs(DATA_DIR, exist_ok=True)


DEFAULT_PROFILE = {
    "target_roles": ["data analyst", "business analyst", "product analyst", "bi analyst"],
    "must_have_keywords": ["sql", "python", "dashboard", "analytics"],
    "nice_to_have_keywords": ["tableau", "power bi", "dbt", "etl", "a/b", "experimentation"],
    "blocked_keywords": ["senior director", "principal architect", "onsite only"],
    "location_policy": "remote_or_israel",
}


@dataclass
class JobLead:
    source: str
    source_origin: str
    title: str
    company: str
    location: str
    url: str
    published_at: str
    description: str


@dataclass
class ScoredLead:
    title: str
    company: str
    location: str
    url: str
    source: str
    source_origin: str
    score: int
    must_hits: List[str]
    nice_hits: List[str]
    blocked_hits: List[str]
    stage: str


def fetch_json(url: str) -> Dict[str, Any]:
    req = urllib.request.Request(url, headers={"User-Agent": "JobHunterOS/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def scanner_remotive(query: str, limit: int) -> List[JobLead]:
    q = urllib.parse.urlencode({"search": query})
    url = f"https://remotive.com/api/remote-jobs?{q}"
    payload = fetch_json(url)
    jobs = payload.get("jobs", [])[:limit]

    leads: List[JobLead] = []
    for j in jobs:
        desc = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", j.get("description", ""))).strip()
        leads.append(
            JobLead(
                source="remotive",
                source_origin=url,
                title=j.get("title", ""),
                company=j.get("company_name", ""),
                location=j.get("candidate_required_location", ""),
                url=j.get("url", ""),
                published_at=j.get("publication_date", ""),
                description=desc[:2500],
            )
        )
    return leads


def scanner_linkedin(query: str, limit: int) -> List[JobLead]:
    leads: List[JobLead] = []
    q = urllib.parse.quote(f"{query}")
    url = f"https://www.linkedin.com/jobs/search?keywords={q}&location=Israel"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            html = resp.read().decode("utf-8")
        
        titles = re.findall(r'<h3 class="base-search-card__title">\s*(.*?)\s*</h3>', html, re.DOTALL)
        companies = re.findall(r'<h4 class="base-search-card__subtitle">\s*<a[^>]*>\s*(.*?)\s*</a>|<h4 class="base-search-card__subtitle">\s*(.*?)\s*</h4>', html, re.DOTALL)
        locations = re.findall(r'<span class="job-search-card__location">\s*(.*?)\s*</span>', html, re.DOTALL)
        links = re.findall(r'<a class="base-card__full-link absolute top-0 right-0 bottom-0 left-0 p-0 z-\[2\]"\s*href="(.*?)"', html, re.DOTALL)
        
        for i in range(min(limit, len(titles))):
            comp = companies[i][0] if companies[i][0] else companies[i][1]
            leads.append(
                JobLead(
                    source="linkedin",
                    source_origin=url,
                    title=titles[i].strip(),
                    company=comp.strip(),
                    location=locations[i].strip() if i < len(locations) else "Israel",
                    url=links[i] if i < len(links) else url,
                    published_at="",
                    description=""  # LinkedIn search page doesn't have full description
                )
            )
    except Exception as e:
        print(f"LinkedIn scrape failed: {e}")
    return leads

def scanner_remoteok(query: str, limit: int) -> List[JobLead]:
    payload = fetch_json("https://remoteok.com/api")
    rows = [x for x in payload if isinstance(x, dict) and x.get("position")]
    q = query.lower()
    leads: List[JobLead] = []
    for j in rows:
        text = f"{j.get('position','')} {j.get('description','')} {j.get('tags',[])}".lower()
        if q not in text:
            continue
        desc = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", j.get("description", ""))).strip()
        leads.append(
            JobLead(
                source="remoteok",
                source_origin="https://remoteok.com/api",
                title=j.get("position", ""),
                company=j.get("company", ""),
                location=(j.get("location") or "Remote"),
                url=j.get("url", ""),
                published_at=str(j.get("date", "")),
                description=desc[:2500],
            )
        )
        if len(leads) >= limit:
            break
    return leads


def location_ok(location: str, policy: str) -> bool:
    loc = (location or "").lower()
    if policy == "israel_only":
        israel_markers = [
            "israel", "tel aviv", "jerusalem", "haifa", "herzliya", "raanana", "petah",
            "bnei brak", "ramat gan", "il"
        ]
        return any(m in loc for m in israel_markers)
    if policy == "remote_or_israel":
        return ("anywhere" in loc) or ("remote" in loc) or ("israel" in loc)
    return True


def score_lead(lead: JobLead, profile: Dict[str, Any]) -> ScoredLead:
    text = f"{lead.title} {lead.description} {lead.location}".lower()

    must_hits = [k for k in profile["must_have_keywords"] if k.lower() in text]
    nice_hits = [k for k in profile["nice_to_have_keywords"] if k.lower() in text]
    blocked_hits = [k for k in profile["blocked_keywords"] if k.lower() in text]

    score = 0
    score += len(must_hits) * 16
    score += len(nice_hits) * 6

    title_l = (lead.title or "").lower()
    role_hits = [r for r in profile.get("target_roles", []) if r in title_l]
    score += len(role_hits) * 14

    if blocked_hits:
        score -= 40
    if location_ok(lead.location, profile["location_policy"]):
        score += 15
    else:
        score -= 20

    stage = "shortlist" if score >= 35 and not blocked_hits else "discard"

    return ScoredLead(
        title=lead.title,
        company=lead.company,
        location=lead.location,
        url=lead.url,
        source=lead.source,
        source_origin=lead.source_origin,
        score=score,
        must_hits=must_hits,
        nice_hits=nice_hits,
        blocked_hits=blocked_hits,
        stage=stage,
    )


def applier_safe_drafts(shortlist: List[ScoredLead]) -> List[Dict[str, Any]]:
    drafts = []
    for lead in shortlist:
        drafts.append(
            {
                "company": lead.company,
                "role": lead.title,
                "url": lead.url,
                "status": "draft_ready",
                "cover_letter_stub": f"Hi {lead.company} team, I'm applying to {lead.title}. I bring strong SQL/Python analytics execution and business impact focus.",
            }
        )
    return drafts


def load_profile(profile_path: str | None) -> Dict[str, Any]:
    if not profile_path:
        return DEFAULT_PROFILE
    with open(profile_path, "r", encoding="utf-8") as f:
        raw = json.load(f)

    must = [k.lower() for k in raw.get("keywords_for_matching", [])][:8] or DEFAULT_PROFILE["must_have_keywords"]
    nice = [k.lower() for k in raw.get("core_skills", {}).get("technical", [])[8:16]]
    blocked = [k.lower() for k in raw.get("blocked_roles_seniority", [])] or DEFAULT_PROFILE["blocked_keywords"]

    return {
        "target_roles": [r.lower() for r in raw.get("target_roles", DEFAULT_PROFILE["target_roles"])],
        "must_have_keywords": must,
        "nice_to_have_keywords": nice if nice else DEFAULT_PROFILE["nice_to_have_keywords"],
        "blocked_keywords": blocked,
        "location_policy": raw.get("location_policy", "remote_or_israel"),
    }


import sqlite3

def init_db(db_path: str):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            company TEXT,
            location TEXT,
            url TEXT,
            source TEXT,
            source_origin TEXT,
            score INTEGER,
            stage TEXT,
            ts TEXT
        )
    ''')
    conn.commit()
    return conn

def save_to_db(conn, scored_leads: List[ScoredLead], ts: str):
    cur = conn.cursor()
    for s in scored_leads:
        cur.execute('''
            INSERT INTO jobs (title, company, location, url, source, source_origin, score, stage, ts)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (s.title, s.company, s.location, s.url, s.source, s.source_origin, s.score, s.stage, ts))
    conn.commit()


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--query", default="data analyst")
    p.add_argument("--limit", type=int, default=30)
    p.add_argument("--profile", default=None, help="Path to profile json (optional)")
    args = p.parse_args()

    profile = load_profile(args.profile)
    leads = scanner_remotive(args.query, args.limit)
    leads += scanner_remoteok(args.query, args.limit)
    leads += scanner_linkedin(args.query, args.limit)

    # dedupe by url
    dedup = {}
    for l in leads:
        if l.url and l.url not in dedup:
            dedup[l.url] = l
    leads = list(dedup.values())

    scored = [score_lead(l, profile) for l in leads]
    scored_sorted = sorted(scored, key=lambda x: x.score, reverse=True)

    shortlist = [s for s in scored_sorted if s.stage == "shortlist"]
    drafts = applier_safe_drafts(shortlist[:10])

    now = dt.datetime.now(dt.timezone.utc).isoformat()
    raw_path = os.path.join(DATA_DIR, "raw_jobs.json")
    shortlist_path = os.path.join(DATA_DIR, "shortlist.json")
    drafts_path = os.path.join(DATA_DIR, "application_drafts.json")
    db_path = os.path.join(ROOT, "nexus_index.sqlite")

    conn = init_db(db_path)
    save_to_db(conn, scored, now)
    conn.close()

    with open(raw_path, "w", encoding="utf-8") as f:
        json.dump({"ts": now, "query": args.query, "count": len(leads), "items": [asdict(x) for x in leads]}, f, ensure_ascii=False, indent=2)

    with open(shortlist_path, "w", encoding="utf-8") as f:
        json.dump({"ts": now, "query": args.query, "count": len(shortlist), "items": [asdict(x) for x in shortlist]}, f, ensure_ascii=False, indent=2)

    with open(drafts_path, "w", encoding="utf-8") as f:
        json.dump({"ts": now, "count": len(drafts), "items": drafts}, f, ensure_ascii=False, indent=2)

    print(json.dumps({
        "ok": True,
        "query": args.query,
        "scanned": len(leads),
        "shortlisted": len(shortlist),
        "raw_jobs": raw_path,
        "shortlist": shortlist_path,
        "drafts": drafts_path,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
