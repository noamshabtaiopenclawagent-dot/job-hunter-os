from __future__ import annotations

from uuid import uuid4

from app.models.agents import Agent
from app.services.openclaw.runtime_identity import (
    canonical_runtime_enabled,
    canonical_runtime_persona_for_agent,
    canonical_persona_for_request,
    canonical_session_key_for_persona,
    classify_runtime_identity,
)


def test_canonical_session_key_for_personas() -> None:
    assert canonical_session_key_for_persona("main") == "agent:main:main"
    assert canonical_session_key_for_persona("bob") == "agent:bob:main"
    assert canonical_session_key_for_persona(None) is None


def test_canonical_persona_for_request_uses_profile_then_name() -> None:
    assert canonical_persona_for_request("BOB") == "bob"
    assert canonical_persona_for_request("worker", {"canonical_persona": "OPI"}) == "main"
    assert canonical_persona_for_request("worker") is None


def test_canonical_runtime_enablement_and_persona_resolution() -> None:
    agent = Agent(
        id=uuid4(),
        board_id=uuid4(),
        gateway_id=uuid4(),
        name="BOB",
        identity_profile={
            "canonical_runtime_enabled": "true",
            "canonical_runtime_agent_id": "bob",
        },
    )

    assert canonical_runtime_enabled(agent.identity_profile) is True
    assert canonical_runtime_persona_for_agent(agent) == "bob"


def test_unknown_session_is_not_treated_as_a_supported_runtime() -> None:
    agent = Agent(
        id=uuid4(),
        board_id=uuid4(),
        gateway_id=uuid4(),
        name="BOB",
        openclaw_session_id=f"agent:worker-{uuid4()}:main",
    )

    identity = classify_runtime_identity(agent)

    assert identity.logical_name == "bob"
    assert identity.runtime_mode == "unknown"
    assert identity.canonical_persona == "bob"
    assert identity.canonical_runtime_agent_id == "bob"
    assert identity.canonical_session_key == "agent:bob:main"
    assert identity.is_canonical_candidate is False


def test_canonical_board_agent_is_classified_correctly() -> None:
    agent = Agent(
        id=uuid4(),
        board_id=uuid4(),
        gateway_id=uuid4(),
        name="OPI",
        openclaw_session_id="agent:main:main",
    )

    identity = classify_runtime_identity(agent)

    assert identity.runtime_mode == "canonical_openclaw"
    assert identity.canonical_persona == "main"
    assert identity.is_canonical_candidate is False


def test_gateway_main_remains_distinct_from_named_personas() -> None:
    agent = Agent(
        id=uuid4(),
        board_id=None,
        gateway_id=uuid4(),
        name="Gateway Agent",
        openclaw_session_id=f"agent:mc-gateway-{uuid4()}:main",
    )

    identity = classify_runtime_identity(agent)

    assert identity.runtime_mode == "gateway_main"
    assert identity.canonical_persona is None
    assert identity.is_canonical_candidate is False
