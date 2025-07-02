import json
import time
from datetime import datetime
from typing import List

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
async def health_check(request: Request):
    """Health check endpoint that tests all service connections"""
    components = {}
    
    # Check Redis connection
    try:
        redis_client = request.app.state.redis
        await redis_client.ping()
        components["redis"] = "healthy"
    except Exception as e:
        logger.error("Redis health check failed", error=str(e))
        components["redis"] = "unhealthy"
    
    # Check Discord bot
    try:
        websocket_manager = request.app.state.websocket_manager
        # Check if Discord bot is running by checking if it's in the application state
        if hasattr(request.app.state, 'discord_bot') and request.app.state.discord_bot:
            bot = request.app.state.discord_bot
            if bot.is_ready():
                components["discord"] = "healthy"
            else:
                components["discord"] = "connecting"
        else:
            # Fallback: check if we can access Discord bot through websocket manager
            if websocket_manager and websocket_manager.is_connected():
                components["discord"] = "healthy"
            else:
                components["discord"] = "unhealthy"
    except Exception as e:
        logger.error("Discord bot health check failed", error=str(e))
        components["discord"] = "unhealthy"
    
    # Check database
    try:
        db = db_manager.get_session()
        db.execute("SELECT 1")
        db.close()
        components["database"] = "healthy"
    except Exception as e:
        logger.error("Database health check failed", error=str(e))
        components["database"] = "unhealthy"
    
    # Check WebSocket manager
    try:
        websocket_manager = request.app.state.websocket_manager
        if websocket_manager:
            components["websocket"] = "healthy"
        else:
            components["websocket"] = "unhealthy"
    except Exception as e:
        logger.error("WebSocket manager health check failed", error=str(e))
        components["websocket"] = "unhealthy"
    
    # Determine overall status
    critical_components = ["redis", "database"]
    optional_components = ["discord", "websocket"]
    
    critical_healthy = all(components.get(comp) == "healthy" for comp in critical_components)
    overall_status = "healthy" if critical_healthy else "unhealthy"
    
    # Add additional metadata
    components["version"] = "1.0.0"
    components["environment"] = Config.ENVIRONMENT
    
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