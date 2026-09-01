def calculate_readiness_score(
    documents: list[dict],
    issues: list[dict],
) -> dict:
    """
    Calculate application readiness score out of 100.

    Weight:
    Required documents  - 30
    Document validity   - 25
    Consistency         - 25
    Quality             - 10
    Duplicates          - 10
    """

    score = 100

    missing_documents = sum(
        1
        for issue in issues
        if issue["type"] == "MISSING_DOCUMENT"
    )

    validity_errors = sum(
        1
        for issue in issues
        if issue["type"] in {
            "DOCUMENT_EXPIRED",
            "INVALID_PAN_FORMAT",
            "INVALID_AADHAAR_FORMAT",
        }
    )

    consistency_errors = sum(
        1
        for issue in issues
        if issue["type"] == "NAME_MISMATCH"
    )

    missing_fields = sum(
        1
        for issue in issues
        if issue["type"] == "MISSING_FIELD"
    )

    duplicate_errors = sum(
        1
        for issue in issues
        if issue["type"] == "DUPLICATE_DOCUMENT"
    )

    # Required documents: maximum 30 point deduction
    required_penalty = min(
        30,
        missing_documents * 6,
    )

    # Validity: maximum 25 point deduction
    validity_penalty = min(
        25,
        validity_errors * 8,
    )

    # Consistency: maximum 25 point deduction
    consistency_penalty = min(
        25,
        consistency_errors * 12,
    )

    # Missing fields affect consistency/data completeness
    field_penalty = min(
        10,
        missing_fields * 3,
    )

    # Duplicate penalty
    duplicate_penalty = min(
        10,
        duplicate_errors * 10,
    )

    score -= (
        required_penalty
        + validity_penalty
        + consistency_penalty
        + field_penalty
        + duplicate_penalty
    )

    score = max(
        0,
        min(100, score),
    )

    if score >= 85:
        status = "ready"
    elif score >= 70:
        status = "needs_review"
    elif score >= 50:
        status = "incomplete"
    else:
        status = "high_risk"

    return {
        "score": score,
        "status": status,
        "breakdown": {
            "required_documents": max(
                0,
                30 - required_penalty,
            ),
            "document_validity": max(
                0,
                25 - validity_penalty,
            ),
            "consistency": max(
                0,
                25 - consistency_penalty,
            ),
            "quality": 10,
            "duplicates": max(
                0,
                10 - duplicate_penalty,
            ),
        },
    }