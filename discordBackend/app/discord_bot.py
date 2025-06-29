import json
import time
from typing import Optional

import discord
import redis.asyncio as redis
from app.config import Config
from app.database import db_manager
from app.logging import get_logger
from app.models import Message
from app.websocket_manager import WebSocketManager

logger = get_logger()


class DiscordBot:
    """Manages Discord bot functionality"""
    
    def __init__(self, redis_client: redis.Redis, websocket_manager: WebSocketManager):
        self.redis = redis_client
        self.client: Optional[discord.Client] = None
        self.websocket_manager = websocket_manager
        self._setup_bot()
    
    def _setup_bot(self):
        """Setup Discord bot with proper intents"""
        intents = discord.Intents.default()
        intents.message_content = True
        self.client = discord.Client(intents=intents)
        self._setup_events()
    
    def _setup_events(self):
        """Setup Discord bot event handlers"""
        
        @self.client.event
        async def on_ready():
            print(f"🤖 Discord bot is ready! Logged in as: {self.client.user}")
            print(f"📋 Connected to {len(self.client.guilds)} guild(s):")
            for guild in self.client.guilds:
                print(f"   - {guild.name} (ID: {guild.id})")
                if guild.id == Config.DISCORD_GUILD_ID:
                    print(f"   ✅ Target guild found: {guild.name}")
                    # List channels in target guild
                    for channel in guild.channels:
                        if hasattr(channel, 'id'):
                            print(f"      📺 Channel: {channel.name} (ID: {channel.id})")
                            if channel.id == Config.DISCORD_CHANNEL_ID:
                                print(f"      ✅ Target channel found: {channel.name}")
            
            logger.info("Discord bot ready", 
                       bot_user=str(self.client.user),
                       guilds=[guild.name for guild in self.client.guilds])
        
        @self.client.event
        async def on_message(message: discord.Message):
            print(f"📨 Received Discord message:")
            print(f"   From: {message.author.display_name} (ID: {message.author.id})")
            print(f"   Guild: {message.guild.name if message.guild else 'DM'} (ID: {message.guild.id if message.guild else 'N/A'})")
            print(f"   Channel: {message.channel.name if hasattr(message.channel, 'name') else 'Unknown'} (ID: {message.channel.id})")
            print(f"   Content: {message.content[:100]}{'...' if len(message.content) > 100 else ''}")
            print(f"   Is bot: {message.author.bot}")
            
            await self._handle_message(message)
    
    async def _handle_message(self, message: discord.Message):
        """Handle incoming Discord messages"""
        try:
            print(f"🔍 Processing message from {message.author.display_name}...")
            
            # Check if message is from target channel
            if not message.guild:
                print("   ❌ Skipping: Message is not from a guild (DM)")
                return
                
            if message.guild.id != Config.DISCORD_GUILD_ID:
                print(f"   ❌ Skipping: Wrong guild (got {message.guild.id}, expected {Config.DISCORD_GUILD_ID})")
                return
                
            if message.channel.id != Config.DISCORD_CHANNEL_ID:
                print(f"   ❌ Skipping: Wrong channel (got {message.channel.id}, expected {Config.DISCORD_CHANNEL_ID})")
                return
                
            if message.author.bot:
                print("   ❌ Skipping: Message is from a bot")
                return
            
            print(f"   ✅ Message passed all filters - processing...")
            
            # Store message in database
            db = db_manager.get_session()
            try:
                db_message = Message(
                    discord_message_id=str(message.id),
                    author_name=message.author.display_name,
                    author_id=str(message.author.id),
                    avatar_url=message.author.avatar.url if message.author.avatar else "",
                    content=message.content,
                    channel_id=str(message.channel.id),
                    guild_id=str(message.guild.id),
                    created_at=message.created_at
                )
                db.add(db_message)
                db.commit()
                print(f"   💾 Message saved to database with ID: {db_message.id}")
                
                # Cache in Redis
                message_data = {
                    "id": str(db_message.id),
                    "author": message.author.display_name,
                    "author_id": str(message.author.id),
                    "avatar": db_message.avatar_url,
                    "content": message.content,
                    "timestamp": message.created_at.isoformat()
                }
                
                await self.redis.lpush("recent_messages", json.dumps(message_data))
                await self.redis.ltrim("recent_messages", 0, Config.MESSAGE_HISTORY_LIMIT - 1)
                print(f"   📦 Message cached in Redis")

                now = int(time.time())
                await self.redis.zadd("messages_last_hour", {str(now): now})
                await self.redis.zremrangebyscore("messages_last_hour", 0, now - 3600)

                await self.websocket_manager.broadcast_message(message_data)
                
                logger.info("Message processed", 
                           message_id=str(message.id),
                           author=message.author.display_name)
                
            finally:
                db.close()
                
        except Exception as e:
            print(f"   💥 Error processing message: {str(e)}")
            logger.error("Error handling Discord message", 
                        message_id=str(message.id) if message else "unknown",
                        error=str(e))
    
    async def start(self):
        """Start the Discord bot"""
        if not self.client:
            raise RuntimeError("Discord client not initialized")
        await self.client.start(Config.DISCORD_TOKEN)
    
    async def close(self):
        """Close the Discord bot"""
        if self.client:
            await self.client.close() 