from fastapi import APIRouter, UploadFile, File

from app.services.upload_service import save_uploaded_file

router = APIRouter()


@router.post("/upload")
async def upload_invoice(file: UploadFile = File(...)):
    return save_uploaded_file(file)