import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.utils import utc_now


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_file_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    logline: Mapped[str | None] = mapped_column(Text, nullable=True)
    synopsis: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="draft")
    format: Mapped[str] = mapped_column(String(50), default="film")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    owner: Mapped["User"] = relationship("User", back_populates="projects")
    characters: Mapped[list["Character"]] = relationship("Character", back_populates="project", cascade="all, delete-orphan")
    locations: Mapped[list["Location"]] = relationship("Location", back_populates="project", cascade="all, delete-orphan")
    scenes: Mapped[list["Scene"]] = relationship("Scene", back_populates="project", cascade="all, delete-orphan")
    orchestrator_logs: Mapped[list["OrchestratorLog"]] = relationship("OrchestratorLog", back_populates="project", cascade="all, delete-orphan")


from app.models.character import Character  # noqa: E402, F401
from app.models.location import Location  # noqa: E402, F401
from app.models.log import OrchestratorLog  # noqa: E402, F401
from app.models.scene import Scene  # noqa: E402, F401
from app.models.user import User  # noqa: E402, F401
