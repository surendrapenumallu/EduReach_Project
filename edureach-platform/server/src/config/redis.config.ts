import Redis from "ioredis";

// Memory cache fallback for local environments when Redis server is not running
interface CacheEntry {
  value: string;
  expiresAt: number;
}
const memoryCache = new Map<string, CacheEntry>();

let redisClient: Redis | null = null;
let isRedisAvailable = false;

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

try {
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
      if (times > 2) return null; // stop reconnecting if not running
      return 1000;
    },
    lazyConnect: true,
  });

  redisClient.connect().then(() => {
    isRedisAvailable = true;
    console.log("⚡ [Redis] Connected successfully to Redis Cache & Queue!");
  }).catch(() => {
    isRedisAvailable = false;
    console.log("ℹ️  [Redis] Server not running locally — active fallback to in-memory TTL cache engine.");
  });

  redisClient.on("error", () => {
    isRedisAvailable = false;
  });
} catch {
  isRedisAvailable = false;
}

export const cacheGet = async <T = any>(key: string): Promise<T | null> => {
  try {
    if (isRedisAvailable && redisClient) {
      const data = await redisClient.get(key);
      if (data) return JSON.parse(data) as T;
    }
  } catch {
    // fallback to memory
  }

  // Memory fallback check
  const entry = memoryCache.get(key);
  if (entry) {
    if (Date.now() < entry.expiresAt) {
      return JSON.parse(entry.value) as T;
    }
    memoryCache.delete(key);
  }
  return null;
};

export const cacheSet = async (
  key: string,
  value: any,
  ttlSeconds = 300
): Promise<void> => {
  const serialized = JSON.stringify(value);
  try {
    if (isRedisAvailable && redisClient) {
      await redisClient.setex(key, ttlSeconds, serialized);
      return;
    }
  } catch {
    // fallback
  }

  memoryCache.set(key, {
    value: serialized,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};

export const cacheDel = async (key: string): Promise<void> => {
  try {
    if (isRedisAvailable && redisClient) {
      await redisClient.del(key);
    }
  } catch {
    // fallback
  }
  memoryCache.delete(key);
};

export default redisClient;
