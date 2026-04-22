import { Request, Response, NextFunction } from "express";
import { prisma } from "../db.js";
import type { Customer } from "@prisma/client";
import { verifyCustomerSignature } from "./security.js";

declare global {
  namespace Express {
    interface Request {
      customer?: Customer;
    }
  }
}

// UUID v4 check — the customer id is a direct-object-reference today, so even
// the "before auth" stage should reject malformed input before we touch the DB.
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function identityCheck(req: Request, res: Response, next: NextFunction) {
  const customerId = req.header("x-traya-customer-id");
  if (!customerId) {
    return res
      .status(401)
      .json({ error: "missing_customer_header", message: "x-traya-customer-id header is required" });
  }
  if (!UUID_V4.test(customerId)) {
    return res.status(400).json({ error: "invalid_customer_id" });
  }
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    return res.status(404).json({ error: "customer_not_found" });
  }
  req.customer = customer;
  next();
}

// Composed middleware: signature gate (no-op in dev without AUTH_SIGNING_SECRET)
// → lookup. Exported as a single function to match the old API shape.
export async function requireCustomer(req: Request, res: Response, next: NextFunction) {
  verifyCustomerSignature(req, res, (err) => {
    if (err) return next(err);
    identityCheck(req, res, next).catch(next);
  });
}
