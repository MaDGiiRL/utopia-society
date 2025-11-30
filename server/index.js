// server/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import adminRouter from "./routes/admin.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// tutte le rotte admin stanno sotto /api/admin
app.use("/api/admin", adminRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Admin API server listening on http://localhost:${PORT}`);
});
