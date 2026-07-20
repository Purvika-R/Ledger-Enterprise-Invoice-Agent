from app.core.llm import llm
import json

def line_item_agent(state):

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

    return state