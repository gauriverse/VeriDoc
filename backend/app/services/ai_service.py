import json

from google import genai

from app.config import settings


client = genai.Client(
    api_key=settings.gemini_api_key
)


ALLOWED_DOCUMENT_TYPES = {
    "PAN",
    "AADHAAR",
    "ADDRESS_PROOF",
    "BUSINESS_REGISTRATION",
    "PHOTOGRAPH",
    "UNKNOWN",
}


FIELD_SCHEMAS = {
    "PAN": {
        "name": None,
        "pan_number": None,
        "date_of_birth": None,
    },
    "AADHAAR": {
        "name": None,
        "aadhaar_number": None,
        "date_of_birth": None,
        "address": None,
    },
    "ADDRESS_PROOF": {
        "name": None,
        "address": None,
        "document_date": None,
        "expiry_date": None,
    },
    "BUSINESS_REGISTRATION": {
        "business_name": None,
        "registration_number": None,
        "issue_date": None,
        "expiry_date": None,
    },
    "PHOTOGRAPH": {
        "face_present": None,
    },
}


CLASSIFICATION_PROMPT = """
You are a document classification system for a document
verification platform.

Classify the provided OCR text into exactly one of these
document types:

- PAN
- AADHAAR
- ADDRESS_PROOF
- BUSINESS_REGISTRATION
- PHOTOGRAPH
- UNKNOWN

Return ONLY valid JSON.

Required JSON format:

{
    "document_type": "PAN",
    "confidence": 0.95
}

Rules:

1. document_type must be one of the allowed values.
2. confidence must be a number between 0 and 1.
3. Do not include explanations.
4. Do not use markdown.
5. If the document cannot be confidently classified,
   return UNKNOWN.
"""


def classify_document(ocr_text: str) -> dict:
    """
    Classify a document using Gemini based on OCR text.
    """

    if not ocr_text.strip():
        return {
            "document_type": "UNKNOWN",
            "confidence": 0.0,
        }

    prompt = f"""
{CLASSIFICATION_PROMPT}

OCR TEXT:

{ocr_text}
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        result = json.loads(
            response.text.strip()
        )

        document_type = result.get(
            "document_type",
            "UNKNOWN",
        )

        confidence = float(
            result.get("confidence", 0.0)
        )

        if document_type not in ALLOWED_DOCUMENT_TYPES:
            document_type = "UNKNOWN"

        confidence = max(
            0.0,
            min(1.0, confidence),
        )

        return {
            "document_type": document_type,
            "confidence": round(
                confidence,
                2,
            ),
        }

    except (
        json.JSONDecodeError,
        ValueError,
        TypeError,
    ):
        return {
            "document_type": "UNKNOWN",
            "confidence": 0.0,
        }

    except Exception as exc:
        raise RuntimeError(
            f"Document classification failed: {exc}"
        ) from exc


def extract_fields(
    ocr_text: str,
    document_type: str,
) -> dict:
    """
    Extract structured fields from OCR text based
    on the classified document type.
    """

    if not ocr_text.strip():
        return {}

    if document_type not in FIELD_SCHEMAS:
        return {}

    fields = FIELD_SCHEMAS[document_type]

    field_names = list(fields.keys())

    extraction_prompt = f"""
You are a structured data extraction system for
a document verification platform.

Document type:
{document_type}

Extract ONLY the following fields:

{field_names}

OCR TEXT:

{ocr_text}

Return ONLY valid JSON.

Example:

{{
    "name": "GAURI BHUSHAN POTDAR",
    "pan_number": "ABCDE1234F",
    "date_of_birth": "2005-01-01"
}}

Rules:

1. Return exactly the requested field names.
2. If a field is not present or cannot be determined,
   return null.
3. Do not guess missing information.
4. Do not invent values.
5. Preserve the actual information from the document.
6. Do not include explanations.
7. Do not use markdown.
8. Dates should use YYYY-MM-DD when possible.
9. Keep addresses as complete text.
10. Return ONLY JSON.
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=extraction_prompt,
        )

        result = json.loads(
            response.text.strip()
        )

        cleaned_result = {}

        for field_name in field_names:
            cleaned_result[field_name] = result.get(
                field_name
            )

        return cleaned_result

    except (
        json.JSONDecodeError,
        ValueError,
        TypeError,
    ):
        return {
            field_name: None
            for field_name in field_names
        }

    except Exception as exc:
        raise RuntimeError(
            f"Field extraction failed: {exc}"
        ) from exc