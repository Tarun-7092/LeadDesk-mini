import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth";
import leadRoutes from "./routes/leads";

async function main() {
  await connectDB();

  const app = express();

  app.use(
    cors({
      origin: env.frontendOrigin,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "50kb" }));
  app.use(cookieParser());

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/auth", authRoutes);
  app.use("/api/leads", leadRoutes);

  // 404 handler
  app.use((_req, res) => res.status(404).json({ error: "Not found" }));

  // Central error handler — never leak internals
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  });

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] listening on port ${env.port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", err);
  process.exit(1);
});
