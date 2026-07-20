from fastapi import APIRouter, UploadFile, File
import shutil
import os

from app.graph import graph

router = APIRouter()


UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/process-invoice")
async def process_invoice(file: UploadFile = File(...)):

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = graph.invoke(
        {
            "image_path": file_path,
            "ocr_text": "",
            "header_fields": {},
            "line_items": [],
            "vendor_memory": {},
            "confidence": {},
            "validation_errors": [],
            "final_json": {},
        }
    )

    return result["final_json"]