import os
import shutil
from pathlib import Path

import cv2
import fitz
import numpy as np
import pytesseract

from app.config import settings


def configure_tesseract():
    cmd = settings.tesseract_cmd
    if cmd and Path(cmd).exists():
        pytesseract.pytesseract.tesseract_cmd = str(cmd)
    elif shutil.which("tesseract"):
        pytesseract.pytesseract.tesseract_cmd = "tesseract"
    else:
        # Fallback set string so error is raised on execution if missing
        pytesseract.pytesseract.tesseract_cmd = str(cmd)


configure_tesseract()


def verify_tesseract_installed() -> bool:
    """
    Check if Tesseract OCR executable is available and functioning.
    """
    cmd = pytesseract.pytesseract.tesseract_cmd
    if cmd and Path(cmd).exists():
        return True
    if shutil.which("tesseract"):
        return True
    return False


SUPPORTED_IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
}



def preprocess_image(image):
    """
    Prepare an image for OCR.
    """

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY,
    )

    gray = cv2.GaussianBlur(
        gray,
        (3, 3),
        0,
    )

    threshold = cv2.threshold(
        gray,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU,
    )[1]

    return threshold


def extract_text_from_image(file_path: str) -> str:
    """
    Extract text from JPG, JPEG or PNG.
    """

    image = cv2.imread(file_path)

    if image is None:
        raise ValueError(f"Unable to read image: {file_path}")

    processed_image = preprocess_image(image)

    try:
        text = pytesseract.image_to_string(
            processed_image,
            config="--psm 6",
        )
    except pytesseract.TesseractNotFoundError as err:
        raise RuntimeError(
            "Tesseract OCR is not installed or path is incorrect. "
            f"Expected at: {pytesseract.pytesseract.tesseract_cmd}"
        ) from err

    return text.strip()



def extract_text_from_pdf(file_path: str) -> str:
    """
    Convert PDF pages into images and extract text
    from each page using Tesseract.
    """

    document = fitz.open(file_path)

    pages_text = []

    try:
        for page_number, page in enumerate(document):
            pixmap = page.get_pixmap(
                matrix=fitz.Matrix(2, 2),
                alpha=False,
            )

            image_bytes = pixmap.tobytes("png")

            image = cv2.imdecode(
                np.frombuffer(
                    image_bytes,
                    dtype=np.uint8,
                ),
                cv2.IMREAD_COLOR,
            )

            if image is None:
                continue

            processed_image = preprocess_image(image)

            page_text = pytesseract.image_to_string(
                processed_image,
                config="--psm 6",
            )

            if page_text.strip():
                pages_text.append(
                    f"--- Page {page_number + 1} ---\n" f"{page_text.strip()}"
                )

    finally:
        document.close()

    return "\n\n".join(pages_text)


def extract_text(file_path: str) -> str:
    """
    Unified OCR entry point.

    Automatically selects the correct processing
    pipeline based on the file extension.
    """

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"Document not found: {file_path}")

    extension = path.suffix.lower()

    if extension in SUPPORTED_IMAGE_EXTENSIONS:
        return extract_text_from_image(str(path))

    if extension == ".pdf":
        return extract_text_from_pdf(str(path))

    raise ValueError(f"Unsupported document type: {extension}")
