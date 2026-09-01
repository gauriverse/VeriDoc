from app.services.document_detection_service import classify_document
from app.services.field_extraction_service import extract_fields
from app.services.ocr_service import extract_text
from app.services.scoring_service import calculate_readiness_score
from app.services.validation_service import validate_application, validate_document



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


def verify_single_document(file_path: str, filename: str) -> dict:
    """
    Run full verification pipeline for a single uploaded document.
    Returns status (VERIFIED, REVIEW_REQUIRED, INVALID), score, checks, and fields.
    """
    try:
        ocr_text = extract_text(file_path)
    except Exception as exc:
        return {
            "status": "INVALID",
            "score": 0,
            "document_type": "UNKNOWN",
            "confidence": 0.0,
            "fields": {},
            "checks": [
                {
                    "name": "OCR Quality",
                    "passed": False,
                    "message": f"Unable to extract text: {str(exc)}"
                }
            ],
            "warnings": ["OCR text extraction failed. Please upload a clearer document."]
        }

    classification = classify_document(ocr_text)
    doc_type = classification["document_type"]
    confidence = classification["confidence"]

    fields = extract_fields(ocr_text, doc_type)
    issues = validate_document(doc_type, fields)

    # Compute checks
    checks = [
        {
            "name": "OCR Quality",
            "passed": len(ocr_text.strip()) > 10,
            "message": "Readable text extracted" if len(ocr_text.strip()) > 10 else "Low text quality"
        },
        {
            "name": "Document Classification",
            "passed": doc_type != "UNKNOWN",
            "message": f"Document identified as {doc_type}" if doc_type != "UNKNOWN" else "Document type could not be confidently identified"
        }
    ]

    has_errors = any(i.get("severity") == "error" for i in issues)
    has_warnings = any(i.get("severity") == "warning" for i in issues)

    # Required field presence check
    extracted_values = [v for v in fields.values() if v is not None]
    fields_found = len(extracted_values) > 0
    checks.append({
        "name": "Required Fields",
        "passed": fields_found,
        "message": f"{len(extracted_values)} key fields extracted" if fields_found else "No key fields extracted"
    })

    # Pattern check
    checks.append({
        "name": "Format Validation",
        "passed": not has_errors,
        "message": "All format patterns passed" if not has_errors else "Format validation issues detected"
    })

    # Calculate score
    score = 100
    if doc_type == "UNKNOWN":
        score -= 30
    if not fields_found:
        score -= 25
    if has_errors:
        score -= 35
    elif has_warnings:
        score -= 15
    score = max(0, min(100, score))

    if score >= 80 and not has_errors and doc_type != "UNKNOWN":
        status = "VERIFIED"
    elif score >= 50:
        status = "REVIEW_REQUIRED"
    else:
        status = "INVALID"

    warnings_list = [i.get("message") for i in issues if i.get("message")]
    if doc_type == "UNKNOWN":
        warnings_list.append("Document type could not be confidently identified.")

    return {
        "status": status,
        "score": score,
        "document_type": doc_type,
        "confidence": confidence,
        "fields": fields,
        "checks": checks,
        "warnings": warnings_list,
        "disclaimer": "This result is an automated preliminary verification and does not guarantee legal authenticity."
    }