import asyncio
import signal
import sys
from contextlib import asynccontextmanager
from typing import Optional

import redis.asyncio as redis
import uvicorn
from app.api.routes import router
from app.config import Config, print_config
from app.database import db_manager
from app.discord_bot import DiscordBot
from app.logging import get_logger, setup_logging
from app.websocket_manager import WebSocketManager
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

logger = get_logger()


class Application:
    """Main application class that manages all components"""
    
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.discord_bot: Optional[DiscordBot] = None
        self.websocket_manager: Optional[WebSocketManager] = None
        self.fastapi_app: Optional[FastAPI] = None
        self.is_shutting_down = False
        
    async def initialize(self):
        """Initialize all application components"""
        try:
            # Setup logging
            setup_logging()
            
            # Print configuration
            print_config()
            
            # Initialize Redis
            self.redis_client = redis.from_url(Config.REDIS_URL, decode_responses=True)
            await self.redis_client.ping()
            logger.info("Redis connection established")
            
            # Initialize database
            db_manager.initialize()
            logger.info("Database connection established")

            # Initialize WebSocket manager
            self.websocket_manager = WebSocketManager(self.redis_client)
            
            # Initialize Discord bot
            self.discord_bot = DiscordBot(self.redis_client, self.websocket_manager)
            
            
            
            logger.info("Application initialized successfully")
            
        except Exception as e:
            logger.error("Failed to initialize application", error=str(e))
            raise
    
    def create_fastapi_app(self) -> FastAPI:
        """Create and configure FastAPI application"""
        self.fastapi_app = FastAPI(
            title="Discord Message Streamer",
            description="Scalable Discord to WebSocket message streaming service",
            version="1.0.0",
            lifespan=self._lifespan
        )
        
        # Add CORS middleware
        self.fastapi_app.add_middleware(
            CORSMiddleware,
            allow_origins=Config.ALLOWED_ORIGINS,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        # Add routes
        self.fastapi_app.include_router(router)
        
        # Add WebSocket endpoint
        @self.fastapi_app.websocket("/ws")
        async def websocket_endpoint(websocket: WebSocket):
            await self.websocket_manager.handle_connection(websocket)
        
        return self.fastapi_app
    
    @asynccontextmanager
    async def _lifespan(self, app: FastAPI):
        """Application lifespan management"""
        # Startup
        await self.initialize()
        app.state.websocket_manager = self.websocket_manager
        app.state.redis = self.redis_client

        # Start Discord bot
        bot_task = asyncio.create_task(self.discord_bot.start())
        yield
        
        # Shutdown
        await self.cleanup()
        bot_task.cancel()
    
    async def cleanup(self):
        """Cleanup all application resources"""
        self.is_shutting_down = True
        
        logger.info("Starting application cleanup...")
        
        # Close Discord bot
        if self.discord_bot:
            await self.discord_bot.close()
        
        # Close Redis
        if self.redis_client:
            await self.redis_client.close()
        
        # Close database
        db_manager.close()
        
        logger.info("Application cleanup completed")
    
    def setup_signal_handlers(self):
        """Setup signal handlers for graceful shutdown"""
        def signal_handler(signum, frame):
            logger.info("Received shutdown signal", signal=signum)
            asyncio.create_task(self.cleanup())
            sys.exit(0)
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
    
    def run(self):
        """Run the application"""
        self.setup_signal_handlers()
        
        uvicorn.run(
            self.create_fastapi_app(),
            host=Config.HOST,
            port=Config.PORT,
            log_level=Config.LOG_LEVEL.lower(),
            reload=Config.ENVIRONMENT == "development"
        )


# Global application instance
app = Application()

# Create FastAPI app instance for uvicorn
def create_app() -> FastAPI:
    """Create FastAPI application instance"""
    return app.create_fastapi_app()

# Expose the FastAPI app for uvicorn
fastapi_app = create_app() 