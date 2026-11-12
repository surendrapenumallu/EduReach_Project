import type { Request, Response, NextFunction } from "express";
import { cacheGet, cacheSet } from "../config/redis.config";

export const cacheResponse = (ttlSeconds = 60) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Only cache GET requests
    if (req.method !== "GET") {
      next();
      return;
    }

    const key = `cache:${req.originalUrl || req.url}`;

    try {
      const cachedData = await cacheGet(key);
      if (cachedData) {
        res.setHeader("X-Cache", "HIT");
        res.status(200).json(cachedData);
        return;
      }
    } catch (err) {
      console.warn("Cache read warning:", err);
    }

    // Intercept res.json to populate cache
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      res.setHeader("X-Cache", "MISS");
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheSet(key, body, ttlSeconds).catch((err) =>
          console.warn("Cache write warning:", err)
        );
      }
      return originalJson(body);
    };

    next();
  };
};
