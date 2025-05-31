import redis
import json
import os
from promptcraft.logger_config import setup_logger # Import the logger

logger = setup_logger(__name__) # Get a logger for this module

class RedisCache:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(RedisCache, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self, host=None, port=None, db=0):
        # Ensure __init__ is idempotent for singleton pattern
        if hasattr(self, '_initialized') and self._initialized:
            return
        
        self.redis_host = host or os.getenv("REDIS_HOST", "localhost")
        self.redis_port = port or int(os.getenv("REDIS_PORT", 6379))
        self.redis_db = db
        self.r = None
        self._initialized = True
        logger.info(f"RedisCache instance configured for {self.redis_host}:{self.redis_port}, DB {self.redis_db}")
        self.connect()

    def connect(self):
        try:
            self.r = redis.Redis(
                host=self.redis_host,
                port=self.redis_port,
                db=self.redis_db,
                charset="utf-8",
                decode_responses=True # Decode responses from bytes to string
            )
            self.r.ping() # Verify connection
            logger.info(f"Successfully connected to Redis at {self.redis_host}:{self.redis_port}")
        except redis.exceptions.ConnectionError as e:
            logger.error(f"Error connecting to Redis: {e}")
            self.r = None # Set to None if connection fails

    def is_connected(self):
        if self.r is None:
            return False
        try:
            return self.r.ping()
        except redis.exceptions.ConnectionError:
            logger.warning("Redis ping failed; connection likely lost.")
            return False

    def get(self, key):
        if not self.is_connected():
            logger.warning("Redis not connected. Cannot get from cache.")
            return None
        try:
            value = self.r.get(key)
            if value:
                logger.debug(f"Cache HIT for key '{key}'.")
                return json.loads(value) # Assuming all cached values are JSON strings
            else:
                logger.debug(f"Cache MISS for key '{key}'.")
                return None
        except redis.exceptions.RedisError as e:
            logger.error(f"Redis GET error for key '{key}': {e}")
            return None
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error for key '{key}' from cache: {e}")
            return None # Or delete the malformed key: self.r.delete(key)

    def set(self, key, value, ttl_seconds=300):
        """Set a value in cache, serializing to JSON."""
        if not self.is_connected():
            logger.warning("Redis not connected. Cannot set to cache.")
            return False
        try:
            json_value = json.dumps(value)
            self.r.setex(key, ttl_seconds, json_value)
            logger.debug(f"Cache SET for key '{key}' with TTL {ttl_seconds}s.")
            return True
        except redis.exceptions.RedisError as e:
            logger.error(f"Redis SET error for key '{key}': {e}")
            return False
        except TypeError as e: # For non-serializable objects
            logger.error(f"JSON serialization error for key '{key}': {e}")
            return False

    def delete(self, key):
        if not self.is_connected():
            logger.warning("Redis not connected. Cannot delete from cache.")
            return False
        try:
            self.r.delete(key)
            logger.info(f"Cache DELETE for key '{key}'.")
            return True
        except redis.exceptions.RedisError as e:
            logger.error(f"Redis DELETE error for key '{key}': {e}")
            return False

    def clear_all_promptcraft_cache(self, prefix="promptcraft:"):
        """Clear all keys matching a specific prefix (e.g., 'promptcraft:')."""
        if not self.is_connected():
            logger.warning("Redis not connected. Cannot clear cache.")
            return False
        try:
            keys = self.r.keys(f"{prefix}*")
            if keys:
                self.r.delete(*keys)
                logger.info(f"Cleared {len(keys)} keys with prefix '{prefix}'.")
            else:
                logger.info(f"No keys found with prefix '{prefix}' to clear.")
            return True
        except redis.exceptions.RedisError as e:
            logger.error(f"Redis KEYS or DELETE error during clear_all_promptcraft_cache: {e}")
            return False

# Global instance (Singleton)
# Initialize with default environment variables. Can be reconfigured if needed.
# cache_service = RedisCache()
# Defer instantiation to when it's first imported and used, or manage via FastAPI deps. 