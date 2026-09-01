import re
from datetime import date, datetime
from typing import Any


REQUIRED_DOCUMENTS = {
    "PAN",
    "AADHAAR",
    "ADDRESS_PROOF",
    "BUSINESS_REGISTRATION",
    "PHOTOGRAPH",
}


def create_issue(
    issue_type: str,
    severity: str,
    message: str,
    recommendation: str,
    document_type: str | None = None,
) -> dict:
    """
    Create a standardized validation issue.
    """

    return {
        "type": issue_type,
        "severity": severity,
        "message": message,
        "recommendation": recommendation,
        "document_type": document_type,
    }


# ============================================================
# REQUIRED DOCUMENT VALIDATION
# ============================================================

def validate_required_documents(
    uploaded_document_types: set[str],
) -> list[dict]:
    """
    Check whether all required document types are present.
    """

    issues = []

    for required_document in REQUIRED_DOCUMENTS:

        if required_document not in uploaded_document_types:

            issues.append(
                create_issue(
                    issue_type="MISSING_DOCUMENT",
                    severity="error",
                    message=(
                        f"{required_document.replace('_', ' ').title()} "
                        "is missing."
                    ),
                    recommendation=(
                        f"Upload your {required_document.replace('_', ' ').title()}."
                    ),
                    document_type=required_document,
                )
            )

    return issues


# ============================================================
# REQUIRED FIELD VALIDATION
# ============================================================

def validate_required_fields(
    document_type: str,
    fields: dict[str, Any],
) -> list[dict]:
    """
    Check whether important fields were successfully extracted.
    """

    required_fields = {
        "PAN": [
            "name",
            "pan_number",
        ],
        "AADHAAR": [
            "name",
            "aadhaar_number",
        ],
        "ADDRESS_PROOF": [
            "name",
            "address",
        ],
        "BUSINESS_REGISTRATION": [
            "business_name",
            "registration_number",
        ],
        "PHOTOGRAPH": [
            "face_present",
        ],
    }

    issues = []

    for field in required_fields.get(
        document_type,
        [],
    ):

        value = fields.get(field)

        if value is None or str(value).strip() == "":
            issues.append(
                create_issue(
                    issue_type="MISSING_FIELD",
                    severity="warning",
                    message=(
                        f"{field.replace('_', ' ').title()} "
                        f"could not be extracted from the {document_type.replace('_', ' ').title()}."
                    ),
                    recommendation=(
                        "Upload a clearer document or verify the information manually."
                    ),
                    document_type=document_type,
                )
            )

    return issues


# ============================================================
# PAN VALIDATION
# ============================================================

def validate_pan_number(
    pan_number: str | None,
) -> list[dict]:
    """
    Validate PAN format.

    Expected format:
    ABCDE1234F
    """

    if not pan_number:
        return []

    normalized = (
        pan_number
        .strip()
        .upper()
        .replace(" ", "")
    )

    pattern = r"^[A-Z]{5}[0-9]{4}[A-Z]$"

    if not re.fullmatch(
        pattern,
        normalized,
    ):
        return [
            create_issue(
                issue_type="INVALID_PAN_FORMAT",
                severity="error",
                message="PAN number format is invalid.",
                recommendation=(
                    "Verify that the PAN number contains 10 characters "
                    "in the correct format."
                ),
                document_type="PAN",
            )
        ]

    return []


# ============================================================
# AADHAAR VALIDATION
# ============================================================

def validate_aadhaar_number(
    aadhaar_number: str | None,
) -> list[dict]:
    """
    Validate Aadhaar number format.

    Expected:
    12 digits
    """

    if not aadhaar_number:
        return []

    normalized = re.sub(
        r"\s+",
        "",
        aadhaar_number,
    )

    if not re.fullmatch(
        r"\d{12}",
        normalized,
    ):
        return [
            create_issue(
                issue_type="INVALID_AADHAAR_FORMAT",
                severity="error",
                message="Aadhaar number format is invalid.",
                recommendation=(
                    "Verify that the Aadhaar number contains 12 digits."
                ),
                document_type="AADHAAR",
            )
        ]

    return []


# ============================================================
# DATE PARSING
# ============================================================

def parse_date(
    value: Any,
) -> date | None:
    """
    Convert common date formats into a Python date.
    """

    if not value:
        return None

    if isinstance(value, date):
        return value

    value = str(value).strip()

    formats = [
        "%Y-%m-%d",
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%d.%m.%Y",
        "%Y/%m/%d",
    ]

    for fmt in formats:
        try:
            return datetime.strptime(
                value,
                fmt,
            ).date()
        except ValueError:
            continue

    return None


# ============================================================
# EXPIRY VALIDATION
# ============================================================

def validate_expiry(
    document_type: str,
    expiry_date: Any,
) -> list[dict]:
    """
    Check whether a document has expired.
    """

    parsed_date = parse_date(
        expiry_date
    )

    if not parsed_date:
        return []

    if parsed_date < date.today():

        return [
            create_issue(
                issue_type="DOCUMENT_EXPIRED",
                severity="error",
                message=(
                    f"{document_type.replace('_', ' ').title()} "
                    "has expired."
                ),
                recommendation=(
                    "Upload a valid, currently active document."
                ),
                document_type=document_type,
            )
        ]

    return []


# ============================================================
# DOCUMENT-LEVEL VALIDATION
# ============================================================

def validate_document(
    document_type: str,
    fields: dict[str, Any],
) -> list[dict]:
    """
    Run all applicable validations for one document.
    """

    issues = []

    issues.extend(
        validate_required_fields(
            document_type,
            fields,
        )
    )

    if document_type == "PAN":
        issues.extend(
            validate_pan_number(
                fields.get("pan_number")
            )
        )

    elif document_type == "AADHAAR":
        issues.extend(
            validate_aadhaar_number(
                fields.get("aadhaar_number")
            )
        )

    expiry_date = fields.get(
        "expiry_date"
    )

    if expiry_date:
        issues.extend(
            validate_expiry(
                document_type,
                expiry_date,
            )
        )

    return issues


# ============================================================
# COMPLETE VALIDATION
# ============================================================

def validate_application(
    documents: list[dict],
) -> list[dict]:
    """
    Run validation across all documents.
    """

    issues = []

    uploaded_types = {
        document.get("document_type")
        for document in documents
        if document.get("document_type")
        and document.get("document_type") != "UNKNOWN"
    }

    # Required documents
    issues.extend(
        validate_required_documents(
            uploaded_types
        )
    )

    # Individual documents
    for document in documents:

        document_type = document.get(
            "document_type"
        )

        fields = document.get(
            "fields",
            {}
        )

        if not document_type:
            continue

        issues.extend(
            validate_document(
                document_type,
                fields,
            )
        )

    return issues