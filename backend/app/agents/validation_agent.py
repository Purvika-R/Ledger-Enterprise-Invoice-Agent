import json


def validation_agent(state):

    print("Validation complete.")

    header = state["header_fields"]
    line_items = state["line_items"]

    state["final_json"] = {
        "header": header,
        "line_items": line_items,
        "vendor_memory": state["vendor_memory"],
        "confidence": state["confidence"],
    }

    return state