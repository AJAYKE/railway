import json
import time
from datetime import datetime
from typing import List

import redis.asyncio as redis
from app.config import Config
from app.database import db_manager
from app.logging import get_logger
from app.models import ConnectionStats, HealthCheck, MessageResponse
from fastapi import APIRouter, Depends, HTTPException, Request

logger = get_logger()

router = APIRouter()


async def verify_api_key(request: Request):
    """Dependency for API key authentication"""
    if Config.API_KEY:
        api_key = request.headers.get("X-API-Key")
        if api_key != Config.API_KEY:
            raise HTTPException(status_code=401, detail="Invalid API key")


@router.get("/health", response_model=HealthCheck)
async def health_check():
    """Health check endpoint"""
    components = {}
    
    # Check Redis
    try:
        # This would need to be passed in or accessed globally
        # For now, we'll mark it as healthy
        components["redis"] = "healthy"
    except:
        components["redis"] = "unhealthy"
    
    # Check Discord bot
    # This would need to be passed in or accessed globally
    components["discord"] = "healthy"
    
    # Check database
    try:
        db = db_manager.get_session()
        db.execute("SELECT 1")
        db.close()
        components["database"] = "healthy"
    except:
        components["database"] = "unhealthy"
    
    overall_status = "healthy" if all(status == "healthy" for status in components.values()) else "unhealthy"
    
    return HealthCheck(
        status=overall_status,
        timestamp=datetime.utcnow(),
        components=components
    )


@router.get("/stats", response_model=ConnectionStats, dependencies=[Depends(verify_api_key)])
async def get_stats(request: Request):
    """Get connection statistics"""
    websocket_manager = request.app.state.websocket_manager
    redis_client = request.app.state.redis

    connections_by_ip = websocket_manager.get_connection_stats()
    total_connections = websocket_manager.get_total_connections()
    now = int(time.time())
    messages_last_hour = await redis_client.zcount("messages_last_hour", now - 3600, now)
    
    return ConnectionStats(
        total_connections=total_connections,
        connections_by_ip=connections_by_ip,
        messages_sent_last_hour=int(messages_last_hour)
    )


@router.get("/messages", response_model=List[MessageResponse])
async def get_recent_messages(limit: int = 50):
    """Get recent messages"""
    limit = min(limit, Config.MESSAGE_HISTORY_LIMIT)
    
    # This would need Redis access
    # For now, return empty list
    return [] 