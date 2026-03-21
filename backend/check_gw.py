from app.db.session import async_session_maker
from app.models.gateways import Gateway
from sqlmodel import select
import asyncio

async def check_gateways():
    async with async_session_maker() as session:
        statement = select(Gateway)
        results = await session.exec(statement)
        gateways = results.all()
        for gw in gateways:
            print(f"ID: {gw.id}, Name: {gw.name}, URL: {gw.url}, Workspace: {gw.workspace_root}")

if __name__ == "__main__":
    asyncio.run(check_gateways())
