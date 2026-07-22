from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import Response
import shutil
import os

from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.db.models import AuditTrail, User, utc_now
from app.core.security import get_current_user, require_roles
from app.graph import graph
from app.services.invoice_storage_service import (
    analytics_summary,
    export_invoices,
    get_invoice,
    list_invoices,
    save_processed_invoice,
    serialize_invoice,
)

router = APIRouter()


UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/process-invoice")
async def process_invoice(file: UploadFile = File(...), user: User = Depends(require_roles("admin", "reviewer", "uploader"))):

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = await run_in_threadpool(
        graph.invoke,
        {
            "image_path": file_path,
            "ocr_text": "",
            "classification": {},
            "header_fields": {},
            "line_items": [],
            "vendor_memory": {},
            "confidence": {},
            "validation_errors": [],
            "retry_count": 0,
            "retry_used": False,
            "retry_decision": None,
            "retry_agents": [],
            "retry_duration_ms": None,
            "auto_corrected": False,
            "final_json": {},
            "audit_trail": [],
        }
    )

    db = SessionLocal()
    try:
        saved_invoice = save_processed_invoice(db, result, user)
    finally:
        db.close()

    result["final_json"]["audit_trail"] = result["audit_trail"]
    result["final_json"]["invoice_id"] = saved_invoice.id

    return result["final_json"]


@router.get("/invoices")
def invoices(
    vendor: str | None = None,
    currency: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    approval_status: str | None = None,
    validation_passed: bool | None = Query(default=None),
    search: str | None = None,
    db: Session = Depends(get_db), user: User = Depends(get_current_user),
):
    results = list_invoices(
        db, vendor, currency, date_from, date_to,
        approval_status, validation_passed, search, user,
    )
    return [serialize_invoice(invoice) for invoice in results]


@router.get("/invoices/search")
def search_invoices(query: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return [serialize_invoice(invoice) for invoice in list_invoices(db, search=query, user=user)]


@router.get("/invoices/export")
def export_invoice_history(
    format: str = Query(default="csv", pattern="^(csv|json)$"),
    db: Session = Depends(get_db), user: User = Depends(get_current_user),
):
    content, media_type, filename = export_invoices(list_invoices(db, user=user), format)
    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/analytics")
def analytics(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return analytics_summary(db, user)


@router.get("/invoices/{invoice_id}")
def invoice_detail(invoice_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    invoice = get_invoice(db, invoice_id, user)

    if invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")

    return serialize_invoice(invoice, detailed=True)


@router.post("/invoices/{invoice_id}/approve")
def approve_invoice(invoice_id: int, db: Session = Depends(get_db), user: User = Depends(require_roles("admin", "reviewer"))):
    invoice = get_invoice(db, invoice_id, user if user.role != "admin" else None)
    if invoice is None: raise HTTPException(status_code=404, detail="Invoice not found")
    invoice.approval_status = "approved"; invoice.approved_by_id = user.id; invoice.approved_at = utc_now()
    db.add(AuditTrail(invoice_id=invoice.id, agent_name="Human Review", status="completed", summary=f"Approved by {user.name}", start_time=invoice.approved_at.isoformat(), end_time=invoice.approved_at.isoformat(), execution_time_ms=0))
    db.commit(); return serialize_invoice(invoice, detailed=True)


@router.delete("/invoices/{invoice_id}", status_code=204)
def delete_invoice(invoice_id: int, db: Session = Depends(get_db), user: User = Depends(require_roles("admin"))):
    invoice = get_invoice(db, invoice_id)
    if invoice is None: raise HTTPException(status_code=404, detail="Invoice not found")
    db.delete(invoice); db.commit()
