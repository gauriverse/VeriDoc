import uuid
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.database import get_db
from app.models.document import Document
from app.services.quality_service import analyze_image_quality
from app.utils.hashing import calculate_sha256


router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"],
)


UPLOAD_DIR = Path("uploads")

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
}


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
            detail="No files were uploaded.",
        )

    # ---------------------------------------------------------
    # Find existing application or create a new one
    # ---------------------------------------------------------

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

    # ---------------------------------------------------------
    # Process each uploaded file
    # ---------------------------------------------------------

    for file in files:
        filename = file.filename or ""

        extension = Path(filename).suffix.lower()

        # Validate extension
        if extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Unsupported file type: {extension}. "
                    "Allowed types are PDF, JPG, JPEG and PNG."
                ),
            )

        # Read file
        file_bytes = await file.read()

        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail=f"File '{filename}' is empty.",
            )

        # -----------------------------------------------------
        # SHA-256
        # -----------------------------------------------------

        file_hash = calculate_sha256(file_bytes)

        # -----------------------------------------------------
        # Duplicate detection
        # -----------------------------------------------------

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

        # -----------------------------------------------------
        # Save file
        # -----------------------------------------------------

        document_id = generate_document_id()

        safe_filename = f"{document_id}{extension}"

        file_path = UPLOAD_DIR / safe_filename

        file_path.write_bytes(file_bytes)

        quality_result = None

        if extension in {".jpg", ".jpeg", ".png"}:
            quality_result = analyze_image_quality(str(file_path))

        # -----------------------------------------------------
        # Save document in database
        # -----------------------------------------------------

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
