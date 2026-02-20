"""Sessions and messages API."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from typing import List
from datetime import datetime

from app.db import get_db
from app.models.db_models import Session as DBSession, Message as DBMessage, gen_id

router = APIRouter()


class MessageSchema(BaseModel):
    id: str
    role: str
    content: str
    timestamp: datetime


class SessionSchema(BaseModel):
    id: str
    title: str
    messages: List[MessageSchema]
    created_at: datetime
    updated_at: datetime


class CreateSessionRequest(BaseModel):
    user_id: str
    title: str = "New Entry"


class SaveMessagesRequest(BaseModel):
    messages: List[dict]  # {id, role, content, timestamp}


class MigrateSessionItem(BaseModel):
    id: str
    title: str
    messages: List[dict]
    created_at: str | None = None
    updated_at: str | None = None


class MigrateRequest(BaseModel):
    user_id: str
    sessions: List[MigrateSessionItem]


class MigrateResponse(BaseModel):
    imported: int
    skipped: int


def _parse_timestamp(ts) -> datetime:
    if ts is None:
        return datetime.utcnow()
    if isinstance(ts, str):
        return datetime.fromisoformat(ts.replace("Z", "+00:00")) if "T" in ts else datetime.fromisoformat(ts)
    return ts


def _to_message_schema(m: DBMessage) -> MessageSchema:
    return MessageSchema(id=m.id, role=m.role, content=m.content, timestamp=m.timestamp)


def _title_from_messages(messages: list) -> str:
    first_user = next((m for m in messages if m.get("role") == "user"), None)
    if not first_user:
        return "New Entry"
    content = first_user.get("content", "")
    return content[:50] + ("..." if len(content) > 50 else "")


@router.get("/sessions", response_model=List[SessionSchema])
async def list_sessions(user_id: str, db: AsyncSession = Depends(get_db)):
    """List all sessions for a user."""
    result = await db.execute(
        select(DBSession)
        .where(DBSession.user_id == user_id)
        .order_by(DBSession.updated_at.desc())
        .options(selectinload(DBSession.messages))
    )
    sessions = result.scalars().all()
    return [
        SessionSchema(
            id=s.id,
            title=s.title,
            messages=[_to_message_schema(m) for m in s.messages],
            created_at=s.created_at,
            updated_at=s.updated_at,
        )
        for s in sessions
    ]


@router.post("/sessions", response_model=SessionSchema)
async def create_session(req: CreateSessionRequest, db: AsyncSession = Depends(get_db)):
    """Create a new session."""
    session = DBSession(user_id=req.user_id, title=req.title)
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return SessionSchema(
        id=session.id,
        title=session.title,
        messages=[],
        created_at=session.created_at,
        updated_at=session.updated_at,
    )


@router.get("/sessions/{session_id}", response_model=SessionSchema)
async def get_session(session_id: str, user_id: str, db: AsyncSession = Depends(get_db)):
    """Get a session with its messages."""
    result = await db.execute(
        select(DBSession)
        .where(DBSession.id == session_id, DBSession.user_id == user_id)
        .options(selectinload(DBSession.messages))
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionSchema(
        id=session.id,
        title=session.title,
        messages=[_to_message_schema(m) for m in session.messages],
        created_at=session.created_at,
        updated_at=session.updated_at,
    )


@router.put("/sessions/{session_id}/messages", response_model=SessionSchema)
async def save_messages(session_id: str, user_id: str, req: SaveMessagesRequest, db: AsyncSession = Depends(get_db)):
    """Replace all messages in a session."""
    result = await db.execute(
        select(DBSession)
        .where(DBSession.id == session_id, DBSession.user_id == user_id)
        .options(selectinload(DBSession.messages))
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    await db.execute(delete(DBMessage).where(DBMessage.session_id == session_id))

    for msg in req.messages:
        ts = msg.get("timestamp")
        if isinstance(ts, str):
            ts = datetime.fromisoformat(ts.replace("Z", "+00:00")) if "T" in ts else datetime.fromisoformat(ts)
        elif ts is None:
            ts = datetime.utcnow()
        db_msg = DBMessage(
            id=msg.get("id") or gen_id(),
            session_id=session_id,
            role=msg["role"],
            content=msg["content"],
            timestamp=ts,
        )
        db.add(db_msg)

    title = _title_from_messages(req.messages)
    if title != "New Entry":
        session.title = title

    await db.commit()
    await db.refresh(session)
    return SessionSchema(
        id=session.id,
        title=session.title,
        messages=[_to_message_schema(m) for m in session.messages],
        created_at=session.created_at,
        updated_at=session.updated_at,
    )


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, user_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a session."""
    result = await db.execute(select(DBSession).where(DBSession.id == session_id, DBSession.user_id == user_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    await db.delete(session)
    await db.commit()
    return {"ok": True}


@router.post("/migrate", response_model=MigrateResponse)
async def migrate_sessions(req: MigrateRequest, db: AsyncSession = Depends(get_db)):
    """Import localStorage sessions. Skips sessions that already exist (conflict handling)."""
    imported = 0
    skipped = 0
    for item in req.sessions:
        result = await db.execute(
            select(DBSession).where(DBSession.id == item.id, DBSession.user_id == req.user_id)
        )
        if result.scalar_one_or_none():
            skipped += 1
            continue
        session = DBSession(
            id=item.id,
            user_id=req.user_id,
            title=item.title or "New Entry",
        )
        db.add(session)
        for msg in item.messages:
            ts = _parse_timestamp(msg.get("timestamp"))
            db_msg = DBMessage(
                id=msg.get("id") or gen_id(),
                session_id=item.id,
                role=msg.get("role", "user"),
                content=msg.get("content", ""),
                timestamp=ts,
            )
            db.add(db_msg)
        imported += 1
    await db.commit()
    return MigrateResponse(imported=imported, skipped=skipped)
