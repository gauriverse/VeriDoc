import uuid
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.database import get_db
from app.models.document import Document
from app.services.quality_service import analyze_image_quality
from app.services.verification_service import verify_single_document, verify_application
from app.utils.hashing import calculate_sha256

router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB limit

# In-memory verification history store for quick API listing
history_records: list[dict] = []


def generate_application_id() -> str:
    return f"APP-{uuid.uuid4().hex[:8].upper()}"


def generate_document_id() -> str:
    return f"DOC-{uuid.uuid4().hex[:8].upper()}"


@router.post("/upload")
async def upload_documents(
    files: Annotated[list[UploadFile], File(...)],
    application_id: Annotated[str | None, Form()] = None,
    db: Session = Depends(get_db),
):
    if not files:
        raise HTTPException(
            status_code=400,
            detail="No files were uploaded. Please select a valid document file.",
        )

    if application_id:
        application = (
            db.query(Application)
            .filter(Application.application_id == application_id)
            .first()
        )
        if not application:
            raise HTTPException(
                status_code=404,
                detail="Application not found.",
            )
    else:
        application_id = generate_application_id()
        application = Application(
            application_id=application_id,
            status="created",
        )
        db.add(application)
        db.commit()
        db.refresh(application)

    uploaded_documents = []

    for file in files:
        filename = file.filename or ""
        extension = Path(filename).suffix.lower()

        if extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Unsupported file format: '{extension}'. "
                    "Please upload JPG, JPEG, PNG, or PDF files."
                ),
            )

        file_bytes = await file.read()
        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail=f"File '{filename}' is empty.",
            )

        if len(file_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File '{filename}' exceeds maximum allowed size of 10MB.",
            )

        file_hash = calculate_sha256(file_bytes)

        duplicate = (
            db.query(Document)
            .filter(
                Document.application_id == application.id,
                Document.file_hash == file_hash,
            )
            .first()
        )

        if duplicate:
            uploaded_documents.append(
                {
                    "id": duplicate.document_id,
                    "filename": duplicate.filename,
                    "size": len(file_bytes),
                    "status": "duplicate",
                    "message": "Duplicate document detected.",
                }
            )
            continue

        document_id = generate_document_id()
        safe_filename = f"{document_id}{extension}"
        file_path = UPLOAD_DIR / safe_filename
        file_path.write_bytes(file_bytes)

        quality_result = None
        if extension in {".jpg", ".jpeg", ".png"}:
            quality_result = analyze_image_quality(str(file_path))

        document = Document(
            document_id=document_id,
            application_id=application.id,
            filename=filename,
            file_path=str(file_path),
            file_hash=file_hash,
            status="uploaded",
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        uploaded_documents.append(
            {
                "id": document.document_id,
                "filename": document.filename,
                "size": len(file_bytes),
                "status": "uploaded",
                "quality": quality_result,
            }
        )

    return {
        "application_id": application.application_id,
        "documents": uploaded_documents,
    }


@router.post("/verify")
async def verify_document_direct(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Direct single document upload & verification endpoint.
    Accepts image or PDF, saves file, runs complete verification, stores result and returns.
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No document file provided for verification.",
        )

    filename = file.filename
    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format: '{extension}'. Please upload JPG, JPEG, PNG, or PDF.",
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"Uploaded file '{filename}' is empty.",
        )

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File '{filename}' exceeds maximum allowed size of 10MB.",
        )

    doc_id = generate_document_id()
    safe_filename = f"{doc_id}{extension}"
    file_path = UPLOAD_DIR / safe_filename
    file_path.write_bytes(file_bytes)

    # Execute verification pipeline
    result = verify_single_document(str(file_path), filename)
    result["id"] = doc_id
    result["filename"] = filename
    result["timestamp"] = str(Path(file_path).stat().st_mtime)

    # Save to history
    history_records.insert(0, result)

    return result


@router.get("/history")
def get_verification_history():
    """
    Get history of document verifications.
    """
    return {
        "history": history_records
    }


@router.get("/{document_id}")
def get_document_verification(document_id: str):
    """
    Get single document verification result by ID.
    """
    record = next((r for r in history_records if r.get("id") == document_id), None)
    if not record:
        raise HTTPException(
            status_code=404,
            detail=f"Verification result for document ID '{document_id}' not found.",
        )
    return record
