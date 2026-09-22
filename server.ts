import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

import studygenHandler from "./api/studygen";
import paystackConfigHandler from "./api/payment/paystack/config";
import paystackInitializeHandler from "./api/payment/paystack/initialize";
import paystackVerifyHandler from "./api/payment/paystack/verify/[reference]";
import healthHandler from "./api/health";

dotenv.config();

// This file exists ONLY for local development (`npm run dev`). It mounts the exact
// same handler functions that run as Vercel Serverless Functions in production
// (see /api), so local dev behaves identically to what actually deploys — no more
// drift between "what works on my machine" and "what's live."
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  app.post("/api/studygen", studygenHandler);
  app.get("/api/payment/paystack/config", paystackConfigHandler);
  app.post("/api/payment/paystack/initialize", paystackInitializeHandler);
  app.get("/api/payment/paystack/verify/:reference", paystackVerifyHandler);
  app.get("/api/health", healthHandler);

  // Vite middleware for dev or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true",
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CampusCore server running on http://localhost:${PORT}`);
  });
}

startServer();
