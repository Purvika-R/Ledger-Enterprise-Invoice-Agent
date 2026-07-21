from app.ocr.ocr_service import extract_text
from app.core.progress import send_progress


def ocr_agent(state):
    send_progress("OCR Agent", "running")

    try:
        print("Running OCR Agent...")

        text = extract_text(state["image_path"])

        state["ocr_text"] = text
    except Exception:
        send_progress("OCR Agent", "failed")
        raise

    send_progress("OCR Agent", "completed")

    return state