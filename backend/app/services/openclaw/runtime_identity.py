"""Helpers for classifying Mission Control agent runtimes.

Mission Control now supports only canonical OpenClaw personas (`main`/`OPI`
and `bob`) plus the non-persona gateway-main infrastructure identity.
"""

from __future__ import annotations

import re
from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any, Literal

from app.models.agents import Agent

RuntimeMode = Literal[
    "gateway_main",
    "canonical_openclaw",
    "unknown",
]

_ALNUM_RE = re.compile(r"[^a-z0-9]+")
_GATEWAY_MAIN_PREFIX = "agent:mc-gateway-"

_PERSONA_ALIASES = {
    "main": "main",
    "opi": "main",
    "bob": "bob",
}

_CANONICAL_PERSONA_PROFILE_KEYS = (
    "canonical_runtime_agent_id",
    "canonical_agent_id",
    "canonical_persona",
)
@dataclass(frozen=True, slots=True)
class RuntimeIdentity:
    """Resolved runtime classification for an agent row."""

    logical_name: str
    runtime_mode: RuntimeMode
    canonical_persona: str | None
    canonical_runtime_agent_id: str | None
    canonical_session_key: str | None
    is_canonical_candidate: bool


def _normalize_token(value: object) -> str:
    if value is None:
        return ""
    normalized = _ALNUM_RE.sub("", str(value).strip().lower())
    return normalized


def _normalize_label(value: object) -> str:
    token = _normalize_token(value)
    if not token:
        return "unknown"
    return token


def canonical_persona_for_name(value: object) -> str | None:
    """Resolve a display name to a known canonical persona, if any."""
    raw_name = _normalize_token(value)
    if raw_name in _PERSONA_ALIASES:
        return _PERSONA_ALIASES[raw_name]
    return None


def canonical_persona_for_request(
    name: object,
    identity_profile: Mapping[str, Any] | None = None,
) -> str | None:
    """Resolve the canonical persona implied by a create/update request."""
    if isinstance(identity_profile, Mapping):
        for key in _CANONICAL_PERSONA_PROFILE_KEYS:
            candidate = canonical_persona_for_name(identity_profile.get(key))
            if candidate is not None:
                return candidate
    return canonical_persona_for_name(name)


def allows_distinct_board_runtime(identity_profile: Mapping[str, Any] | None) -> bool:
    """Alias runtimes are disabled in the canonical two-agent architecture."""
    _ = identity_profile
    return False


def canonical_runtime_enabled(identity_profile: Mapping[str, Any] | None) -> bool:
    """Return whether an identity profile explicitly names a canonical persona."""
    if not isinstance(identity_profile, Mapping):
        return False
    for key in _CANONICAL_PERSONA_PROFILE_KEYS:
        if canonical_persona_for_name(identity_profile.get(key)) is not None:
            return True
    return False


def canonical_runtime_persona_for_agent(agent: Agent) -> str | None:
    """Return the canonical persona id for the supported two-agent runtime."""
    return _canonical_persona_from_agent(agent)


def _canonical_persona_from_agent(agent: Agent) -> str | None:
    profile_value = getattr(agent, "identity_profile", None)
    profile = profile_value if isinstance(profile_value, dict) else {}
    return canonical_persona_for_request(getattr(agent, "name", None), profile)


def canonical_session_key_for_persona(persona: str | None) -> str | None:
    if persona is None:
        return None
    if persona == "main":
        return "agent:main:main"
    return f"agent:{persona}:main"


def classify_runtime_identity(agent: Agent) -> RuntimeIdentity:
    """Return a stable runtime classification for an agent row.

    This is intentionally read-only and non-destructive.
    """

    session_key = (agent.openclaw_session_id or "").strip()
    canonical_persona = _canonical_persona_from_agent(agent)
    canonical_session_key = canonical_session_key_for_persona(canonical_persona)

    if agent.board_id is None and session_key.startswith(_GATEWAY_MAIN_PREFIX):
        runtime_mode: RuntimeMode = "gateway_main"
    elif canonical_session_key and session_key == canonical_session_key:
        runtime_mode = "canonical_openclaw"
    else:
        runtime_mode = "unknown"

    return RuntimeIdentity(
        logical_name=canonical_persona or _normalize_label(agent.name),
        runtime_mode=runtime_mode,
        canonical_persona=canonical_persona,
        canonical_runtime_agent_id=canonical_persona,
        canonical_session_key=canonical_session_key,
        is_canonical_candidate=False,
    )
