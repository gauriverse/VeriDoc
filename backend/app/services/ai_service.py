import json

from google import genai

from app.config import settings


client = genai.Client(
    api_key=settings.gemini_api_key
)


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

        response_text = response.text.strip()

        result = json.loads(response_text)

        document_type = result.get(
            "document_type",
            "UNKNOWN",
        )

        confidence = float(
            result.get("confidence", 0.0)
        )

        allowed_types = {
            "PAN",
            "AADHAAR",
            "ADDRESS_PROOF",
            "BUSINESS_REGISTRATION",
            "PHOTOGRAPH",
            "UNKNOWN",
        }

        if document_type not in allowed_types:
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