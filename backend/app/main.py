from fastapi import FastAPI

from app.models.database import Base, engine
from app.models import models
from app.routes.upload import router as upload_router
from app.routes.verification import router as verification_router



Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="VeriDoc AI API",
    description="AI-powered document verification backend",
    version="1.0.0",
)

app.include_router(upload_router)
app.include_router(verification_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "ok"
    }