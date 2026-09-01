from app.services.ai_service import classify_document


ocr_text = """
INCOME TAX DEPARTMENT
GOVT. OF INDIA

Permanent Account Number Card

Name
GAURI BHUSHAN POTDAR

PAN
ABCDE1234F
"""


result = classify_document(ocr_text)

print("\n========== CLASSIFICATION ==========\n")
print(result)
print("\n====================================\n")