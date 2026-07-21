import re

from app.core.llm import llm
from app.agents.header_agent import extract_json
from app.models.state import ClassificationResult


# ---------------------------------------------------------------------------
# Configurable heuristic keyword lists and thresholds.
# Nothing below this section should ever contain a hard-coded magic value —
# tuning the classifier means editing these constants, not the logic.
# ---------------------------------------------------------------------------

MIN_OCR_TEXT_LENGTH = 15  # below this, OCR text is treated as blank/unreadable

STRONG_KEYWORDS = {
    "tax invoice": 3,
    "invoice no": 3,
    "invoice number": 3,
    "invoice": 3,
    "gstin": 3,
    "bill to": 3,
    "ship to": 3,
    "purchase order": 3,
}

MEDIUM_KEYWORDS = {
    "subtotal": 2,
    "total amount": 2,
    "amount due": 2,
    "grand total": 2,
    "vat": 2,
    "gst": 2,
    "receipt no": 2,
    "receipt number": 2,
}

WEAK_KEYWORDS = {
    "total": 1,
    "amount": 1,
    "tax": 1,
    "due date": 1,
    "quantity": 1,
    "qty": 1,
    "unit price": 1,
    "discount": 1,
    "payment terms": 1,
    "balance due": 1,
}

ALL_KEYWORDS = {**STRONG_KEYWORDS, **MEDIUM_KEYWORDS, **WEAK_KEYWORDS}

CURRENCY_PATTERN = re.compile(r"[$₹€£]|\b(?:INR|USD|EUR|GBP|AUD|CAD)\b", re.IGNORECASE)
CURRENCY_SIGNAL_WEIGHT = 2

DATE_PATTERN = re.compile(r"\b\d{1,4}[/-]\d{1,2}[/-]\d{1,4}\b")
DATE_SIGNAL_WEIGHT = 1

VENDOR_TERMS = ("ship to", "vendor", "seller", "from:")
CUSTOMER_TERMS = ("bill to", "buyer", "customer")
STRUCTURE_SIGNAL_WEIGHT = 2  # both a vendor-side and customer-side block present

# Score >= this -> confidently an invoice, LLM is not consulted.
HEURISTIC_INVOICE_SCORE_THRESHOLD = 6

# Score <= this (with sufficient OCR text) -> confidently NOT an invoice, LLM is not consulted.
HEURISTIC_NOT_INVOICE_SCORE_THRESHOLD = 1

LLM_CLASSIFICATION_PROMPT = """
You are a document classification AI for an enterprise invoice processing system.

Analyze the OCR text below and decide whether it comes from an INVOICE.

Weigh these common invoice characteristics:
- Invoice Number
- Vendor/Seller
- Buyer
- Date
- GST/VAT/Tax
- Total Amount
- Currency
- Table of purchased items
- Payment information

If most of these are missing, you MUST return is_invoice=false. Do not guess or
fabricate invoice details -- only classify based on what is actually present.

Return ONLY valid JSON. Do not explain. Do not use markdown. Do not wrap in ```.

Return exactly this shape:
{{
    "is_invoice": true,
    "confidence": 0.0,
    "reason": "short explanation",
    "detected_document_type": "Invoice"
}}

OCR TEXT:
{ocr_text}
"""


def _confidence_for_invoice(score: int) -> float:
    # Higher score saturates confidence near the top of the range.
    return round(min(0.99, 0.70 + 0.05 * score), 2)


def _confidence_for_not_invoice(score: int) -> float:
    # Lower score means higher confidence it is NOT an invoice.
    return round(min(0.99, 0.95 - 0.10 * score), 2)


def _score_text(text_lower: str):
    """Score multiple independent signals rather than a single keyword hit."""
    matched_keywords = []
    score = 0

    for keyword, weight in ALL_KEYWORDS.items():
        if keyword in text_lower:
            matched_keywords.append(keyword)
            score += weight

    if CURRENCY_PATTERN.search(text_lower):
        score += CURRENCY_SIGNAL_WEIGHT
        matched_keywords.append("<currency symbol/code>")

    if DATE_PATTERN.search(text_lower):
        score += DATE_SIGNAL_WEIGHT
        matched_keywords.append("<date pattern>")

    has_vendor_side = any(term in text_lower for term in VENDOR_TERMS)
    has_customer_side = any(term in text_lower for term in CUSTOMER_TERMS)

    if has_vendor_side and has_customer_side:
        score += STRUCTURE_SIGNAL_WEIGHT
        matched_keywords.append("<vendor/customer structure>")

    return score, matched_keywords


def _classify_with_llm(text: str, matched_keywords: list) -> ClassificationResult:
    """Only reached when the heuristic score is genuinely ambiguous."""
    prompt = LLM_CLASSIFICATION_PROMPT.format(ocr_text=text)

    parsed = {}
    try:
        response = llm.invoke(prompt)
        parsed = extract_json(response.content)
    except Exception as exc:
        print(f"Classification LLM call failed: {exc}")

    if not parsed or "is_invoice" not in parsed:
        # Fail closed: if the LLM gives us nothing usable, we do not risk
        # letting a non-invoice document through to the extraction agents.
        return ClassificationResult(
            is_invoice=False,
            confidence=0.5,
            reason="LLM classification did not return a usable result; defaulting to rejection for safety.",
            detected_document_type="Unknown",
            method="llm",
            matched_keywords=matched_keywords,
        )

    return ClassificationResult(
        is_invoice=bool(parsed.get("is_invoice", False)),
        confidence=float(parsed.get("confidence", 0.5)),
        reason=str(parsed.get("reason", "LLM classification.")),
        detected_document_type=str(parsed.get("detected_document_type", "Unknown")),
        method="llm",
        matched_keywords=matched_keywords,
    )


def classify_invoice(ocr_text: str) -> ClassificationResult:
    """Pure classification logic, kept separate from the LangGraph node
    so it can be unit-tested without constructing a full LedgerState."""
    text = (ocr_text or "").strip()

    if len(text) < MIN_OCR_TEXT_LENGTH:
        return ClassificationResult(
            is_invoice=False,
            confidence=0.97,
            reason=f"OCR text is too short ({len(text)} chars) to contain invoice content.",
            detected_document_type="Blank or Unreadable",
            method="heuristic",
            matched_keywords=[],
        )

    text_lower = text.lower()
    score, matched_keywords = _score_text(text_lower)

    if score >= HEURISTIC_INVOICE_SCORE_THRESHOLD:
        return ClassificationResult(
            is_invoice=True,
            confidence=_confidence_for_invoice(score),
            reason=f"Heuristic keyword/structure score of {score} strongly indicates an invoice.",
            detected_document_type="Invoice",
            method="heuristic",
            matched_keywords=matched_keywords,
        )

    if score <= HEURISTIC_NOT_INVOICE_SCORE_THRESHOLD:
        return ClassificationResult(
            is_invoice=False,
            confidence=_confidence_for_not_invoice(score),
            reason=f"Heuristic keyword/structure score of {score} shows no meaningful invoice signals.",
            detected_document_type="Non-Invoice Document",
            method="heuristic",
            matched_keywords=matched_keywords,
        )

    # Inconclusive -- ask the LLM to make the call.
    return _classify_with_llm(text, matched_keywords)


def classification_agent(state):
    print("Running Classification Agent...")

    result = classify_invoice(state.get("ocr_text", ""))
    state["classification"] = result

    if not result["is_invoice"]:
        # The graph terminates right after this node for non-invoice
        # documents, so final_json must already carry the rejection
        # contract here -- there is no later node to build it.
        state["final_json"] = {
            "success": False,
            "classification": result,
        }

    print(
        f"Classification complete: is_invoice={result['is_invoice']} "
        f"method={result['method']} confidence={result['confidence']}"
    )

    return state