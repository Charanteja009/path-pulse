from sqlalchemy import Column, String, JSON, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
import uuid
import datetime

Base = declarative_base()

class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False) # We get this from the JWT token later
    goal = Column(String, nullable=False)
    roadmap_data = Column(JSON, nullable=False) # This stores your 8-week JSON
    created_at = Column(DateTime, default=datetime.datetime.utcnow)