from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.database import get_db
from app.models.document import Document
from app.services.verification_service import verify_application

router = APIRouter(
    prefix="/api/applications",
    tags=["Verification"],
)

verification_results: dict[str, dict] = {}


@router.post("/{application_id}/verify")
def verify(application_id: str, db: Session = Depends(get_db)):
    """
    Run complete verification for an application's uploaded documents.
    """
    application = (
        db.query(Application)
        .filter(Application.application_id == application_id)
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=404,
            detail=f"Application '{application_id}' not found.",
        )

    db_documents = (
        db.query(Document)
        .filter(Document.application_id == application.id)
        .all()
    )

    if not db_documents:
        raise HTTPException(
            status_code=400,
            detail="No documents have been uploaded for this application yet.",
        )

    docs_payload = [
        {
            "id": doc.document_id,
            "filename": doc.filename,
            "file_path": doc.file_path,
        }
        for doc in db_documents
    ]

    result = verify_application(docs_payload)
    result["application_id"] = application_id
    verification_results[application_id] = result

    application.status = "verified"
    db.commit()

    return result


@router.get("/{application_id}/results")
def get_results(application_id: str):
    """
    Return the latest verification result for an application.
    """
    result = verification_results.get(application_id)
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"Verification result for application '{application_id}' not found.",
        )
    return result