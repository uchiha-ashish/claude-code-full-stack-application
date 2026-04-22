import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { scansRouter } from "./routes/scans.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { bookingsRouter } from "./routes/bookings.js";
import { treatmentPlanRouter } from "./routes/treatmentPlan.js";
import { hairProgressRouter } from "./routes/hairProgress.js";
import { corsOriginAllowlist, errorHandler, requestContext } from "./middleware/security.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const IS_PROD = process.env.NODE_ENV === "production";

// Behind a reverse proxy (Nginx / ELB / Cloudflare) Express needs to trust
// the proxy's X-Forwarded-* headers so rate limiting can key on the real IP.
app.set("trust proxy", 1);

// Strong HTTP security headers (HSTS, X-Content-Type-Options, frame-deny,
// Referrer-Policy, etc.). CSP is off by default because this is an API only.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "same-site" }
  })
);

app.use(
  cors({
    origin: corsOriginAllowlist(),
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "x-traya-customer-id",
      "x-traya-signature",
      "x-becon-signature",
      "x-request-id"
    ],
    methods: ["GET", "POST", "PATCH", "OPTIONS"]
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(requestContext);

// Global baseline rate limit — additional per-route limits layer on top.
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: IS_PROD ? 120 : 600,
    standardHeaders: "draft-7",
    legacyHeaders: false
  })
);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/scans", scansRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/treatment-plan", treatmentPlanRouter);
app.use("/api/hair-progress", hairProgressRouter);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`[scalpscan-backend] listening on http://localhost:${port}`);
});
