import { Router } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireCustomer } from "../middleware/customer.js";

export const bookingsRouter = Router();
bookingsRouter.use(requireCustomer);

// Tight limiter for write actions — keyed on customer id so a single account
// can't brute-force the endpoint even from multiple source IPs.
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req, res) => req.customer?.id ?? ipKeyGenerator(req.ip ?? "", res),
  message: { error: "rate_limited" }
});

bookingsRouter.get("/next", async (req, res) => {
  const booking = await prisma.booking.findFirst({
    where: { customerId: req.customer!.id, status: "BOOKED", scheduledAt: { gte: new Date() } },
    orderBy: { scheduledAt: "asc" }
  });
  res.json({ booking });
});

// Booking dates must be in the future and within a reasonable horizon so a
// caller can't seed an arbitrary 2099 booking and poke at the calendar logic.
const MAX_HORIZON_MS = 365 * 24 * 60 * 60 * 1000; // 1 year
const futureIsoSchema = z
  .string()
  .datetime()
  .refine(
    (s) => {
      const t = Date.parse(s);
      return t > Date.now() && t < Date.now() + MAX_HORIZON_MS;
    },
    { message: "scheduledAt must be in the future and within 1 year" }
  );

const createSchema = z.object({ scheduledAt: futureIsoSchema });
bookingsRouter.post("/", writeLimiter, async (req, res) => {
  const parse = createSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "invalid_body", issues: parse.error.issues });
  const booking = await prisma.booking.create({
    data: { customerId: req.customer!.id, scheduledAt: new Date(parse.data.scheduledAt) }
  });
  res.status(201).json({ booking });
});

const rescheduleSchema = z.object({ scheduledAt: futureIsoSchema });
bookingsRouter.patch("/:id", writeLimiter, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "invalid_id" });
  const parse = rescheduleSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "invalid_body", issues: parse.error.issues });

  const existing = await prisma.booking.findFirst({ where: { id, customerId: req.customer!.id } });
  if (!existing) return res.status(404).json({ error: "not_found" });

  const booking = await prisma.booking.update({
    where: { id },
    data: { scheduledAt: new Date(parse.data.scheduledAt) }
  });
  res.json({ booking });
});
