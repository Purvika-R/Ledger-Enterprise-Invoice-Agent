from datetime import datetime, timezone
from time import perf_counter


def start_audit_entry(state, agent_name: str):
    entry = {
        "agent_name": agent_name,
        "start_time": datetime.now(timezone.utc).isoformat(),
        "end_time": None,
        "execution_time_ms": None,
        "status": "running",
        "summary": "",
    }

    state.setdefault("audit_trail", []).append(entry)

    return entry, perf_counter()


def complete_audit_entry(entry, started_at: float, summary: str):
    entry["end_time"] = datetime.now(timezone.utc).isoformat()
    entry["execution_time_ms"] = round((perf_counter() - started_at) * 1000)
    entry["status"] = "completed"
    entry["summary"] = summary


def fail_audit_entry(entry, started_at: float):
    entry["end_time"] = datetime.now(timezone.utc).isoformat()
    entry["execution_time_ms"] = round((perf_counter() - started_at) * 1000)
    entry["status"] = "failed"
    entry["summary"] = "Agent execution failed."
