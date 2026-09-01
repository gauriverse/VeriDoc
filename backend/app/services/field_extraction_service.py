import re
from typing import Any


def extract_dates(text: str) -> list[str]:
    """
    Extract date strings from text matching DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD.
    """
    patterns = [
        r"\b\d{2}[/-]\d{2}[/-]\d{4}\b",
        r"\b\d{4}[/-]\d{2}[/-]\d{2}\b",
    ]
    matches = []
    for pattern in patterns:
        for m in re.finditer(pattern, text):
            matches.append(m.group(0))
    return list(dict.fromkeys(matches))


def extract_pan_fields(ocr_text: str) -> dict[str, Any]:
    fields: dict[str, Any] = {
        "name": None,
        "pan_number": None,
        "date_of_birth": None,
    }

    # PAN Number pattern: 5 uppercase letters, 4 digits, 1 uppercase letter
    pan_match = re.search(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b", ocr_text)
    if pan_match:
        fields["pan_number"] = pan_match.group(0)

    # DOB pattern
    dates = extract_dates(ocr_text)
    if dates:
        fields["date_of_birth"] = dates[0]

    # Name extraction heuristic: lines after Govt or Income Tax headers
    lines = [line.strip() for line in ocr_text.splitlines() if line.strip()]
    for i, line in enumerate(lines):
        if "INCOME TAX" in line.upper() or "GOVT OF INDIA" in line.upper():
            continue
        # Look for full uppercase name line without digits/symbols
        if re.fullmatch(r"[A-Z\s]{3,40}", line) and "DEPARTMENT" not in line.upper() and "GOVT" not in line.upper():
            fields["name"] = line
            break

    return fields


def extract_aadhaar_fields(ocr_text: str) -> dict[str, Any]:
    fields: dict[str, Any] = {
        "name": None,
        "aadhaar_number": None,
        "date_of_birth": None,
        "address": None,
    }

    # Aadhaar Number pattern: 12 digits (with optional spaces)
    aadhaar_match = re.search(r"\b\d{4}\s?\d{4}\s?\d{4}\b", ocr_text)
    if aadhaar_match:
        fields["aadhaar_number"] = aadhaar_match.group(0).replace(" ", "")

    # DOB / YOB pattern
    dates = extract_dates(ocr_text)
    if dates:
        fields["date_of_birth"] = dates[0]
    else:
        yob_match = re.search(r"\b(19|20)\d{2}\b", ocr_text)
        if yob_match:
            fields["date_of_birth"] = yob_match.group(0)

    # Name heuristic
    lines = [line.strip() for line in ocr_text.splitlines() if line.strip()]
    for line in lines:
        if re.search(r"DOB|YEAR OF BIRTH|MALE|FEMALE|INDIA|AUTHORITY", line.upper()):
            continue
        if re.fullmatch(r"[A-Z\s]{3,40}", line.upper()):
            fields["name"] = line
            break

    # Address heuristic
    address_match = re.search(r"(?:ADDRESS|ADDR)\s*:\s*(.+)", ocr_text, re.IGNORECASE)
    if address_match:
        fields["address"] = address_match.group(1).strip()

    return fields


def extract_educational_fields(ocr_text: str) -> dict[str, Any]:
    fields: dict[str, Any] = {
        "student_name": None,
        "institution": None,
        "course": None,
        "roll_number": None,
        "year": None,
        "marks_grade": None,
    }

    # Roll / Reg Number
    roll_match = re.search(r"(?:ROLL\s*(?:NO|NUMBER)?|REG(?:ISTRATION)?\s*(?:NO|NUMBER)?)\s*[:.-]?\s*([A-Z0-9/-]+)", ocr_text, re.IGNORECASE)
    if roll_match:
        fields["roll_number"] = roll_match.group(1).strip()

    # Year of passing
    year_match = re.search(r"\b(19\d{2}|20\d{2})\b", ocr_text)
    if year_match:
        fields["year"] = year_match.group(1)

    # Marks / Percentage / Grade
    marks_match = re.search(r"(\b\d{1,3}(?:\.\d{1,2})?\s*%\b|\bCGPA\s*[:.-]?\s*\d+(?:\.\d+)?\b|\bGRADE\s*[:.-]?\s*[A-S]\+?\b)", ocr_text, re.IGNORECASE)
    if marks_match:
        fields["marks_grade"] = marks_match.group(0).strip()

    # Institution name heuristic
    lines = [line.strip() for line in ocr_text.splitlines() if line.strip()]
    for line in lines:
        if re.search(r"UNIVERSITY|BOARD|COLLEGE|SCHOOL|INSTITUTE", line, re.IGNORECASE):
            fields["institution"] = line
            break

    # Student name heuristic
    name_match = re.search(r"(?:NAME|CANDIDATE|STUDENT NAME)\s*[:.-]?\s*([A-Z\s]+)", ocr_text, re.IGNORECASE)
    if name_match:
        fields["student_name"] = name_match.group(1).strip()

    return fields


def extract_income_fields(ocr_text: str) -> dict[str, Any]:
    fields: dict[str, Any] = {
        "name": None,
        "certificate_number": None,
        "income": None,
        "issue_date": None,
        "authority": None,
    }

    # Income amount
    income_match = re.search(r"(?:INCOME|RUPEES|RS\.?)\s*[:.-]?\s*([0-9,]+)", ocr_text, re.IGNORECASE)
    if income_match:
        fields["income"] = income_match.group(1).strip()

    # Certificate number
    cert_match = re.search(r"(?:CERTIFICATE\s*NO|NO\.)\s*[:.-]?\s*([A-Z0-9/-]+)", ocr_text, re.IGNORECASE)
    if cert_match:
        fields["certificate_number"] = cert_match.group(1).strip()

    # Issue date
    dates = extract_dates(ocr_text)
    if dates:
        fields["issue_date"] = dates[0]

    # Authority
    auth_match = re.search(r"(TEHSILDAR|REVENUE OFFICER|SUB-DIVISIONAL MAGISTRATE|DISTRICT MAGISTRATE)", ocr_text, re.IGNORECASE)
    if auth_match:
        fields["authority"] = auth_match.group(1).strip()

    # Applicant Name
    name_match = re.search(r"(?:NAME|SHRI|SMT|KUMARI)\s*[:.-]?\s*([A-Z\s]+)", ocr_text, re.IGNORECASE)
    if name_match:
        fields["name"] = name_match.group(1).strip()

    return fields


def extract_domicile_fields(ocr_text: str) -> dict[str, Any]:
    fields: dict[str, Any] = {
        "name": None,
        "certificate_number": None,
        "issue_date": None,
        "address_state": None,
        "authority": None,
    }

    # Certificate number
    cert_match = re.search(r"(?:CERTIFICATE\s*NO|NO\.)\s*[:.-]?\s*([A-Z0-9/-]+)", ocr_text, re.IGNORECASE)
    if cert_match:
        fields["certificate_number"] = cert_match.group(1).strip()

    # Issue date
    dates = extract_dates(ocr_text)
    if dates:
        fields["issue_date"] = dates[0]

    # Authority
    auth_match = re.search(r"(TEHSILDAR|DISTRICT MAGISTRATE|SUB-DIVISIONAL OFFICER)", ocr_text, re.IGNORECASE)
    if auth_match:
        fields["authority"] = auth_match.group(1).strip()

    # Applicant Name
    name_match = re.search(r"(?:NAME|RESIDENT|BONAFIDE)\s*[:.-]?\s*([A-Z\s]+)", ocr_text, re.IGNORECASE)
    if name_match:
        fields["name"] = name_match.group(1).strip()

    return fields


def extract_fields(ocr_text: str, document_type: str) -> dict[str, Any]:
    """
    Extract structured fields deterministically from OCR text based on document_type.
    """
    if not ocr_text or not ocr_text.strip():
        return {}

    if document_type == "PAN":
        return extract_pan_fields(ocr_text)
    elif document_type == "AADHAAR":
        return extract_aadhaar_fields(ocr_text)
    elif document_type == "EDUCATIONAL_CERTIFICATE":
        return extract_educational_fields(ocr_text)
    elif document_type == "INCOME_CERTIFICATE":
        return extract_income_fields(ocr_text)
    elif document_type == "DOMICILE_CERTIFICATE":
        return extract_domicile_fields(ocr_text)

    return {}
