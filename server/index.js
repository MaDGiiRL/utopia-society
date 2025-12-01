
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import adminRouter from "./routes/admin.js";

/**
 * Crea e configura l'app Express dell'admin Utopia.
 * NON avvia il listen: restituisce solo l'app.
 */
export function createUtopiaAdminApp(options = {}) {
    const app = express();

    app.use(express.json());
    app.use(cookieParser());

    // CORS configurabile via env
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

    return { app, allowedOrigins };
}

/**
 * Avvia direttamente il server Express su una porta.
 * È la funzione che userai dal progetto "host".
 */
export function startUtopiaAdminServer(options = {}) {
    const port = options.port || process.env.PORT || 4000;

    const { app, allowedOrigins } = createUtopiaAdminApp(options);

    const server = app.listen(port, () => {
        console.log(`Admin API server listening on http://localhost:${port}`);
        console.log("CORS_ORIGIN allowlist:", allowedOrigins);
    });

    return { app, server };
}
