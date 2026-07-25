from pathlib import Path
import os

import pytesseract
from PIL import Image

# Use Windows path only when running on Windows
if os.name == "nt":
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def extract_text(image_path: Path) -> str:
    image = Image.open(image_path)
    return pytesseract.image_to_string(image)