#!/usr/bin/env python3
"""Idempotent Mission Control board-structure upgrade.

Creates (if missing):
- Board group: Agent Ops
- Boards: OPI, Bob, Alex, Dash, Mico, Rex, Cronx, Sentry, Executive Control

Uniqueness rule: board name + board_group_id.
"""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

API_BASE = "http://127.0.0.1:8000/api/v1"
GROUP_NAME = "Agent Ops"
GROUP_SLUG = "agent-ops"
GROUP_DESCRIPTION = "Agent operations boards"
BOARD_NAMES = [
    "OPI",
    "Bob",
    "Alex",
    "Dash",
    "Mico",
    "Rex",
    "Cronx",
    "Sentry",
    "Executive Control",
]


def _load_local_auth_token() -> str:
    env_path = Path(__file__).resolve().parents[1] / ".env"
    if not env_path.exists():
        raise RuntimeError(f"Missing env file: {env_path}")
    content = env_path.read_text(encoding="utf-8")
    match = re.search(r"^LOCAL_AUTH_TOKEN=(.*)$", content, flags=re.MULTILINE)
    if not match:
        raise RuntimeError("LOCAL_AUTH_TOKEN not found in backend/.env")
    raw = match.group(1).strip()
    if (raw.startswith('"') and raw.endswith('"')) or (raw.startswith("'") and raw.endswith("'")):
        raw = raw[1:-1]
    if not raw:
        raise RuntimeError("LOCAL_AUTH_TOKEN is empty")
    return raw


def _request(
    token: str,
    method: str,
    path: str,
    payload: dict[str, Any] | None = None,
    query: dict[str, Any] | None = None,
) -> dict[str, Any]:
    url = f"{API_BASE}{path}"
    if query:
        url = f"{url}?{urllib.parse.urlencode(query)}"
    data: bytes | None = None
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    }
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url=url, method=method.upper(), data=data, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {exc.code} {method} {path}: {body}") from exc


def _list_all(token: str, path: str) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    limit = 100
    offset = 0
    while True:
        page = _request(token, "GET", path, query={"limit": limit, "offset": offset})
        page_items = page.get("items", [])
        items.extend(page_items)
        total = int(page.get("total", len(items)))
        offset += len(page_items)
        if len(page_items) == 0 or offset >= total:
            break
    return items


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "board"


def main() -> int:
    token = _load_local_auth_token()

    gateways = _list_all(token, "/gateways")
    if not gateways:
        raise RuntimeError("No gateway found; cannot create boards")
    gateway_id = gateways[0]["id"]

    groups = _list_all(token, "/board-groups")
    group = next((g for g in groups if g.get("name") == GROUP_NAME), None)
    group_status = "existing"
    if group is None:
        group = _request(
            token,
            "POST",
            "/board-groups",
            payload={
                "name": GROUP_NAME,
                "slug": GROUP_SLUG,
                "description": GROUP_DESCRIPTION,
            },
        )
        group_status = "created"
    group_id = group["id"]

    boards = _list_all(token, "/boards")
    existing_by_key: dict[tuple[str, str], dict[str, Any]] = {}
    for board in boards:
        bid_group = board.get("board_group_id")
        if bid_group:
            existing_by_key[(board.get("name", ""), bid_group)] = board

    result_rows: list[dict[str, str]] = []
    created = 0
    existing = 0

    for name in BOARD_NAMES:
        key = (name, group_id)
        board = existing_by_key.get(key)
        status = "existing"
        if board is None:
            board = _request(
                token,
                "POST",
                "/boards",
                payload={
                    "name": name,
                    "slug": _slugify(name),
                    "description": f"{name} operations board",
                    "gateway_id": gateway_id,
                    "board_group_id": group_id,
                    "board_type": "execution",
                    "goal_confirmed": False,
                    "require_approval_for_done": False,
                    "max_agents": 3,
                },
            )
            status = "created"
            created += 1
        else:
            existing += 1
        result_rows.append({"name": name, "status": status, "id": board["id"]})

    boards_after = _list_all(token, "/boards")
    print(
        json.dumps(
            {
                "group": {"name": GROUP_NAME, "id": group_id, "status": group_status},
                "gateway_id": gateway_id,
                "boards_total_before": len(boards),
                "boards_total_after": len(boards_after),
                "created": created,
                "existing": existing,
                "rows": result_rows,
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # pragma: no cover
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
