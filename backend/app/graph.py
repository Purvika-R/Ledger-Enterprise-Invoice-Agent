from langgraph.graph import END, StateGraph

from app.agents.classification_agent import classification_agent
from app.agents.confidence_agent import confidence_agent
from app.agents.header_agent import header_agent
from app.agents.line_item_agent import line_item_agent
from app.agents.ocr_agent import ocr_agent
from app.agents.retry_agent import can_retry, retry_agent, select_retry_target
from app.agents.validation_agent import validation_agent
from app.agents.vendor_memory_agent import vendor_memory_agent
from app.core.audit import complete_audit_entry, fail_audit_entry, start_audit_entry
from app.models.state import LedgerState


def audited_node(agent_name, agent, summary_builder):
    def run(state):
        entry, started_at = start_audit_entry(state, agent_name)

        try:
            result = agent(state)
            complete_audit_entry(entry, started_at, summary_builder(result))
            return result
        except Exception:
            fail_audit_entry(entry, started_at)
            raise

    return run


def ocr_summary(state):
    return f"OCR extracted {len(state.get('ocr_text', ''))} characters."


def classification_summary(state):
    classification = state.get("classification", {})
    document_type = classification.get("detected_document_type", "Unknown")
    confidence = round(classification.get("confidence", 0) * 100)
    method = classification.get("method", "unknown")
    return f"Detected {document_type}. Confidence {confidence}%. Method: {method}."


def header_summary(state):
    return f"Extracted {len(state.get('header_fields', {}))} header fields."


def line_item_summary(state):
    return f"Extracted {len(state.get('line_items', []))} line items."


def vendor_memory_summary(state):
    vendor_memory = state.get("vendor_memory", {})
    known_vendor = "Known vendor" if vendor_memory.get("known_vendor") else "New vendor"
    history_count = vendor_memory.get("history", {}).get("invoice_count", 0)
    return f"{known_vendor}. History count: {history_count}."


def confidence_summary(state):
    confidence = state.get("confidence", {})
    average = sum(confidence.values()) / len(confidence) if confidence else 0
    return f"Average confidence: {round(average * 100)}%."


def validation_summary(state):
    return f"{len(state.get('validation_errors', []))} validation issue(s) detected."


def retry_summary(state):
    decision = state.get("retry_decision", "unknown")
    return f"Retry attempt {state.get('retry_count', 0)} completed using {decision} extraction."


def route_after_classification(state):
    if state["classification"]["is_invoice"]:
        return "is_invoice"
    return "not_invoice"


def retry_decision(state):
    """Pass state to the bounded retry routing decision without mutating it."""
    return state


def route_after_retry_decision(state):
    """Retry once only for validation errors owned by an extraction agent."""
    if not state.get("validation_errors"):
        return "end"

    if can_retry(state) and select_retry_target(state["validation_errors"]) is not None:
        return "retry"

    return "end"


def build_graph():
    builder = StateGraph(LedgerState)

    builder.add_node("ocr", audited_node("OCR Agent", ocr_agent, ocr_summary))
    builder.add_node("classification", audited_node("Classification Agent", classification_agent, classification_summary))
    builder.add_node("header", audited_node("Header Agent", header_agent, header_summary))
    builder.add_node("line_items", audited_node("Line Item Agent", line_item_agent, line_item_summary))
    builder.add_node("vendor_memory", audited_node("Vendor Memory Agent", vendor_memory_agent, vendor_memory_summary))
    builder.add_node("confidence", audited_node("Confidence Agent", confidence_agent, confidence_summary))
    builder.add_node("validate", audited_node("Validation Agent", validation_agent, validation_summary))
    builder.add_node("retry_decision", retry_decision)
    builder.add_node("retry", audited_node("Retry Agent", retry_agent, retry_summary))
    builder.add_node("retry_confidence", audited_node("Confidence Agent", confidence_agent, confidence_summary))
    builder.add_node("retry_validate", audited_node("Validation Agent", validation_agent, validation_summary))

    builder.set_entry_point("ocr")
    builder.add_edge("ocr", "classification")
    builder.add_conditional_edges(
        "classification",
        route_after_classification,
        {"is_invoice": "header", "not_invoice": END},
    )
    builder.add_edge("header", "line_items")
    builder.add_edge("line_items", "vendor_memory")
    builder.add_edge("vendor_memory", "confidence")
    builder.add_edge("confidence", "validate")
    builder.add_edge("validate", "retry_decision")
    builder.add_conditional_edges(
        "retry_decision",
        route_after_retry_decision,
        {"retry": "retry", "end": END},
    )
    builder.add_edge("retry", "retry_confidence")
    builder.add_edge("retry_confidence", "retry_validate")
    builder.add_edge("retry_validate", END)

    return builder.compile()


graph = build_graph()
