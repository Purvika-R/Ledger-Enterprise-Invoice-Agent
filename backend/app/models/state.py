from typing import TypedDict, List, Dict, Any, Literal, NotRequired


class ClassificationResult(TypedDict):
    is_invoice: bool
    confidence: float
    reason: str
    detected_document_type: str
    method: Literal["heuristic", "llm"]
    matched_keywords: NotRequired[list[str]]


class LedgerState(TypedDict):
    # Input
    image_path: str

    # OCR
    ocr_text: str

    # Classification
    classification: ClassificationResult

    # Header Extraction
    header_fields: Dict[str, Any]

    # Line Item Extraction
    line_items: List[Dict[str, Any]]

    # Vendor Memory
    vendor_memory: Dict[str, Any]

    # Confidence
    confidence: Dict[str, float]

    # Validation
    validation_errors: List[str]

    # Final Output
    final_json: Dict[str, Any]