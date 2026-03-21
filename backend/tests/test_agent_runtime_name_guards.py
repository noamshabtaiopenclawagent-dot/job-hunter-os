from __future__ import annotations

from dataclasses import dataclass
from types import SimpleNamespace
from uuid import UUID, uuid4

import pytest
from fastapi import HTTPException, status

import app.services.openclaw.provisioning_db as agent_service
from app.models.agents import Agent
from app.schemas.agents import AgentCreate, AgentHeartbeatCreate


class _ExecResult:
    def first(self) -> None:
        return None


@dataclass
class _SessionStub:
    exec_calls: int = 0

    async def exec(self, *_args: object, **_kwargs: object) -> _ExecResult:
        self.exec_calls += 1
        return _ExecResult()

    def add(self, *_args: object, **_kwargs: object) -> None:
        return None

    async def commit(self) -> None:
        return None

    async def refresh(self, *_args: object, **_kwargs: object) -> None:
        return None


@dataclass
class _BoardStub:
    id: UUID
    gateway_id: UUID
    max_agents: int = 5


@dataclass
class _GatewayStub:
    id: UUID


@pytest.mark.asyncio
async def test_ensure_unique_agent_name_blocks_non_canonical_names() -> None:
    session = _SessionStub()
    service = agent_service.AgentLifecycleService(session)  # type: ignore[arg-type]
    board = _BoardStub(id=uuid4(), gateway_id=uuid4())
    gateway = _GatewayStub(id=board.gateway_id)

    with pytest.raises(HTTPException) as exc_info:
        await service.ensure_unique_agent_name(
            board=board,  # type: ignore[arg-type]
            gateway=gateway,  # type: ignore[arg-type]
            requested_name="Worker",
        )

    assert exc_info.value.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert "Only canonical OPI/main and BOB agents are supported" in str(exc_info.value.detail)
    assert session.exec_calls == 0


@pytest.mark.asyncio
async def test_ensure_unique_agent_name_allows_supported_canonical_personas() -> None:
    session = _SessionStub()
    service = agent_service.AgentLifecycleService(session)  # type: ignore[arg-type]
    board = _BoardStub(id=uuid4(), gateway_id=uuid4())
    gateway = _GatewayStub(id=board.gateway_id)

    await service.ensure_unique_agent_name(
        board=board,  # type: ignore[arg-type]
        gateway=gateway,  # type: ignore[arg-type]
        requested_name="BOB",
    )

    assert session.exec_calls == 2


@pytest.mark.asyncio
async def test_create_agent_from_heartbeat_blocks_canonical_persona_duplicates(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    session = _SessionStub()
    service = agent_service.AgentLifecycleService(session)  # type: ignore[arg-type]

    board = _BoardStub(id=uuid4(), gateway_id=uuid4())
    gateway = _GatewayStub(id=board.gateway_id)
    payload = AgentHeartbeatCreate(name="Worker", board_id=board.id)
    actor = SimpleNamespace(actor_type="user", user=object(), agent=None)

    async def _fake_require_user_context(_user: object) -> SimpleNamespace:
        return SimpleNamespace(member=object(), organization=SimpleNamespace(id=uuid4()))

    async def _fake_require_board(*_args: object, **_kwargs: object) -> _BoardStub:
        return board

    async def _fake_require_gateway(*_args: object, **_kwargs: object) -> tuple[_GatewayStub, None]:
        return gateway, None

    monkeypatch.setattr(service, "require_user_context", _fake_require_user_context)
    monkeypatch.setattr(service, "require_board", _fake_require_board)
    monkeypatch.setattr(service, "require_gateway", _fake_require_gateway)
    monkeypatch.setattr(agent_service, "is_org_admin", lambda _member: True)

    with pytest.raises(HTTPException) as exc_info:
        await service.create_agent_from_heartbeat(payload=payload, actor=actor)  # type: ignore[arg-type]

    assert exc_info.value.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert "Only canonical OPI/main and BOB agents are supported" in str(exc_info.value.detail)
    assert session.exec_calls == 0


@pytest.mark.asyncio
async def test_create_agent_blocks_non_canonical_names_before_provisioning(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    session = _SessionStub()
    service = agent_service.AgentLifecycleService(session)  # type: ignore[arg-type]

    board = _BoardStub(id=uuid4(), gateway_id=uuid4())
    gateway = _GatewayStub(id=board.gateway_id)
    payload = AgentCreate(name="Worker", board_id=board.id)
    actor = SimpleNamespace(actor_type="user", user=object(), agent=None)

    async def _fake_coerce_agent_create_payload(
        payload: AgentCreate,
        actor: object,
    ) -> AgentCreate:
        _ = actor
        return payload

    async def _fake_require_board(*_args: object, **_kwargs: object) -> _BoardStub:
        return board

    async def _fake_enforce_board_spawn_limit_for_lead(**_kwargs: object) -> None:
        return None

    async def _fake_require_gateway(*_args: object, **_kwargs: object) -> tuple[_GatewayStub, None]:
        return gateway, None

    monkeypatch.setattr(service, "coerce_agent_create_payload", _fake_coerce_agent_create_payload)
    monkeypatch.setattr(service, "require_board", _fake_require_board)
    monkeypatch.setattr(
        service,
        "enforce_board_spawn_limit_for_lead",
        _fake_enforce_board_spawn_limit_for_lead,
    )
    monkeypatch.setattr(service, "require_gateway", _fake_require_gateway)

    with pytest.raises(HTTPException) as exc_info:
        await service.create_agent(payload=payload, actor=actor)  # type: ignore[arg-type]

    assert exc_info.value.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert "Only canonical OPI/main and BOB agents are supported" in str(exc_info.value.detail)
    assert session.exec_calls == 0


@pytest.mark.asyncio
async def test_update_name_guard_blocks_renaming_worker_to_non_canonical_name(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    session = _SessionStub()
    service = agent_service.AgentLifecycleService(session)  # type: ignore[arg-type]

    board = _BoardStub(id=uuid4(), gateway_id=uuid4())
    gateway = _GatewayStub(id=board.gateway_id)
    agent = Agent(
        id=uuid4(),
        board_id=board.id,
        gateway_id=gateway.id,
        name="Worker Agent",
        identity_profile={"role": "builder"},
    )

    async def _fake_require_board(*_args: object, **_kwargs: object) -> _BoardStub:
        return board

    async def _fake_require_gateway(*_args: object, **_kwargs: object) -> tuple[_GatewayStub, None]:
        return gateway, None

    monkeypatch.setattr(service, "require_board", _fake_require_board)
    monkeypatch.setattr(service, "require_gateway", _fake_require_gateway)

    with pytest.raises(HTTPException) as exc_info:
        await service.ensure_update_name_remains_unique(
            agent=agent,
            updates={"name": "Builder Worker"},
            make_main=None,
        )

    assert exc_info.value.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert "Only canonical OPI/main and BOB agents are supported" in str(exc_info.value.detail)
    assert session.exec_calls == 0


def test_resolve_session_key_uses_canonical_persona_when_enabled() -> None:
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

    assert agent_service.AgentLifecycleService.resolve_session_key(agent) == "agent:bob:main"
