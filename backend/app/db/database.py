import os

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ledger.db")

engine_options = {}
if DATABASE_URL.startswith("sqlite"):
    engine_options["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_options)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def init_db():
    from app.db import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    existing_columns = {column["name"] for column in inspect(engine).get_columns("invoices")}
    migrations = {
        "owner_id": "INTEGER",
        "uploaded_by_id": "INTEGER",
        "reviewed_by_id": "INTEGER",
        "approved_by_id": "INTEGER",
        "reviewed_at": "DATETIME",
        "approved_at": "DATETIME",
        "retry_used": "BOOLEAN DEFAULT 0",
        "retry_count": "INTEGER DEFAULT 0",
        "retry_decision": "VARCHAR(32)",
        "retry_agents": "JSON DEFAULT '[]'",
        "retry_duration_ms": "INTEGER",
        "auto_corrected": "BOOLEAN DEFAULT 0",
    }
    with engine.begin() as connection:
        for column, column_type in migrations.items():
            if column not in existing_columns:
                connection.execute(text(f"ALTER TABLE invoices ADD COLUMN {column} {column_type}"))
