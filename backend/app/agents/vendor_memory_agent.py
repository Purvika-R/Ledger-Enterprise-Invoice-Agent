import json
from pathlib import Path

from app.core.progress import send_progress


MEMORY_FILE = Path("app/memory/vendor_memory.json")


def vendor_memory_agent(state):
    send_progress("Vendor Memory Agent", "running")

    try:
        print("Running Vendor Memory Agent...")

        # Read memory
        with open(MEMORY_FILE, "r") as f:
            memory = json.load(f)

        vendor = state["header_fields"].get("vendor", "").strip()

        if vendor in memory:
            memory[vendor]["invoice_count"] += 1

            with open(MEMORY_FILE, "w") as f:
                json.dump(memory, f, indent=4)

            state["vendor_memory"] = {
                "known_vendor": True,
                "history": memory[vendor],
            }
        else:
            memory[vendor] = {
                "invoice_count": 1,
            }

            with open(MEMORY_FILE, "w") as f:
                json.dump(memory, f, indent=4)

            state["vendor_memory"] = {
                "known_vendor": False,
                "history": memory[vendor],
            }

        print(state["vendor_memory"])
    except Exception:
        send_progress("Vendor Memory Agent", "failed")
        raise

    send_progress("Vendor Memory Agent", "completed")

    return state