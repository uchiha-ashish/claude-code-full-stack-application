import { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

const IS_PROD = process.env.NODE_ENV === "production";

// ---------------------------------------------------------------------------
// Constant-time comparison helper — avoids timing-attack leaks on HMAC checks.
// ---------------------------------------------------------------------------
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

// ---------------------------------------------------------------------------
// Webhook signature verification.
// Becon should sign each webhook with HMAC-SHA256(body, BECON_WEBHOOK_SECRET)
// and send the hex digest in `x-becon-signature`. Enforced when the secret
// is configured; in dev/demo the route falls back to being open (so local
// curl-based ingest still works) but logs a warning.
// ---------------------------------------------------------------------------
export function verifyBeconWebhook(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.BECON_WEBHOOK_SECRET;
  if (!secret) {
    if (IS_PROD) {
      console.error("[security] BECON_WEBHOOK_SECRET not set in production — rejecting webhook");
      return res.status(503).json({ error: "webhook_not_configured" });
    }
    return next();
  }
  const sig = req.header("x-becon-signature");
  if (!sig) return res.status(401).json({ error: "missing_signature" });

  const raw = JSON.stringify(req.body);
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  if (!safeEqual(sig, expected)) {
    return res.status(401).json({ error: "invalid_signature" });
  }
  next();
}

// ---------------------------------------------------------------------------
// Customer-identity HMAC gate.
// The app shell is expected to send both `x-traya-customer-id` and
// `x-traya-signature`, where the signature is HMAC-SHA256(customerId + '.' +
// iso8601Minute, AUTH_SIGNING_SECRET). The minute-grained timestamp means
// the signature is replay-bound to a <=2 minute window without needing server
// session state. When the secret is unset (dev), this is a no-op so the
// existing curl-based demo flow keeps working.
// ---------------------------------------------------------------------------
export function verifyCustomerSignature(req: Request, _res: Response, next: NextFunction) {
  const secret = process.env.AUTH_SIGNING_SECRET;
  if (!secret) {
    if (IS_PROD) {
      console.error("[security] AUTH_SIGNING_SECRET not set in production — identity gate disabled");
    }
    return next();
  }

  const cid = req.header("x-traya-customer-id");
  const sig = req.header("x-traya-signature");
  if (!cid || !sig) {
    return _res.status(401).json({ error: "missing_credentials" });
  }

  // Accept the current, previous, and next minute to tolerate clock skew.
  const now = new Date();
  const windows = [-1, 0, 1].map((offset) => {
    const d = new Date(now);
    d.setMinutes(d.getMinutes() + offset, 0, 0);
    return d.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
  });

  const ok = windows.some((ts) => {
    const expected = crypto.createHmac("sha256", secret).update(`${cid}.${ts}`).digest("hex");
    return safeEqual(sig, expected);
  });
  if (!ok) return _res.status(401).json({ error: "invalid_signature" });
  next();
}

// ---------------------------------------------------------------------------
// Central error handler — sanitizes outgoing error bodies. Stack traces &
// exception messages NEVER leak to the client in production.
// ---------------------------------------------------------------------------
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  const requestId = (req.headers["x-request-id"] as string | undefined) ?? crypto.randomUUID();
  // Structured log — intentionally does NOT include req.body to avoid leaking PII.
  console.error(
    JSON.stringify({
      level: "error",
      requestId,
      method: req.method,
      path: req.path,
      msg: err.message,
      stack: IS_PROD ? undefined : err.stack
    })
  );
  res.setHeader("x-request-id", requestId);
  if (res.headersSent) return;
  res.status(500).json({
    error: "internal_error",
    requestId,
    ...(IS_PROD ? {} : { message: err.message })
  });
}

// ---------------------------------------------------------------------------
// Request-id injector + minimal access log. Skips body so PII stays out.
// ---------------------------------------------------------------------------
export function requestContext(req: Request, res: Response, next: NextFunction) {
  const incoming = req.header("x-request-id");
  const rid = incoming && /^[A-Za-z0-9_-]{8,64}$/.test(incoming) ? incoming : crypto.randomUUID();
  res.setHeader("x-request-id", rid);
  (req as Request & { requestId: string }).requestId = rid;
  next();
}

// ---------------------------------------------------------------------------
// CORS origin resolver — supports a comma-separated allowlist.
// ---------------------------------------------------------------------------
export function corsOriginAllowlist(): string[] | boolean {
  const raw = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";
  const list = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length === 1 ? list : list;
}
