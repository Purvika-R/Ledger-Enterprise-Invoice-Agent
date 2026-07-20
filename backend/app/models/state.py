from typing import TypedDict, List, Dict, Any


class LedgerState(TypedDict):
    # Input
    image_path: str

    # OCR
    ocr_text: str

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