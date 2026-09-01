import uuid
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.database import get_db
from app.models.document import Document


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
    db: Session = Depends(get_db),
):
    if not files:
        raise HTTPException(
            status_code=400,
            detail="No files were uploaded.",
        )

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
                    f"Unsupported file type: {extension}. "
                    "Allowed types are PDF, JPG, JPEG and PNG."
                ),
            )

        file_bytes = await file.read()

        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail=f"File '{filename}' is empty.",
            )

        document_id = generate_document_id()

        safe_filename = f"{document_id}{extension}"

        file_path = UPLOAD_DIR / safe_filename

        file_path.write_bytes(file_bytes)

        document = Document(
            document_id=document_id,
            application_id=application.id,
            filename=filename,
            file_path=str(file_path),
            file_hash="",
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
                "status": document.status,
            }
        )

    return {
        "application_id": application.application_id,
        "documents": uploaded_documents,
    }