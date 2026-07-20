from app.ocr.ocr_service import extract_text


def ocr_agent(state):
    print("Running OCR Agent...")

    text = extract_text(state["image_path"])

    state["ocr_text"] = text

    return state