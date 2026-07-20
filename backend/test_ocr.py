from pathlib import Path

from app.ocr.ocr_service import extract_text

image = Path("uploads/Screenshot 2026-07-12 114451.png")  # Replace with your actual filename

print(extract_text(image))
