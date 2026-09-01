from sqlalchemy import Column, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.models.database import Base


class ExtractedField(Base):
    __tablename__ = "extracted_fields"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    document_id = Column(
        Integer,
        ForeignKey("documents.id"),
        nullable=False
    )

    field_name = Column(
        String,
        nullable=False
    )

    field_value = Column(
        String,
        nullable=True
    )

    confidence = Column(
        Float,
        nullable=True
    )

    document = relationship(
        "Document",
        back_populates="extracted_fields"
    )