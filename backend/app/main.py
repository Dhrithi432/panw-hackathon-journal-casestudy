from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import chat

app = FastAPI(title="MindSpace Journal API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api", tags=["chat"])

@app.get("/")
async def root():
    return {"message": "MindSpace Journal API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}