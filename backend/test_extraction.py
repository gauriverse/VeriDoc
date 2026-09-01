from app.services.ai_service import (
    classify_document,
    extract_fields,
)


ocr_text = """
INCOME TAX DEPARTMENT
GOVERNMENT OF INDIA

PERMANENT ACCOUNT NUMBER CARD

Name

GAURI BHUSHAN POTDAR

Permanent Account Number

ABCDE1234F

Date of Birth

01/01/2005
"""


classification = classify_document(
    ocr_text
)

print("\n========== CLASSIFICATION ==========")
print(classification)


document_type = classification["document_type"]


fields = extract_fields(
    ocr_text,
    document_type,
)

print("\n========== EXTRACTED FIELDS ==========")
print(fields)