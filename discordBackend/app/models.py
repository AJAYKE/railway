import uuid
from datetime import datetime
from typing import Dict

from pydantic import BaseModel
from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base

# SQLAlchemy Base
Base = declarative_base()


class Message(Base):
    """Database model for Discord messages"""
    __tablename__ = "messages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    discord_message_id = Column(String, unique=True, nullable=False)
    author_name = Column(String, nullable=False)
    author_id = Column(String, nullable=False)
    avatar_url = Column(String)
    content = Column(Text, nullable=False)
    channel_id = Column(String, nullable=False)
    guild_id = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)
    processed_at = Column(DateTime, default=datetime.utcnow)


# Pydantic Models for API responses
class MessageResponse(BaseModel):
    """Pydantic model for message API responses"""
    id: str
    author: str
    author_id: str
    avatar: str
    content: str
    timestamp: datetime


class HealthCheck(BaseModel):
    """Pydantic model for health check responses"""
    status: str
    timestamp: datetime
    version: str = "1.0.0"
    components: Dict[str, str]


class ConnectionStats(BaseModel):
    """Pydantic model for connection statistics"""
    total_connections: int
    connections_by_ip: Dict[str, int]
    messages_sent_last_hour: int 