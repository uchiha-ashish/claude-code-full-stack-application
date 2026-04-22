import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../db.js";
import { extractFromPayload } from "../services/becon-mapper.js";
import { computeHairStrength, computeScalpEnvironment } from "../services/scores.js";
import { verifyBeconWebhook } from "../middleware/security.js";
import type { BeconPayload } from "../types/becon.js";

export const scansRouter = Router();

// Webhook ingest is an unauthenticated-by-header endpoint protected instead by
// an HMAC signature (see verifyBeconWebhook) and an aggressive rate limit.
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "rate_limited" }
});

// Strict schema for the fields we actually read. Unknown extra fields are
// allowed (Becon may add them over time) but the critical pieces must match.
const webhookSchema = z
  .object({
    traya_customer_id: z.string().uuid(),
    traya_clinic_id: z.string().min(1).max(64),
    composite_scalp_result: z
      .object({
        id: z.number().int().positive(),
        reg_date: z.string().min(1),
        analysis_date: z.string().optional(),
        firmware_version: z.string().optional(),
        result: z
          .object({
            overview: z.object({ composite_scalp_score: z.number() }).passthrough(),
            detail_items: z.array(z.unknown())
          })
          .passthrough()
      })
      .passthrough()
  })
  .passthrough();

// POST /api/scans/webhook — Becon ingest. Idempotent on composite_scalp_result.id.
scansRouter.post("/webhook", webhookLimiter, verifyBeconWebhook, async (req, res) => {
  const parse = webhookSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "invalid_payload", issues: parse.error.issues });
  }

  const payload = parse.data as unknown as BeconPayload;
  const extracted = extractFromPayload(payload);
  const hairStrength = computeHairStrength(extracted.items);
  const scalpEnv = computeScalpEnvironment(extracted.items);

  await prisma.customer.upsert({
    where: { id: extracted.customerId },
    create: {
      id: extracted.customerId,
      firstName: extracted.customer.firstName,
      phoneNumber: extracted.customer.phoneNumber,
      gender: extracted.customer.gender,
      birth: extracted.customer.birth,
      email: extracted.customer.email
    },
    update: {}
  });

  const existing = await prisma.scan.findUnique({ where: { id: extracted.scanId } });
  if (existing) {
    return res.status(200).json({ status: "already_ingested", scanId: extracted.scanId });
  }

  await prisma.scan.create({
    data: {
      id: extracted.scanId,
      customerId: extracted.customerId,
      clinicId: extracted.clinicId,
      scanTimestamp: extracted.scanTimestamp,
      firmwareVersion: extracted.firmwareVersion,
      scalpHealthScore: extracted.scalpHealthScore,
      hairStrengthScore: hairStrength ?? 0,
      scalpEnvironmentScore: scalpEnv ?? 0,
      rawPayload: JSON.stringify(payload),
      photos: JSON.stringify(extracted.photos),
      items: {
        create: extracted.items.map((i) => ({
          itemKey: i.itemKey,
          group: i.group,
          score: i.score,
          rawValue: i.rawValue,
          unit: i.unit
        }))
      }
    }
  });

  return res.status(201).json({ status: "ingested", scanId: extracted.scanId });
});
