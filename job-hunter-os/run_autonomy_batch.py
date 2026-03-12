#!/usr/bin/env python3
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PROFILE = ROOT / "data" / "profile_noam.json"
OUT = ROOT / "data" / "autonomy_batch_report.json"

default_queries = [
    "data analyst",
    "business analyst",
    "bi analyst",
    "power bi",
    "sql",
    "finops",
    "python",
]

qpath = ROOT / "data" / "queries.active.json"
if qpath.exists():
    try:
        qdata = json.loads(qpath.read_text(encoding="utf-8"))
        queries = [str(x) for x in qdata.get("queries", []) if str(x).strip()]
    except Exception:
        queries = default_queries
else:
    queries = default_queries

all_items = []
run_summaries = []

for q in queries:
    cmd = ["python3", "jobhunter_os.py", "--query", q, "--limit", "50", "--profile", str(PROFILE)]
    p = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
    summary = {"query": q, "ok": p.returncode == 0, "stdout": p.stdout.strip(), "stderr": p.stderr.strip()}
    run_summaries.append(summary)

    shortlist_path = ROOT / "data" / "shortlist.json"
    if shortlist_path.exists():
        data = json.loads(shortlist_path.read_text(encoding="utf-8"))
        for it in data.get("items", []):
            it["query"] = q
            all_items.append(it)

# de-dupe by URL and keep highest score
by_url = {}
for it in all_items:
    u = it.get("url")
    if not u:
        continue
    if u not in by_url or it.get("score", 0) > by_url[u].get("score", 0):
        by_url[u] = it

ranked = sorted(by_url.values(), key=lambda x: x.get("score", 0), reverse=True)

OUT.write_text(json.dumps({
    "queries": queries,
    "runs": run_summaries,
    "unique_shortlisted": len(ranked),
    "top": ranked[:20],
}, ensure_ascii=False, indent=2), encoding="utf-8")

print(json.dumps({"ok": True, "report": str(OUT), "unique_shortlisted": len(ranked)}, ensure_ascii=False, indent=2))
