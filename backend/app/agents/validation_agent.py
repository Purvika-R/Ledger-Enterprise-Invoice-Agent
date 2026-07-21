import re
from datetime import datetime

from app.core.progress import send_progress


VALID_CURRENCIES = {
    "INR", "USD", "EUR", "GBP", "AUD", "CAD", "JPY", "CNY", "SGD", "AED",
}

DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def _validate_invoice_number(header, errors, field_validation):
    invoice_number = str(header.get("invoice_number", "") or "").strip()

    if not invoice_number:
        field_validation["invoice_number"] = {
            "valid": False,
            "message": "Invoice number is missing.",
        }
        errors.append("Invoice number is missing.")
    else:
        field_validation["invoice_number"] = {
            "valid": True,
            "message": "Invoice number present.",
        }


def _validate_vendor(header, errors, field_validation):
    vendor = str(header.get("vendor", "") or "").strip()

    if not vendor or len(vendor) < 2:
        field_validation["vendor"] = {
            "valid": False,
            "message": "Vendor name is missing or too short.",
        }
        errors.append("Vendor name is missing or too short.")
    else:
        field_validation["vendor"] = {
            "valid": True,
            "message": "Vendor name present.",
        }


def _validate_invoice_date(header, errors, field_validation):
    raw_date = str(header.get("invoice_date", "") or "").strip()

    if not DATE_PATTERN.match(raw_date):
        field_validation["invoice_date"] = {
            "valid": False,
            "message": f"Invoice date '{raw_date or '(empty)'}' is not in YYYY-MM-DD format.",
        }
        errors.append(
            f"Invoice date '{raw_date or '(empty)'}' is not in YYYY-MM-DD format."
        )
        return

    try:
        datetime.strptime(raw_date, "%Y-%m-%d")
        field_validation["invoice_date"] = {
            "valid": True,
            "message": "Invoice date is valid.",
        }
    except ValueError:
        field_validation["invoice_date"] = {
            "valid": False,
            "message": f"Invoice date '{raw_date}' is not a real calendar date.",
        }
        errors.append(f"Invoice date '{raw_date}' is not a real calendar date.")


def _validate_currency(header, errors, field_validation):
    currency = str(header.get("currency", "") or "").strip().upper()

    if currency not in VALID_CURRENCIES:
        field_validation["currency"] = {
            "valid": False,
            "message": f"Currency '{currency or '(empty)'}' is not a recognized ISO code.",
        }
        errors.append(
            f"Currency '{currency or '(empty)'}' is not a recognized ISO code."
        )
    else:
        field_validation["currency"] = {
            "valid": True,
            "message": "Currency code is valid.",
        }


def _validate_total_amount(header, errors, field_validation):
    total = header.get("total_amount", None)

    try:
        total_value = float(total)
    except (TypeError, ValueError):
        field_validation["total_amount"] = {
            "valid": False,
            "message": "Total amount is missing or not numeric.",
        }
        errors.append("Total amount is missing or not numeric.")
        return None

    if total_value <= 0:
        field_validation["total_amount"] = {
            "valid": False,
            "message": "Total amount must be greater than zero.",
        }
        errors.append("Total amount must be greater than zero.")
        return total_value

    field_validation["total_amount"] = {
        "valid": True,
        "message": "Total amount is valid.",
    }
    return total_value


def _validate_line_items(line_items, total_value, errors, field_validation):
    if not line_items:
        field_validation["line_items"] = {
            "valid": False,
            "message": "No line items were extracted.",
        }
        errors.append("No line items were extracted.")
        return

    try:
        line_sum = sum(float(item.get("amount", 0) or 0) for item in line_items)
    except (TypeError, ValueError):
        field_validation["line_items"] = {
            "valid": False,
            "message": "One or more line items has a non-numeric amount.",
        }
        errors.append("One or more line items has a non-numeric amount.")
        return

    if total_value is None:
        field_validation["line_items"] = {
            "valid": True,
            "message": f"{len(line_items)} line item(s) extracted.",
        }
        return

    # Allow small rounding/OCR tolerance: 2% of the total, or 1 unit, whichever is larger.
    tolerance = max(1.0, total_value * 0.02)

    if abs(line_sum - total_value) > tolerance:
        field_validation["line_items"] = {
            "valid": False,
            "message": (
                f"Line items sum to {line_sum:.2f}, which does not match "
                f"the total amount of {total_value:.2f}."
            ),
        }
        errors.append(
            f"Line items sum to {line_sum:.2f}, which does not match "
            f"the total amount of {total_value:.2f}."
        )
    else:
        field_validation["line_items"] = {
            "valid": True,
            "message": "Line items sum matches total amount.",
        }


def validate_invoice(header, line_items):
    """Run enterprise business-rule validation on the extracted invoice.

    Returns:
        errors: flat list of human-readable validation error strings.
        field_validation: per-field dict of {valid: bool, message: str},
            used for explainability and field highlighting in the UI.
    """
    errors = []
    field_validation = {}

    _validate_invoice_number(header, errors, field_validation)
    _validate_vendor(header, errors, field_validation)
    _validate_invoice_date(header, errors, field_validation)
    _validate_currency(header, errors, field_validation)
    total_value = _validate_total_amount(header, errors, field_validation)
    _validate_line_items(line_items, total_value, errors, field_validation)

    return errors, field_validation


def validation_agent(state):

    send_progress("Validation Agent", "running")

    header = state["header_fields"]
    line_items = state["line_items"]

    errors, field_validation = validate_invoice(header, line_items)
    state["validation_errors"] = errors

    state["final_json"] = {
        "header": header,
        "line_items": line_items,
        "vendor_memory": state["vendor_memory"],
        "confidence": state["confidence"],
        "validation_errors": errors,
        "validation_passed": len(errors) == 0,
        "field_validation": field_validation,
    }

    print(f"Validation complete. {len(errors)} issue(s) found.")
    send_progress("Validation Agent", "completed")

    return state