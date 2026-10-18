import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { config } from "./config";
import { connectDb } from "./db";
import { authRoutes } from "./routes/auth";
import { boardRoutes } from "./routes/boards";
import { aiRoutes } from "./routes/ai";
import { adminRoutes } from "./routes/admin";

await connectDb();

const app = new Elysia()
  .use(
    cors({
      origin: [config.webOrigin, config.consoleOrigin, "http://localhost:4000", "http://localhost:3002"],
      credentials: true,
    })
  )
  .get("/health", () => ({
    ok: true,
    service: "hyperboard-api",
    model: config.openaiModel,
    time: new Date().toISOString(),
  }))
  .use(authRoutes)
  .use(boardRoutes)
  .use(aiRoutes)
  .use(adminRoutes)
  .listen(config.port);

console.log(`[api] HyperBoard Studio API → http://localhost:${app.server?.port}`);

export type App = typeof app;
