import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Table, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.utils import utc_now

scene_characters = Table(
    "scene_characters",
    Base.metadata,
    Column("scene_id", UUID(as_uuid=True), ForeignKey("scenes.id", ondelete="CASCADE"), primary_key=True),
    Column("character_id", UUID(as_uuid=True), ForeignKey("characters.id", ondelete="CASCADE"), primary_key=True),
)


class Scene(Base):
    __tablename__ = "scenes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    act: Mapped[int | None] = mapped_column(Integer, nullable=True)
    title: Mapped[str | None] = mapped_column(String(500), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    int_ext: Mapped[str | None] = mapped_column(String(10), nullable=True)
    time_of_day: Mapped[str | None] = mapped_column(String(20), nullable=True)
    location_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("locations.id"), nullable=True)
    dramatic_function: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_chapter: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="draft")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    project: Mapped["Project"] = relationship("Project", back_populates="scenes")
    location: Mapped["Location | None"] = relationship("Location", back_populates="scenes")
    characters: Mapped[list["Character"]] = relationship("Character", secondary=scene_characters, back_populates="scenes")
    clips: Mapped[list["Clip"]] = relationship("Clip", back_populates="scene", cascade="all, delete-orphan")
    scripts: Mapped[list["Script"]] = relationship("Script", back_populates="scene", cascade="all, delete-orphan")


from app.models.character import Character  # noqa: E402, F401
from app.models.clip import Clip  # noqa: E402, F401
from app.models.location import Location  # noqa: E402, F401
from app.models.project import Project  # noqa: E402, F401
from app.models.script import Script  # noqa: E402, F401
