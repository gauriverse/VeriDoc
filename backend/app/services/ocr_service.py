from pathlib import Path

import cv2
import pytesseract


TESSERACT_PATH = r"D:\Program Files\Tesseract-OCR\tesseract.exe"

pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH


def preprocess_image(file_path: str):
    """
    Prepare an image for OCR.
    """

    image = cv2.imread(file_path)

    if image is None:
        raise ValueError(
            f"Unable to read image: {file_path}"
        )

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    # Reduce small image noise.
    gray = cv2.GaussianBlur(
        gray,
        (3, 3),
        0
    )

    # Improve text/background separation.
    threshold = cv2.threshold(
        gray,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )[1]

    return threshold


def extract_text(file_path: str) -> str:
    """
    Extract text from an image using Tesseract OCR.
    """

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(
            f"Document not found: {file_path}"
        )

    try:
        processed_image = preprocess_image(
            str(path)
        )

        text = pytesseract.image_to_string(
            processed_image,
            config="--psm 6"
        )

        return text.strip()

    except Exception as exc:
        raise RuntimeError(
            f"OCR failed for {file_path}: {exc}"
        ) from exc