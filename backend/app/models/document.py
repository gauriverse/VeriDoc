from sqlalchemy import Column, ForeignKey, Integer, String, Float
from sqlalchemy.orm import relationship

from app.models.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    document_id = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    application_id = Column(
        Integer,
        ForeignKey("applications.id"),
        nullable=False
    )

    filename = Column(
        String,
        nullable=False
    )

    file_path = Column(
        String,
        nullable=False
    )

    file_hash = Column(
        String,
        nullable=False,
        index=True
    )

    document_type = Column(
        String,
        nullable=True
    )

    status = Column(
        String,
        default="uploaded"
    )

    confidence = Column(
        Float,
        nullable=True
    )

    application = relationship(
        "Application",
        back_populates="documents"
    )

    extracted_fields = relationship(
        "ExtractedField",
        back_populates="document",
        cascade="all, delete-orphan"
    )

    issues = relationship(
        "Issue",
        back_populates="document",
        cascade="all, delete-orphan"
    )