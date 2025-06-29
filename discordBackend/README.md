# Discord Message Streamer Backend

A scalable Discord to WebSocket message streaming service built with FastAPI, Discord.py, and Redis.

## 🏗️ Project Structure

```
discordBackend/
├── app/                          # Main application package
│   ├── __init__.py              # Package initialization
│   ├── config.py                # Configuration management
│   ├── logging.py               # Logging setup
│   ├── models.py                # Database and API models
│   ├── database.py              # Database connection management
│   ├── discord_bot.py           # Discord bot functionality
│   ├── websocket_manager.py     # WebSocket connection management
│   ├── application.py           # Main application class
│   └── api/                     # API routes package
│       ├── __init__.py          # API package initialization
│       └── routes.py            # REST API endpoints
├── main.py                      # Application entry point
├── pyproject.toml               # Project dependencies
└── README.md                    # This file
```

## 📦 Module Overview

### Core Modules

- **`config.py`**: Centralized configuration management using environment variables
- **`logging.py`**: Structured logging setup with structlog
- **`models.py`**: SQLAlchemy database models and Pydantic API models
- **`database.py`**: Database connection and session management
- **`application.py`**: Main application class that orchestrates all components

### Feature Modules

- **`discord_bot.py`**: Discord bot functionality with message handling
- **`websocket_manager.py`**: WebSocket connection management and broadcasting
- **`api/routes.py`**: REST API endpoints for health checks and statistics

## 🚀 Getting Started

### Prerequisites

- Python 3.12+
- Redis server
- PostgreSQL database
- Discord bot token

### Environment Variables

Create a `.env` file with the following variables:

```env
# Discord Configuration
DISCORD_TOKEN=your_discord_bot_token
DISCORD_GUILD_ID=your_guild_id
DISCORD_CHANNEL_ID=your_channel_id

# Database Configuration
DATABASE_URL=postgresql://user:pass@localhost/discord_bot
REDIS_URL=redis://localhost:6379

# Security
API_KEY=your_api_key_optional
ALLOWED_ORIGINS=*

# Environment
ENVIRONMENT=development
LOG_LEVEL=INFO
```

### Installation

1. Install dependencies:

   ```bash
   uv sync
   ```

2. Run the application:
   ```bash
   uv run main.py
   ```

## 🔧 Configuration

The application uses a centralized configuration system in `app/config.py`. All settings are loaded from environment variables with sensible defaults.

### Key Configuration Options

- **Discord**: Bot token, guild ID, and channel ID
- **Database**: PostgreSQL connection URL
- **Redis**: Redis connection URL for caching
- **Rate Limiting**: Request limits and time windows
- **WebSocket**: Connection limits and heartbeat intervals
- **Security**: API key and CORS origins

## 📡 API Endpoints

### WebSocket

- `GET /ws` - WebSocket endpoint for real-time message streaming

### REST API

- `GET /health` - Health check endpoint
- `GET /stats` - Connection statistics (requires API key)
- `GET /messages` - Recent messages

## 🔄 Message Flow

1. **Discord Message Received**: Bot listens to Discord channel
2. **Message Processing**: Validates and filters messages
3. **Database Storage**: Saves message to PostgreSQL
4. **Redis Caching**: Caches message for quick access
5. **WebSocket Broadcast**: Sends message to all connected clients

## 🛠️ Development

### Adding New Features

1. **New API Endpoints**: Add routes to `app/api/routes.py`
2. **New Models**: Add to `app/models.py`
3. **New Configuration**: Add to `app/config.py`
4. **New Discord Events**: Add to `app/discord_bot.py`

### Testing

The modular structure makes it easy to test individual components:

```python
from app.discord_bot import DiscordBot
from app.websocket_manager import WebSocketManager
# Test individual components
```

## 📊 Monitoring

The application includes comprehensive logging and health checks:

- **Structured Logging**: JSON logs in production, readable in development
- **Health Checks**: Database, Redis, and Discord bot status
- **Connection Statistics**: WebSocket connection counts and message rates

## 🔒 Security Features

- **Rate Limiting**: Per-IP request limiting
- **Connection Limits**: Maximum connections per IP and total
- **API Key Authentication**: Optional API key for protected endpoints
- **CORS Configuration**: Configurable allowed origins

## 🚀 Deployment

The application is designed for containerized deployment:

- **Environment Variables**: All configuration via environment
- **Health Checks**: Built-in health check endpoint
- **Graceful Shutdown**: Proper cleanup on shutdown signals
- **Logging**: Structured logging for production monitoring
