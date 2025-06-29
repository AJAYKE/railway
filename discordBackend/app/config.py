import os
from typing import List, Optional


class Config:
    """Application configuration loaded from environment variables"""
    
    # Discord Configuration
    DISCORD_TOKEN: str = os.getenv("DISCORD_TOKEN", "")
    DISCORD_GUILD_ID: int = int(os.getenv("DISCORD_GUILD_ID", "0"))
    DISCORD_CHANNEL_ID: int = int(os.getenv("DISCORD_CHANNEL_ID", "0"))
    
    # Database Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://ajsmac:password@localhost/discord_bot")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Rate Limiting
    RATE_LIMIT_WINDOW: int = int(os.getenv("RATE_LIMIT_WINDOW", "60"))  # seconds
    RATE_LIMIT_MAX_REQUESTS: int = int(os.getenv("RATE_LIMIT_MAX_REQUESTS", "100"))
    
    # Connection Limits
    MAX_CONNECTIONS_PER_IP: int = int(os.getenv("MAX_CONNECTIONS_PER_IP", "10"))
    MAX_TOTAL_CONNECTIONS: int = int(os.getenv("MAX_TOTAL_CONNECTIONS", "1000"))
    
    # Message History
    MESSAGE_HISTORY_LIMIT: int = int(os.getenv("MESSAGE_HISTORY_LIMIT", "100"))
    MESSAGE_TTL: int = int(os.getenv("MESSAGE_TTL", "86400"))  # 24 hours
    
    # WebSocket Configuration
    WS_HEARTBEAT_INTERVAL: int = int(os.getenv("WS_HEARTBEAT_INTERVAL", "30"))
    WS_TIMEOUT: int = int(os.getenv("WS_TIMEOUT", "60"))
    
    # Security
    API_KEY: Optional[str] = os.getenv("API_KEY")
    ALLOWED_ORIGINS: List[str] = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    
    # Monitoring
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Server Configuration
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")


def print_config():
    """Print configuration for debugging"""
    print(f"🔧 Discord Bot Configuration:")
    print(f"   Guild ID: {Config.DISCORD_GUILD_ID}")
    print(f"   Channel ID: {Config.DISCORD_CHANNEL_ID}")
    print(f"   Token: {'✅ Set' if Config.DISCORD_TOKEN else '❌ Missing'}")
    print(f"   Database URL: {Config.DATABASE_URL}")
    print(f"   Redis URL: {Config.REDIS_URL}")
    print(f"   Environment: {Config.ENVIRONMENT}")
    print() 