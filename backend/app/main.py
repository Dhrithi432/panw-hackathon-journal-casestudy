from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from app.api import chat, insights, sessions
from app.db import init_db
from app.core.config import settings
from app.middleware.body_limit import BodyLimitMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="MindSpace Journal API", lifespan=lifespan)

# Rate limiting (per-IP)
limiter = Limiter(key_func=get_remote_address, default_limits=[settings.rate_limit])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Middleware: body limit first (reject large payloads), then CORS
app.add_middleware(BodyLimitMiddleware, max_bytes=settings.max_body_bytes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(insights.router, prefix="/api", tags=["insights"])
app.include_router(sessions.router, prefix="/api", tags=["sessions"])


@app.get("/")
async def root():
    return {"message": "MindSpace Journal API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}