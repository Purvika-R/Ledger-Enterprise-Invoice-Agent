import csv
import io
import json
from datetime import datetime

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.db.models import AuditTrail, Invoice, LineItem, VendorMemory, utc_now


def _number(value):
    try:
        return float(value) if value is not None and value != "" else None
    except (TypeError, ValueError):
        return None


def serialize_invoice(invoice, detailed=False):
    data = {
        "id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "vendor": invoice.vendor,
        "invoice_date": invoice.invoice_date,
        "currency": invoice.currency,
        "total_amount": invoice.total_amount,
        "approval_status": invoice.approval_status,
        "validation_passed": invoice.validation_passed,
        "is_invoice": invoice.is_invoice,
        "classification_confidence": invoice.classification_confidence,
        "classification_method": invoice.classification_method,
        "created_at": invoice.created_at.isoformat() if invoice.created_at else None,
    }

    if detailed:
        data.update({
            "header": invoice.header_data or {},
            "confidence": invoice.confidence_data or {},
            "validation_errors": invoice.validation_errors or [],
            "field_validation": invoice.field_validation or {},
            "classification": invoice.classification_data or {},
            "line_items": [
                {
                    "id": item.id,
                    "description": item.description,
                    "quantity": item.quantity,
                    "unit_price": item.unit_price,
                    "amount": item.amount,
                }
                for item in invoice.line_items
            ],
            "audit_trail": [
                {
                    "agent_name": entry.agent_name,
                    "start_time": entry.start_time,
                    "end_time": entry.end_time,
                    "execution_time_ms": entry.execution_time_ms,
                    "status": entry.status,
                    "summary": entry.summary,
                }
                for entry in invoice.audit_trail
            ],
        })

    return data


def save_processed_invoice(db: Session, state):
    final_json = state.get("final_json", {})
    classification = state.get("classification", {})
    header = state.get("header_fields", {})
    is_invoice = bool(classification.get("is_invoice", False))

    invoice = Invoice(
        invoice_number=header.get("invoice_number"),
        vendor=header.get("vendor"),
        invoice_date=header.get("invoice_date"),
        currency=header.get("currency"),
        total_amount=_number(header.get("total_amount")),
        validation_passed=final_json.get("validation_passed") if is_invoice else None,
        is_invoice=is_invoice,
        classification_confidence=_number(classification.get("confidence")),
        classification_method=classification.get("method"),
        header_data=header,
        confidence_data=state.get("confidence", {}),
        validation_errors=state.get("validation_errors", []),
        field_validation=final_json.get("field_validation", {}),
        classification_data=classification,
    )
    db.add(invoice)
    db.flush()

    for item in state.get("line_items", []):
        db.add(LineItem(
            invoice_id=invoice.id,
            description=str(item.get("description", "")),
            quantity=_number(item.get("quantity")),
            unit_price=_number(item.get("unit_price")),
            amount=_number(item.get("amount")),
        ))

    for entry in state.get("audit_trail", []):
        db.add(AuditTrail(
            invoice_id=invoice.id,
            agent_name=entry.get("agent_name", "Unknown Agent"),
            start_time=entry.get("start_time"),
            end_time=entry.get("end_time"),
            execution_time_ms=entry.get("execution_time_ms"),
            status=entry.get("status", "unknown"),
            summary=entry.get("summary", ""),
        ))

    vendor_memory = state.get("vendor_memory", {})
    vendor = header.get("vendor")
    if vendor:
        memory = db.scalar(select(VendorMemory).where(VendorMemory.vendor == vendor))
        if memory is None:
            memory = VendorMemory(vendor=vendor)
            db.add(memory)

        memory.invoice_count = vendor_memory.get("history", {}).get("invoice_count", 1)
        memory.known_vendor = bool(vendor_memory.get("known_vendor", False))
        memory.last_seen_at = utc_now()

    db.commit()
    db.refresh(invoice)
    return invoice


def list_invoices(db: Session, vendor=None, currency=None, date_from=None, date_to=None,
                  approval_status=None, validation_passed=None, search=None):
    statement = select(Invoice).order_by(Invoice.created_at.desc())

    if vendor:
        statement = statement.where(Invoice.vendor.ilike(f"%{vendor}%"))
    if currency:
        statement = statement.where(Invoice.currency == currency.upper())
    if date_from:
        statement = statement.where(Invoice.invoice_date >= date_from)
    if date_to:
        statement = statement.where(Invoice.invoice_date <= date_to)
    if approval_status:
        statement = statement.where(Invoice.approval_status == approval_status)
    if validation_passed is not None:
        statement = statement.where(Invoice.validation_passed == validation_passed)
    if search:
        term = f"%{search}%"
        statement = statement.where(or_(
            Invoice.invoice_number.ilike(term),
            Invoice.vendor.ilike(term),
        ))

    return list(db.scalars(statement))


def get_invoice(db: Session, invoice_id: int):
    statement = (
        select(Invoice)
        .where(Invoice.id == invoice_id)
        .options(selectinload(Invoice.line_items), selectinload(Invoice.audit_trail))
    )
    return db.scalar(statement)


def analytics_summary(db: Session):
    invoices = list(db.scalars(select(Invoice).where(Invoice.is_invoice.is_(True))))
    total = len(invoices)
    valid_count = sum(1 for invoice in invoices if invoice.validation_passed is True)
    confidences = [invoice.classification_confidence for invoice in invoices if invoice.classification_confidence is not None]

    vendor_rows = db.execute(
        select(Invoice.vendor, func.count(Invoice.id))
        .where(Invoice.is_invoice.is_(True), Invoice.vendor.is_not(None))
        .group_by(Invoice.vendor)
        .order_by(func.count(Invoice.id).desc())
        .limit(8)
    ).all()

    trend_rows = db.execute(
        select(Invoice.invoice_date, func.count(Invoice.id))
        .where(Invoice.is_invoice.is_(True), Invoice.invoice_date.is_not(None))
        .group_by(Invoice.invoice_date)
        .order_by(Invoice.invoice_date)
    ).all()

    distribution = {"0-49": 0, "50-74": 0, "75-89": 0, "90-100": 0}
    for confidence in confidences:
        percentage = confidence * 100
        bucket = "0-49" if percentage < 50 else "50-74" if percentage < 75 else "75-89" if percentage < 90 else "90-100"
        distribution[bucket] += 1

    return {
        "total_invoices": total,
        "known_vendors": db.scalar(select(func.count(VendorMemory.id)).where(VendorMemory.known_vendor.is_(True))) or 0,
        "average_confidence": round((sum(confidences) / len(confidences) * 100), 1) if confidences else 0,
        "validation_success_rate": round((valid_count / total * 100), 1) if total else 0,
        "vendor_frequency": [{"vendor": vendor, "count": count} for vendor, count in vendor_rows],
        "invoice_trend": [{"date": date, "count": count} for date, count in trend_rows],
        "confidence_distribution": [{"range": key, "count": value} for key, value in distribution.items()],
        "validation_status": [
            {"status": "Passed", "count": valid_count},
            {"status": "Failed", "count": sum(1 for invoice in invoices if invoice.validation_passed is False)},
        ],
    }


def export_invoices(invoices, export_format):
    records = [serialize_invoice(invoice) for invoice in invoices]

    if export_format == "json":
        return json.dumps(records, indent=2), "application/json", "invoices.json"

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=[
        "id", "invoice_number", "vendor", "invoice_date", "currency", "total_amount",
        "approval_status", "validation_passed", "is_invoice", "created_at",
    ])
    writer.writeheader()
    writer.writerows(records)
    return output.getvalue(), "text/csv", "invoices.csv"
