import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRouter from "./routes/health";
import configRouter from "./routes/config";
import planEip7702Router from "./routes/planEip7702";
import submitEip7702Router from "./routes/submitEip7702";
import planPermit2BatchRouter from "./routes/planPermit2Batch";
import submitPermit2BatchRouter from "./routes/submitPermit2Batch";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/", healthRouter);
app.use("/", configRouter);
app.use("/api", planEip7702Router);
app.use("/api", submitEip7702Router);
app.use("/api", planPermit2BatchRouter);
app.use("/api", submitPermit2BatchRouter);

// ─── Error handler (must be last) ─────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[api] Server listening on http://localhost:${PORT}`);
});

export default app;
