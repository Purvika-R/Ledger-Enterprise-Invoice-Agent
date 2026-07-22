from typing import TypedDict, List, Dict, Any, Literal

try:
    from typing import NotRequired
except ImportError:  # Python 3.10 compatibility
    from typing_extensions import NotRequired


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

    # Autonomous retry
    retry_count: int
    retry_used: bool
    retry_decision: str | None
    retry_agents: List[str]
    retry_duration_ms: int | None
    auto_corrected: bool

    # Final Output
    final_json: Dict[str, Any]

    # Audit Trail
    audit_trail: List[Dict[str, Any]]
