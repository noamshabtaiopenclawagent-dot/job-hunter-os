"""Deterministic session-key helpers for OpenClaw gateway infrastructure."""

from __future__ import annotations

from uuid import UUID

from app.services.openclaw.shared import GatewayAgentIdentity


def gateway_main_session_key(gateway_id: UUID) -> str:
    """Return the deterministic session key for a gateway-main agent."""
    return GatewayAgentIdentity.session_key_for_id(gateway_id)
