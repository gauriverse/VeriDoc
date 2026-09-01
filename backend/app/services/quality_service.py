from pathlib import Path

import cv2


def calculate_blur_score(image) -> float:
    """
    Calculate image sharpness using Laplacian variance.

    Higher value = sharper image.
    Lower value = blurrier image.
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    variance = cv2.Laplacian(
        gray,
        cv2.CV_64F
    ).var()

    return float(variance)


def calculate_brightness(image) -> float:
    """
    Calculate average grayscale brightness.

    Range: 0-255
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    return float(gray.mean())


def analyze_image_quality(file_path: str) -> dict:
    """
    Analyze the quality of an image document.
    """

    path = Path(file_path)

    if not path.exists():
        return {
            "quality_score": 0.0,
            "status": "poor",
            "message": "Document file not found.",
        }

    image = cv2.imread(str(path))

    if image is None:
        return {
            "quality_score": 0.0,
            "status": "poor",
            "message": "Unable to read document image.",
        }

    height, width = image.shape[:2]

    blur_score = calculate_blur_score(image)
    brightness = calculate_brightness(image)

    issues = []

    # ---------------------------------------------------------
    # Resolution check
    # ---------------------------------------------------------

    if width < 600 or height < 400:
        issues.append("LOW_RESOLUTION")

    # ---------------------------------------------------------
    # Blur check
    # ---------------------------------------------------------

    if blur_score < 100:
        issues.append("BLURRY_DOCUMENT")

    # ---------------------------------------------------------
    # Brightness check
    # ---------------------------------------------------------

    if brightness < 50:
        issues.append("TOO_DARK")
    elif brightness > 220:
        issues.append("TOO_BRIGHT")

    # ---------------------------------------------------------
    # Quality score
    # ---------------------------------------------------------

    score = 1.0

    if width < 600 or height < 400:
        score -= 0.30

    if blur_score < 100:
        score -= 0.40

    if brightness < 50 or brightness > 220:
        score -= 0.20

    score = max(0.0, min(1.0, score))

    # ---------------------------------------------------------
    # Status
    # ---------------------------------------------------------

    if score >= 0.75:
        status = "good"
        message = "Document quality is good."

    elif score >= 0.50:
        status = "warning"
        message = "Document quality may affect verification."

    else:
        status = "poor"
        message = "Document quality is poor."

    return {
        "quality_score": round(score, 2),
        "status": status,
        "message": message,
        "width": width,
        "height": height,
        "blur_score": round(blur_score, 2),
        "brightness": round(brightness, 2),
        "issues": issues,
    }