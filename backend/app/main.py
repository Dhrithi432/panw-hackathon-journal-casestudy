from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import chat,insights

app = FastAPI(title="MindSpace Journal API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(insights.router, prefix="/api", tags=["insights"])  # Add this line


@app.get("/")
async def root():
    return {"message": "MindSpace Journal API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}