from app.services.ai_service import (
    classify_document,
    extract_fields,
)
from app.services.ocr_service import extract_text
from app.services.validation_service import (
    validate_application,
)
from app.services.scoring_service import (
    calculate_readiness_score,
)


def verify_application(
    documents: list[dict],
) -> dict:
    """
    Run the complete document verification pipeline.
    """

    processed_documents = []

    for document in documents:

        file_path = document["file_path"]
        filename = document["filename"]

        # -----------------------------
        # OCR
        # -----------------------------

        try:
            ocr_text = extract_text(file_path)

        except Exception as exc:

            processed_documents.append(
                {
                    "id": document["id"],
                    "filename": filename,
                    "type": "UNKNOWN",
                    "status": "failed",
                    "confidence": 0.0,
                    "fields": {},
                    "issues": [
                        {
                            "type": "OCR_FAILED",
                            "severity": "error",
                            "message": str(exc),
                            "recommendation": (
                                "Upload a clearer document."
                            ),
                        }
                    ],
                }
            )

            continue

        # -----------------------------
        # Classification
        # -----------------------------

        classification = classify_document(
            ocr_text
        )

        document_type = classification[
            "document_type"
        ]

        confidence = classification[
            "confidence"
        ]

        # -----------------------------
        # Field extraction
        # -----------------------------

        fields = extract_fields(
            ocr_text,
            document_type,
        )

        processed_documents.append(
            {
                "id": document["id"],
                "filename": filename,
                "type": document_type,
                "status": "processed",
                "confidence": confidence,
                "fields": fields,
                "ocr_text": ocr_text,
                "issues": [],
            }
        )

    # -----------------------------
    # Validation
    # -----------------------------

    validation_documents = [
        {
            "document_type": document["type"],
            "fields": document["fields"],
        }
        for document in processed_documents
        if document["type"] != "UNKNOWN"
    ]

    issues = validate_application(
        validation_documents
    )

    # -----------------------------
    # Attach issues
    # -----------------------------

    for issue in issues:

        document_type = issue.get(
            "document_type"
        )

        if not document_type:
            continue

        for document in processed_documents:

            if document["type"] == document_type:

                document["issues"].append(
                    issue
                )

    # -----------------------------
    # Determine document status
    # -----------------------------

    for document in processed_documents:

        document_issues = document["issues"]

        has_error = any(
            issue["severity"] == "error"
            for issue in document_issues
        )

        has_warning = any(
            issue["severity"] == "warning"
            for issue in document_issues
        )

        if has_error:
            document["status"] = "failed"

        elif has_warning:
            document["status"] = "warning"

        else:
            document["status"] = "verified"

        document.pop(
            "ocr_text",
            None,
        )

    # -----------------------------
    # Readiness score
    # -----------------------------

    score_result = calculate_readiness_score(
        processed_documents,
        issues,
    )

    # -----------------------------
    # Summary
    # -----------------------------

    verified = sum(
        1
        for document in processed_documents
        if document["status"] == "verified"
    )

    warnings = sum(
        1
        for document in processed_documents
        if document["status"] == "warning"
    )

    failed = sum(
        1
        for document in processed_documents
        if document["status"] == "failed"
    )

    missing = sum(
        1
        for issue in issues
        if issue["type"] == "MISSING_DOCUMENT"
    )

    # -----------------------------
    # Final result
    # -----------------------------

    return {
        "readiness_score": score_result["score"],
        "readiness_status": score_result["status"],
        "score_breakdown": score_result["breakdown"],
        "summary": {
            "verified": verified,
            "warnings": warnings,
            "missing": missing,
            "failed": failed,
        },
        "documents": processed_documents,
        "issues": issues,
    }