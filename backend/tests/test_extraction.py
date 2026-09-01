from app.services.field_extraction_service import (
    extract_fields,
    extract_pan_fields,
    extract_aadhaar_fields,
)

def test_extract_pan_fields():
    ocr_text = """
    INCOME TAX DEPARTMENT
    PERMANENT ACCOUNT NUMBER
    ABCDE1234F
    GAURI POTDAR
    01/01/2005
    """
    fields = extract_pan_fields(ocr_text)
    assert fields["pan_number"] == "ABCDE1234F"
    assert fields["date_of_birth"] == "01/01/2005"
    assert fields["name"] == "GAURI POTDAR"

def test_extract_aadhaar_fields():
    ocr_text = """
    GOVERNMENT OF INDIA
    GAURI POTDAR
    DOB: 15/08/2002
    1234 5678 9012
    ADDRESS: 123 MAIN STREET
    """
    fields = extract_aadhaar_fields(ocr_text)
    assert fields["aadhaar_number"] == "123456789012"
    assert fields["date_of_birth"] == "15/08/2002"
    assert fields["address"] == "123 MAIN STREET"

def test_extract_fields_router():
    ocr_text = "PERMANENT ACCOUNT NUMBER ABCDE1234F"
    res = extract_fields(ocr_text, "PAN")
    assert res.get("pan_number") == "ABCDE1234F"
