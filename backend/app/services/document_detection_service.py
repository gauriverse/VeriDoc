import re
from typing import TypedDict


class ClassificationResult(TypedDict):
    document_type: str
    confidence: float


DOCUMENT_KEYWORDS = {
    "PAN": [
        (r"INCOME\s+TAX\s+DEPARTMENT", 3.0),
        (r"PERMANENT\s+ACCOUNT\s+NUMBER", 3.0),
        (r"GOVT\.\s+OF\s+INDIA", 1.0),
        (r"\b[A-Z]{5}[0-9]{4}[A-Z]\b", 4.0),
        (r"FATHER'S\s+NAME", 1.5),
    ],
    "AADHAAR": [
        (r"UNIQUE\s+IDENTIFICATION\s+AUTHORITY", 3.5),
        (r"GOVERNMENT\s+OF\s+INDIA", 1.5),
        (r"AADHAAR", 3.0),
        (r"MERI\s+AADHAAR", 2.5),
        (r"\b\d{4}\s\d{4}\s\d{4}\b", 4.0),
        (r"DOB\s*:\s*\d{2}/\d{2}/\d{4}", 2.0),
        (r"MALE|FEMALE", 1.0),
    ],
    "EDUCATIONAL_CERTIFICATE": [
        (r"UNIVERSITY|BOARD\s+OF\s+EDUCATION|SCHOOL", 2.5),
        (r"STATEMENT|MARKSHEET|DEGREE|DIPLOMA|PASSING|CERTIFICATE", 3.0),
        (r"EXAMINATION|ROLL\s+NO|REGISTRATION\s+NO", 2.5),
        (r"GRADE|PERCENTAGE|CGPA|MARKS\s+OBTAINED", 2.0),
        (r"BACHELOR|MASTER|SECONDARY|HIGHER\s+SECONDARY", 2.0),
    ],
    "INCOME_CERTIFICATE": [
        (r"INCOME\s+CERTIFICATE", 4.0),
        (r"ANNUAL\s+INCOME", 3.0),
        (r"TEHSILDAR|REVENUE\s+OFFICER|SUB-DIVISIONAL", 2.5),
        (r"RUPEES|RS\.\s*\d+", 2.0),
        (r"FINANCIAL\s+YEAR", 2.0),
    ],
    "DOMICILE_CERTIFICATE": [
        (r"DOMICILE\s+CERTIFICATE|RESIDENCE\s+CERTIFICATE", 4.0),
        (r"PERMANENT\s+RESIDENT|BONAFIDE\s+RESIDENT", 3.0),
        (r"TEHSILDAR|DISTRICT\s+MAGISTRATE", 2.0),
        (r"STATE\s+OF|NATIVE\s+OF", 2.0),
    ],
}


def classify_document(ocr_text: str) -> ClassificationResult:
    """
    Classify OCR text using rule-based pattern and keyword matching.
    Returns document_type and a confidence score between 0.0 and 1.0.
    """
    if not ocr_text or not ocr_text.strip():
        return {
            "document_type": "UNKNOWN",
            "confidence": 0.0,
        }

    text_upper = ocr_text.upper()
    scores: dict[str, float] = {doc_type: 0.0 for doc_type in DOCUMENT_KEYWORDS}

    for doc_type, patterns in DOCUMENT_KEYWORDS.items():
        for pattern, weight in patterns:
            if re.search(pattern, text_upper):
                scores[doc_type] += weight

    best_doc_type = max(scores, key=lambda k: scores[k])
    best_score = scores[best_doc_type]

    # Threshold for confident match
    if best_score < 2.5:
        return {
            "document_type": "UNKNOWN",
            "confidence": round(min(best_score / 5.0, 0.4), 2),
        }

    # Normalize confidence score between 0.65 and 0.99
    confidence = min(0.65 + (best_score / 15.0), 0.99)

    return {
        "document_type": best_doc_type,
        "confidence": round(confidence, 2),
    }
