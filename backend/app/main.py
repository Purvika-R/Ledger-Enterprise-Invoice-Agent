import json
import time

from fastapi.responses import StreamingResponse

from app.core.progress import progress_queue
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.invoice import router as invoice_router
from app.api.router import api_router
from app.api.auth import router as auth_router
from app.db.database import init_db

app = FastAPI(
    title="Ledger AI",
    description="Enterprise Invoice Intelligence Agent",
    version="1.0.0",
)

origins = [
    "http://localhost:5173",
    "https://ledger-enterprise-invoice-agent-mf2.vercel.app",
    "https://ledger-enterprise-invoice-agent-mf26-xfvw4m1np-purvika-r.vercel.app",
    "https://ledger-enterprise-invoice-agent-5xca1pa4a-purvika-r.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://ledger-enterprise-invoice-agent.*\.vercel\.app|http://localhost:5173",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(invoice_router)
app.include_router(auth_router)


@app.on_event("startup")
def create_database_tables():
    init_db()


@app.get("/progress")
def progress():

    def event_stream():

        while True:

            if not progress_queue.empty():

                event = progress_queue.get()

                yield f"data: {json.dumps(event)}\n\n"

            time.sleep(0.1)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
    )
