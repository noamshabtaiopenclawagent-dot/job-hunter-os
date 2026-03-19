#!/usr/bin/env python3
"""Legacy Mission Control JSON -> Mission Control API importer.

Idempotency strategy:
- Task identity by `LEGACY_ID:<id>` marker inside description.
- Approval identity by payload key `legacy_approval_key`.
"""

from __future__ import annotations

import argparse
import json
import re
import urllib.error
import urllib.request
from pathlib import Path

STATUS_MAP = {
    "todo": "inbox",
    "inbox": "inbox",
    "planned": "inbox",
    "approval": "review",
    "review": "review",
    "in_progress": "in_progress",
    "done": "done",
    "stuck": "review",
}


def load_json(path: Path):
    return json.loads(path.read_text()) if path.exists() else []


class Api:
    def __init__(self, base: str, token: str):
        self.base = base.rstrip("/")
        self.token = token

    def call(self, method: str, path: str, data: dict | None = None):
        body = None
        headers = {"Authorization": f"Bearer {self.token}"}
        if data is not None:
            body = json.dumps(data).encode()
            headers["Content-Type"] = "application/json"
        req = urllib.request.Request(self.base + path, method=method, data=body, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                raw = r.read().decode()
                return json.loads(raw) if raw else {}
        except urllib.error.HTTPError as e:
            detail = e.read().decode(errors="ignore")
            raise RuntimeError(f"API {method} {path} failed: {e.code} {detail}") from e


def main() -> int:
    p = argparse.ArgumentParser(description="Import legacy JSON into Mission Control")
    p.add_argument("--source", default="/Users/opiagent/.openclaw/workspace/local/state/mission-control")
    p.add_argument("--base", default="http://127.0.0.1:8000/api/v1")
    p.add_argument("--token-file", default="/Users/opiagent/.openclaw/workspace/openclaw-mission-control/backend/.env")
    p.add_argument("--board-id", default="278627d8-606a-4935-bd8f-9293ffcfabc7")
    p.add_argument("--apply", action="store_true")
    args = p.parse_args()

    source = Path(args.source)
    projects = load_json(source / "projects.json")
    tasks = load_json(source / "tasks.json")
    approvals = load_json(source / "approvals.json")
    events_path = source / "events.jsonl"
    events = sum(1 for _ in events_path.open()) if events_path.exists() else 0

    token = ""
    for line in Path(args.token_file).read_text().splitlines():
        if line.startswith("LOCAL_AUTH_TOKEN="):
            token = line.split("=", 1)[1].strip()
            break
    if not token:
        raise RuntimeError("LOCAL_AUTH_TOKEN not found")

    unknown = sorted({t.get("status") for t in tasks if t.get("status") not in STATUS_MAP})
    print("[mc_import_legacy] source summary")
    print(f"projects={len(projects)} tasks={len(tasks)} approvals={len(approvals)} events={events}")
    print(f"unknown_statuses={unknown}")
    if unknown:
        print("abort: unmapped statuses exist")
        return 2

    if not args.apply:
        print("mode=dry-run")
        print("ready_for_apply=true")
        return 0

    api = Api(args.base, token)
    board_id = args.board_id

    task_page = api.call("GET", f"/boards/{board_id}/tasks?limit=200")
    existing_tasks = task_page.get("items", [])
    legacy_to_new: dict[str, str] = {}
    marker = re.compile(r"LEGACY_ID:\s*([^\n\r]+)")
    for item in existing_tasks:
        desc = item.get("description") or ""
        m = marker.search(desc)
        if m:
            legacy_to_new[m.group(1).strip()] = item["id"]

    created_tasks = 0
    skipped_tasks = 0

    for t in tasks:
        legacy_id = str(t.get("id"))
        if legacy_id in legacy_to_new:
            skipped_tasks += 1
            continue
        mapped = STATUS_MAP[t.get("status")]
        notes = (t.get("notes") or "").strip()
        meta = [
            f"LEGACY_ID: {legacy_id}",
            f"LEGACY_STATUS: {t.get('status')}",
            f"LEGACY_OWNER: {t.get('owner_agent')}",
        ]
        description = (notes + "\n\n" if notes else "") + "\n".join(meta)
        payload = {
            "title": t.get("title") or f"legacy-task-{legacy_id}",
            "description": description,
            "status": mapped,
            "priority": "medium",
            "depends_on_task_ids": [],
            "tag_ids": [],
            "custom_field_values": {},
        }
        created = api.call("POST", f"/boards/{board_id}/tasks", payload)
        legacy_to_new[legacy_id] = created["id"]
        created_tasks += 1

    # second pass dependencies
    dep_patched = 0
    for t in tasks:
        legacy_id = str(t.get("id"))
        new_id = legacy_to_new.get(legacy_id)
        if not new_id:
            continue
        deps = [legacy_to_new[d] for d in (t.get("dependencies") or []) if d in legacy_to_new]
        if not deps:
            continue
        api.call("PATCH", f"/boards/{board_id}/tasks/{new_id}", {"depends_on_task_ids": deps})
        dep_patched += 1

    # approvals idempotency via payload key
    approval_page = api.call("GET", f"/boards/{board_id}/approvals?limit=200")
    existing_approvals = approval_page.get("items", [])
    existing_keys = set()
    for a in existing_approvals:
        payload = a.get("payload") or {}
        key = payload.get("legacy_approval_key")
        if isinstance(key, str):
            existing_keys.add(key)

    created_approvals = 0
    skipped_approvals = 0
    updated_approvals = 0

    for idx, a in enumerate(approvals):
        task_legacy = str(a.get("task_id"))
        task_new = legacy_to_new.get(task_legacy)
        if not task_new:
            continue
        key = f"{task_legacy}:{idx}:{a.get('requested_at')}"
        if key in existing_keys:
            skipped_approvals += 1
            continue
        desired = a.get("status") or "pending"
        if desired not in {"pending", "approved", "rejected"}:
            desired = "pending"
        create_payload = {
            "action_type": "task_done_approval",
            "task_id": task_new,
            "task_ids": [task_new],
            "payload": {
                "reason": a.get("reason") or "Legacy migration approval",
                "legacy_approval_key": key,
            },
            "confidence": 80,
            "rubric_scores": None,
            "status": "pending" if desired != "pending" else "pending",
            "lead_reasoning": a.get("reason") or "Legacy migration",
        }
        created = api.call("POST", f"/boards/{board_id}/approvals", create_payload)
        created_approvals += 1
        if desired in {"approved", "rejected"}:
            api.call("PATCH", f"/boards/{board_id}/approvals/{created['id']}", {"status": desired})
            updated_approvals += 1

    print("mode=apply")
    print(f"tasks_created={created_tasks} tasks_skipped={skipped_tasks}")
    print(f"dependencies_patched={dep_patched}")
    print(
        f"approvals_created={created_approvals} approvals_skipped={skipped_approvals} approvals_status_updated={updated_approvals}"
    )
    print("ready_for_apply=true")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
