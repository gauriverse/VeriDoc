from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String
from sqlalchemy.orm import relationship

from app.models.database import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)

    application_id = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    status = Column(
        String,
        default="created"
    )

    readiness_score = Column(
        Float,
        nullable=True
    )

    documents = relationship(
        "Document",
        back_populates="application",
        cascade="all, delete-orphan"
    )

    issues = relationship(
        "Issue",
        back_populates="application",
        cascade="all, delete-orphan"
    )