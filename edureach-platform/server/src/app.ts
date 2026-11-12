import express from "express";
import type { Application, Request, Response } from "express";
import cors from "cors";
import apiRoutes from "./routes";
import errorHandler from "./middleware/error-handler.middleware";

const app: Application = express();

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((s) => s.trim())
  : ["http://localhost:5173", "http://localhost:3000", "http://localhost:5050"];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev/prod with header echo
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./config/swagger.config";

// Root Welcome Endpoint
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "EduReach College Intelligence Platform API is running.",
    docs: "/api/docs",
    health: "/api/health",
  });
});

// Health Check Endpoints for production deployment monitoring
app.get(["/health", "/api/health"], (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "EduReach Platform Server is active and operational.",
    timestamp: new Date().toISOString(),
  });
});

// Swagger Interactive API Documentation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount Centralized API Routes
app.use("/api", apiRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

app.use(errorHandler);

export default app;
