from queue import Queue

progress_queue = Queue()


def send_progress(agent: str, status: str):
    progress_queue.put(
        {
            "agent": agent,
            "status": status,
        }
    )