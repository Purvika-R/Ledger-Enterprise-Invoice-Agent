from app.core.llm import llm


def extraction_agent(state):

    prompt = f"""
You are an invoice extraction AI.

Return ONLY valid JSON.

Fields:

- invoice_number
- vendor
- invoice_date
- total_amount

Invoice:

{state["ocr_text"]}
"""

    response = llm.invoke(prompt)

    state["extracted_json"] = response.content

    print("Extraction complete.")

    return state