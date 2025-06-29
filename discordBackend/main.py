#!/usr/bin/env python3
"""
Discord Message Streamer - Main Entry Point

A scalable Discord to WebSocket message streaming service.
"""

import uvicorn
from app.config import Config

if __name__ == "__main__":
    uvicorn.run(
        "app.application:fastapi_app",
        host=Config.HOST,
        port=Config.PORT,
        log_level=Config.LOG_LEVEL.lower(),
        reload=Config.ENVIRONMENT == "development"
    ) 