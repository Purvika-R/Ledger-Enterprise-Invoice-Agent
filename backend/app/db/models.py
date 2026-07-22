from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    invoice_number: Mapped[str | None] = mapped_column(String(255), index=True)
    vendor: Mapped[str | None] = mapped_column(String(255), index=True)
    invoice_date: Mapped[str | None] = mapped_column(String(32), index=True)
    currency: Mapped[str | None] = mapped_column(String(16), index=True)
    total_amount: Mapped[float | None] = mapped_column(Float)
    approval_status: Mapped[str] = mapped_column(String(32), default="pending", index=True)
    validation_passed: Mapped[bool | None] = mapped_column(Boolean, index=True)
    is_invoice: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    classification_confidence: Mapped[float | None] = mapped_column(Float)
    classification_method: Mapped[str | None] = mapped_column(String(32))
    header_data: Mapped[dict] = mapped_column(JSON, default=dict)
    confidence_data: Mapped[dict] = mapped_column(JSON, default=dict)
    validation_errors: Mapped[list] = mapped_column(JSON, default=list)
    field_validation: Mapped[dict] = mapped_column(JSON, default=dict)
    classification_data: Mapped[dict] = mapped_column(JSON, default=dict)
    retry_used: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=0)
    retry_decision: Mapped[str | None] = mapped_column(String(32))
    retry_agents: Mapped[list] = mapped_column(JSON, default=list)
    retry_duration_ms: Mapped[int | None] = mapped_column(Integer)
    auto_corrected: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, index=True)
    owner_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), index=True)
    uploaded_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    reviewed_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    approved_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    line_items: Mapped[list["LineItem"]] = relationship(
        back_populates="invoice", cascade="all, delete-orphan"
    )
    audit_trail: Mapped[list["AuditTrail"]] = relationship(
        back_populates="invoice", cascade="all, delete-orphan"
    )
    owner: Mapped["User | None"] = relationship(foreign_keys=[owner_id], back_populates="invoices")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(32), default="viewer", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    invoices: Mapped[list[Invoice]] = relationship(
        foreign_keys="Invoice.owner_id", back_populates="owner"
    )


class LineItem(Base):
    __tablename__ = "line_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    invoice_id: Mapped[int] = mapped_column(ForeignKey("invoices.id"), index=True)
    description: Mapped[str | None] = mapped_column(Text)
    quantity: Mapped[float | None] = mapped_column(Float)
    unit_price: Mapped[float | None] = mapped_column(Float)
    amount: Mapped[float | None] = mapped_column(Float)

    invoice: Mapped[Invoice] = relationship(back_populates="line_items")


class VendorMemory(Base):
    __tablename__ = "vendor_memory"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    vendor: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    invoice_count: Mapped[int] = mapped_column(Integer, default=0)
    known_vendor: Mapped[bool] = mapped_column(Boolean, default=False)
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class AuditTrail(Base):
    __tablename__ = "audit_trail"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    invoice_id: Mapped[int] = mapped_column(ForeignKey("invoices.id"), index=True)
    agent_name: Mapped[str] = mapped_column(String(128))
    start_time: Mapped[str | None] = mapped_column(String(64))
    end_time: Mapped[str | None] = mapped_column(String(64))
    execution_time_ms: Mapped[int | None] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(32))
    summary: Mapped[str] = mapped_column(Text)

    invoice: Mapped[Invoice] = relationship(back_populates="audit_trail")
