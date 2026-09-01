from fastapi import APIRouter, HTTPException

from app.services.verification_service import (
    verify_application,
)


router = APIRouter(
    prefix="/api/applications",
    tags=["Verification"],
)


# Temporary in-memory storage.
# We will connect this to SQLite in the next cleanup step.
verification_results: dict[str, dict] = {}


@router.post("/{application_id}/verify")
def verify(application_id: str):
    """
    Run complete verification for an application.
    """

    # For now, documents will come from the upload system.
    # We will connect the database records here next.
    raise HTTPException(
        status_code=501,
        detail=(
            "Verification endpoint is ready. "
            "Database document loading will be connected next."
        ),
    )


@router.get("/{application_id}/results")
def get_results(application_id: str):
    """
    Return the latest verification result.
    """

    result = verification_results.get(
        application_id
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Verification result not found.",
        )

    return result