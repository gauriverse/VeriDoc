from app.services.validation_service import validate_pan_number, validate_aadhaar_number

def test_validate_pan_number():
    assert validate_pan_number("ABCDE1234F") == []
    invalid_res = validate_pan_number("INVALID123")
    assert len(invalid_res) == 1
    assert invalid_res[0]["type"] == "INVALID_PAN_FORMAT"

def test_validate_aadhaar_number():
    assert validate_aadhaar_number("123456789012") == []
    assert validate_aadhaar_number("1234 5678 9012") == []
    invalid_res = validate_aadhaar_number("12345")
    assert len(invalid_res) == 1
    assert invalid_res[0]["type"] == "INVALID_AADHAAR_FORMAT"
