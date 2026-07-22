from typing import Literal
from time import perf_counter

from app.core.audit import complete_audit_entry, fail_audit_entry, start_audit_entry
from app.core.progress import send_progress


MAX_RETRY_COUNT = 1

RetryTarget = Literal["header", "line_items"]

LINE_ITEM_ERROR_MARKERS = (
    "no line items",
    "line item",
)

HEADER_ERROR_MARKERS = (
    "invoice number",
    "vendor name",
    "invoice date",
    "currency",
    "total amount",
)


def can_retry(state: dict) -> bool:
    """Return whether the state has an unused autonomous retry available."""
    return not state.get("retry_used", False) and state.get("retry_count", 0) < MAX_RETRY_COUNT


def select_retry_target(validation_errors: list[str]) -> RetryTarget | None:
    """Choose the existing extraction agent best suited to fix validation failures.

    Line-item errors take precedence because a line-item total mismatch is most
    directly corrected by rerunning the specialized table extractor. Header
    field failures otherwise rerun the existing header extractor. Unknown
    validation errors are deliberately not retried.
    """
    normalized_errors = [error.lower() for error in validation_errors]

    if any(marker in error for error in normalized_errors for marker in LINE_ITEM_ERROR_MARKERS):
        return "line_items"

    if any(marker in error for error in normalized_errors for marker in HEADER_ERROR_MARKERS):
        return "header"

    return None


def retry_agent(state: dict) -> dict:
    """Perform at most one targeted re-extraction using existing agents.

    LangGraph invokes this node only after a failed validation pass and routes
    it back through confidence and validation. OCR, classification, and vendor
    memory are never retried here.
    """
    if not can_retry(state):
        return state

    target = select_retry_target(state.get("validation_errors", []))
    if target is None:
        return state

    send_progress("Retry Agent", "running")
    retry_started_at = perf_counter()
    retry_label = "Header Retry" if target == "header" else "Line Item Retry"
    retried_agent = "Header Agent" if target == "header" else "Line Item Agent"
    state["retry_decision"] = target
    state["retry_agents"] = [retried_agent]
    retry_entry, audit_started_at = start_audit_entry(state, retry_label)
    state["progress_agent_name"] = retry_label

    try:
        if target == "header":
            from app.agents.header_agent import header_agent

            header_agent(state)
        else:
            from app.agents.line_item_agent import line_item_agent

            line_item_agent(state)

        state["retry_count"] = state.get("retry_count", 0) + 1
        state["retry_used"] = True
        state["retry_duration_ms"] = round((perf_counter() - retry_started_at) * 1000)
        complete_audit_entry(retry_entry, audit_started_at, f"Retried {retried_agent} after validation failed.")
    except Exception:
        fail_audit_entry(retry_entry, audit_started_at)
        send_progress("Retry Agent", "failed")
        raise
    finally:
        state.pop("progress_agent_name", None)

    send_progress("Retry Agent", "completed")
    return state
