import json
import re

from app.core.llm import llm
from app.core.progress import send_progress


def extract_json(text: str):
    match = re.search(r"\{.*\}", text, re.DOTALL)

    if match:
        return json.loads(match.group())

    return {}


def header_agent(state):
    send_progress("Header Agent", "running")

    try:
        print("Running Header Agent...")

        prompt = f"""
You are an enterprise invoice extraction AI.

Extract ONLY the invoice header.

Return ONLY valid JSON.

Do not explain.

Do not use markdown.

Do not wrap in ```.

Rules:

- vendor must be ONLY the company issuing the invoice.
- Never include customer names.
- Never include shipping names.
- Never include addresses.

- invoice_date must be YYYY-MM-DD.

- currency must be ISO code like:
INR
USD
EUR
GBP

- total_amount must be the GRAND TOTAL actually paid.

Return:

{{
    "invoice_number":"",
    "vendor":"",
    "invoice_date":"",
    "currency":"",
    "total_amount":0
}}

Invoice:

{state["ocr_text"]}
"""

        response = llm.invoke(prompt)

        state["header_fields"] = extract_json(response.content)

        print("Header extraction complete.")
    except Exception:
        send_progress("Header Agent", "failed")
        raise

    send_progress("Header Agent", "completed")

    return state