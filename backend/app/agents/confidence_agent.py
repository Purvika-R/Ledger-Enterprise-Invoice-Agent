import re

from app.core.progress import send_progress


def confidence_agent(state):
    send_progress("Confidence Agent", "running")

    try:
        print("Running Confidence Agent...")

        header = state["header_fields"]

        confidence = {}

        # Invoice Number
        invoice = header.get("invoice_number", "")
        confidence["invoice_number"] = 0.95 if invoice else 0.20

        # Vendor
        vendor = header.get("vendor", "")
        confidence["vendor"] = 0.95 if len(vendor) > 3 else 0.30

        # Date
        date = header.get("invoice_date", "")
        confidence["invoice_date"] = (
            0.90 if re.search(r"\d", str(date)) else 0.20
        )

        # Currency
        currency = header.get("currency", "")
        confidence["currency"] = 0.95 if currency else 0.40

        # Total
        total = header.get("total_amount", "")
        confidence["total_amount"] = 0.95 if total else 0.30

        state["confidence"] = confidence
    except Exception:
        send_progress("Confidence Agent", "failed")
        raise

    send_progress("Confidence Agent", "completed")

    return state