from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.models.database import Base


class Issue(Base):
    __tablename__ = "issues"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    application_id = Column(
        Integer,
        ForeignKey("applications.id"),
        nullable=False
    )

    document_id = Column(
        Integer,
        ForeignKey("documents.id"),
        nullable=True
    )

    issue_type = Column(
        String,
        nullable=False
    )

    severity = Column(
        String,
        nullable=False
    )

    message = Column(
        String,
        nullable=False
    )

    recommendation = Column(
        String,
        nullable=True
    )

    application = relationship(
        "Application",
        back_populates="issues"
    )

    document = relationship(
        "Document",
        back_populates="issues"
    )