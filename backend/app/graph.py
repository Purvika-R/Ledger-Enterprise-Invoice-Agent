from langgraph.graph import StateGraph, END

from app.models.state import LedgerState
from app.agents.ocr_agent import ocr_agent
from app.agents.classification_agent import classification_agent
from app.agents.header_agent import header_agent
from app.agents.line_item_agent import line_item_agent
from app.agents.validation_agent import validation_agent
from app.agents.vendor_memory_agent import vendor_memory_agent
from app.agents.confidence_agent import confidence_agent


def route_after_classification(state):
    """Conditional edge: continue into extraction only if the document
    was classified as an invoice; otherwise route straight to END."""
    if state["classification"]["is_invoice"]:
        return "is_invoice"
    return "not_invoice"


builder = StateGraph(LedgerState)

builder.add_node("ocr", ocr_agent)
builder.add_node("classification", classification_agent)
builder.add_node("header", header_agent)
builder.add_node("line_items", line_item_agent)
builder.add_node("confidence", confidence_agent)
builder.add_node("validate", validation_agent)
builder.add_node("vendor_memory", vendor_memory_agent)
builder.set_entry_point("ocr")

builder.add_edge("ocr", "classification")
builder.add_conditional_edges(
    "classification",
    route_after_classification,
    {
        "is_invoice": "header",
        "not_invoice": END,
    },
)
builder.add_edge("header", "line_items")
builder.add_edge("line_items", "vendor_memory")
builder.add_edge("vendor_memory", "confidence")
builder.add_edge("confidence", "validate")
builder.add_edge("validate", END)

graph = builder.compile()