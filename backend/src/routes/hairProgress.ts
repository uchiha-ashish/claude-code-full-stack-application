import { Router } from "express";
import { prisma } from "../db.js";
import { requireCustomer } from "../middleware/customer.js";
import type { ScanPhotos } from "../services/becon-mapper.js";

export const hairProgressRouter = Router();
hairProgressRouter.use(requireCustomer);

hairProgressRouter.get("/", async (req, res) => {
  const scans = await prisma.scan.findMany({
    where: { customerId: req.customer!.id },
    orderBy: { scanTimestamp: "desc" },
    select: { id: true, scanTimestamp: true, photos: true }
  });

  const parse = (raw: string | null): ScanPhotos => {
    if (!raw) return { count: 0 };
    try {
      return JSON.parse(raw) as ScanPhotos;
    } catch {
      return { count: 0 };
    }
  };

  res.json({
    scans: scans.map((s) => ({
      id: s.id,
      scanTimestamp: s.scanTimestamp,
      photos: parse(s.photos)
    }))
  });
});
