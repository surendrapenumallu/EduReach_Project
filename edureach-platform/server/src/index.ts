import http from "node:http";
import "dotenv/config";
import app from "./app";
import connectDB from "./config/database.config";
import { initializeKnowledgeBase } from "./services/rag.service";
import { initSocket } from "./socket";

const PORT = process.env.PORT || 5050;

const start = async (): Promise<void> => {
  try {
    // 1. Connect Mongoose (for users collection)
    await connectDB();

    // 2. Index knowledge base if not already done
    await initializeKnowledgeBase();

    // 3. Create HTTP server & bind Socket.IO
    const httpServer = http.createServer(app);
    initSocket(httpServer);

    // 4. Start Server
    httpServer.listen(PORT, () => {
      console.log(` EduReach Server & Socket.IO running!`);
      console.log(` URL: http://localhost:${PORT}`);
      console.log(` API Docs: http://localhost:${PORT}/api/docs`);
      console.log(` Node: ${process.version}`);
      console.log(` Press Ctrl+C to stop`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();
