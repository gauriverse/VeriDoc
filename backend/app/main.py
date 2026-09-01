from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models.database import Base, engine
from app.routes.upload import router as upload_router
from app.routes.verification import router as verification_router
from app.services.ocr_service import verify_tesseract_installed

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VeriDoc API",
    description="Document verification & information extraction backend",
    version="1.0.0",
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(verification_router)


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "tesseract_installed": verify_tesseract_installed()
    }