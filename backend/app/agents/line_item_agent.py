from app.core.llm import llm
from app.core.progress import send_progress
import json

def line_item_agent(state):
    progress_name = state.get("progress_agent_name", "Line Item Agent")
    send_progress(progress_name, "running")

    try:
        prompt = f"""
You are an enterprise invoice extraction engine.

Extract every invoice line item.

Return ONLY a valid JSON array.

Do NOT explain.
Do NOT think.
Do NOT use markdown.
Do NOT add notes.
Do NOT add comments.

Each item must contain:

description
quantity
unit_price
amount

Example:

[
  {{
    "description":"USB Cable",
    "quantity":2,
    "unit_price":150,
    "amount":300
  }}
]

Invoice:

{state["ocr_text"]}
"""

        response = llm.invoke(prompt)

        try:
            state["line_items"] = json.loads(response.content)
        except json.JSONDecodeError:
            state["line_items"] = []

        print("Line item extraction complete.")
    except Exception:
        send_progress(progress_name, "failed")
        raise

    send_progress(progress_name, "completed")

    return state
