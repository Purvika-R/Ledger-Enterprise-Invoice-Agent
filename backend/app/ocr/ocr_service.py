from pathlib import Path
import shutil

import pytesseract
from PIL import Image

# Windows (local)
if shutil.which("tesseract"):
    pytesseract.pytesseract.tesseract_cmd = shutil.which("tesseract")
elif Path(r"C:\Program Files\Tesseract-OCR\tesseract.exe").exists():
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
# On Render Docker, tesseract is available at /usr/bin/tesseract automatically.

def extract_text(image_path: Path) -> str:
    image = Image.open(image_path)
    return pytesseract.image_to_string(image)