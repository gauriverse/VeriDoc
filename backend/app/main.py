from fastapi import FastAPI

from app.models.database import Base, engine
from app.models import models
from app.routes.upload import router as upload_router



Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="VeriDoc AI API",
    description="AI-powered document verification backend",
    version="1.0.0",
)

app.include_router(upload_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "ok"
    }