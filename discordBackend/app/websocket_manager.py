import asyncio
import json
import time
import uuid
from typing import Dict

import redis.asyncio as redis
from app.config import Config
from app.logging import get_logger
from fastapi import WebSocket, WebSocketDisconnect

logger = get_logger()


class WebSocketManager:
    """Manages WebSocket connections and message broadcasting"""
    
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        self.connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket) -> str:
        """Accept a new WebSocket connection"""
        client_ip = websocket.client.host
        connection_id = str(uuid.uuid4())
        
        # Check connection limits
        if len(self.connections) >= Config.MAX_TOTAL_CONNECTIONS:
            await websocket.close(code=1013, reason="Server overloaded")
            raise ValueError("Server overloaded")
        
        ip_connections = await self._get_connection_count_for_ip(client_ip)
        if ip_connections >= Config.MAX_CONNECTIONS_PER_IP:
            await websocket.close(code=1013, reason="Too many connections from IP")
            raise ValueError("Too many connections from IP")
        
        await websocket.accept()
        self.connections[connection_id] = websocket
        
        logger.info("WebSocket connection established", 
                   connection_id=connection_id,
                   client_ip=client_ip,
                   total_connections=len(self.connections))
        
        return connection_id
    
    async def disconnect(self, connection_id: str):
        """Remove a WebSocket connection"""
        if connection_id in self.connections:
            del self.connections[connection_id]
            logger.info("WebSocket connection removed", 
                       connection_id=connection_id,
                       remaining_connections=len(self.connections))
    
    async def broadcast_message(self, message_data: dict):
        """Broadcast message to all connected WebSocket clients"""
        if not self.connections:
            return
        
        dead_connections = []
        successful_sends = 0
        
        for connection_id, ws in self.connections.items():
            try:
                # Check rate limiting
                if not await self._check_rate_limit(ws.client.host):
                    continue
                
                await ws.send_text(json.dumps(message_data))
                successful_sends += 1
                
            except Exception as e:
                logger.warning("Failed to send message to client", 
                             connection_id=connection_id,
                             error=str(e))
                dead_connections.append(connection_id)
        
        # Remove dead connections
        for connection_id in dead_connections:
            await self.disconnect(connection_id)
        
        logger.info("Message broadcast completed", 
                   successful_sends=successful_sends,
                   dead_connections=len(dead_connections))
    
    async def send_recent_messages(self, websocket: WebSocket):
        """Send recent messages to a new connection"""
        try:
            recent_messages = await self.redis.lrange("recent_messages", 0, -1)
            for message_json in reversed(recent_messages):
                try:
                    message_data = json.loads(message_json)
                    await websocket.send_text(json.dumps(message_data))
                except Exception as e:
                    logger.warning("Failed to send recent message", error=str(e))
        except Exception as e:
            logger.error("Failed to send recent messages", error=str(e))
    
    async def handle_connection(self, websocket: WebSocket):
        """Handle a WebSocket connection lifecycle"""
        connection_id = None
        try:
            connection_id = await self.connect(websocket)
            
            # Send recent messages
            await self.send_recent_messages(websocket)
            
            # Keep connection alive with heartbeat
            last_heartbeat = time.time()
            
            while True:
                try:
                    # Wait for message with timeout
                    message = await asyncio.wait_for(
                        websocket.receive_text(), 
                        timeout=Config.WS_HEARTBEAT_INTERVAL
                    )
                    
                    # Handle ping/pong for heartbeat
                    if message == "ping":
                        await websocket.send_text("pong")
                        last_heartbeat = time.time()
                    
                except asyncio.TimeoutError:
                    # Send heartbeat if no message received
                    current_time = time.time()
                    if current_time - last_heartbeat > Config.WS_TIMEOUT:
                        logger.info("WebSocket timeout", connection_id=connection_id)
                        break
                    
                    try:
                        await websocket.send_text(json.dumps({"type": "heartbeat"}))
                    except:
                        break
                        
        except WebSocketDisconnect:
            logger.info("WebSocket disconnected", connection_id=connection_id)
        except Exception as e:
            logger.error("WebSocket error", 
                        connection_id=connection_id,
                        error=str(e))
        finally:
            if connection_id:
                await self.disconnect(connection_id)
    
    async def _check_rate_limit(self, client_ip: str) -> bool:
        """Check if client is within rate limits"""
        try:
            key = f"rate_limit:{client_ip}"
            current = await self.redis.get(key)
            
            if current is None:
                await self.redis.setex(key, Config.RATE_LIMIT_WINDOW, 1)
                return True
            
            if int(current) >= Config.RATE_LIMIT_MAX_REQUESTS:
                return False
            
            await self.redis.incr(key)
            return True
            
        except Exception as e:
            logger.error("Rate limit check failed", client_ip=client_ip, error=str(e))
            return True  # Allow on error
    
    async def _get_connection_count_for_ip(self, client_ip: str) -> int:
        """Get current connection count for an IP"""
        count = 0
        for ws in self.connections.values():
            if ws.client.host == client_ip:
                count += 1
        return count
    
    def get_connection_stats(self) -> Dict[str, int]:
        """Get connection statistics"""
        connections_by_ip = {}
        for ws in self.connections.values():
            ip = ws.client.host
            connections_by_ip[ip] = connections_by_ip.get(ip, 0) + 1
        return connections_by_ip
    
    def get_total_connections(self) -> int:
        """Get total number of connections"""
        return len(self.connections)
    
    def is_connected(self) -> bool:
        """Check if the WebSocket manager is properly initialized"""
        return self.redis is not None 