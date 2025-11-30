// server/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import adminRouter from "./routes/admin.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

// CORS configurabile via env
// Esempio .env:
//   CORS_ORIGIN=http://localhost:5173,https://utopia.club
const allowedOrigins =
  process.env.CORS_ORIGIN?.split(",").map((o) => o.trim()) || [
    "http://localhost:5173",
    "https://utopia-society.vercel.app",
  ];

app.use(
  cors({
    origin: (origin, callback) => {
      // richieste senza Origin (es. curl, cron) le accettiamo
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("CORS: origin non permesso:", origin);
      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  })
);

// tutte le rotte admin stanno sotto /api/admin
app.use("/api/admin", adminRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Admin API server listening on http://localhost:${PORT}`);
  console.log("CORS_ORIGIN allowlist:", allowedOrigins);
});
