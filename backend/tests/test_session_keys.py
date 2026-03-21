# ruff: noqa: S101
"""Unit tests for deterministic gateway session-key helpers."""

from __future__ import annotations

from uuid import UUID

from app.services.openclaw.internal.session_keys import (
    gateway_main_session_key,
)
from app.services.openclaw.shared import GatewayAgentIdentity


def test_gateway_main_session_key_matches_gateway_identity() -> None:
    gateway_id = UUID("00000000-0000-0000-0000-000000000123")
    assert gateway_main_session_key(gateway_id) == GatewayAgentIdentity.session_key_for_id(
        gateway_id
    )
