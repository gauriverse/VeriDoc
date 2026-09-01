from app.services.document_detection_service import classify_document

def test_classify_pan_document():
    ocr_text = """
    INCOME TAX DEPARTMENT
    GOVT. OF INDIA
    NAME: GAURI POTDAR
    PERMANENT ACCOUNT NUMBER: ABCDE1234F
    DATE OF BIRTH: 01/01/2005
    """
    res = classify_document(ocr_text)
    assert res["document_type"] == "PAN"
    assert res["confidence"] > 0.70

def test_classify_aadhaar_document():
    ocr_text = """
    GOVERNMENT OF INDIA
    UNIQUE IDENTIFICATION AUTHORITY OF INDIA
    NAME: GAURI POTDAR
    DOB: 01/01/2005
    AADHAAR NO: 1234 5678 9012
    MALE
    """
    res = classify_document(ocr_text)
    assert res["document_type"] == "AADHAAR"
    assert res["confidence"] > 0.70

def test_classify_educational_certificate():
    ocr_text = """
    BOARD OF SECONDARY EDUCATION
    STATEMENT OF MARKS
    ROLL NO: 123456
    NAME OF CANDIDATE: GAURI POTDAR
    PASSED WITH GRADE A
    YEAR: 2022
    """
    res = classify_document(ocr_text)
    assert res["document_type"] == "EDUCATIONAL_CERTIFICATE"

def test_classify_income_certificate():
    ocr_text = """
    INCOME CERTIFICATE
    REVENUE DEPARTMENT
    THIS IS TO CERTIFY THAT ANNUAL INCOME IS RS. 1,50,000
    ISSUED BY TEHSILDAR
    """
    res = classify_document(ocr_text)
    assert res["document_type"] == "INCOME_CERTIFICATE"

def test_classify_domicile_certificate():
    ocr_text = """
    DOMICILE CERTIFICATE
    BONAFIDE RESIDENT OF MAHARASHTRA
    ISSUED BY DISTRICT MAGISTRATE
    """
    res = classify_document(ocr_text)
    assert res["document_type"] == "DOMICILE_CERTIFICATE"

def test_classify_unknown_document():
    ocr_text = "Random unreadable text without document keywords 12345"
    res = classify_document(ocr_text)
    assert res["document_type"] == "UNKNOWN"
