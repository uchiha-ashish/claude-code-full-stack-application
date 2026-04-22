import { Router } from "express";
import { prisma } from "../db.js";
import { requireCustomer } from "../middleware/customer.js";

export const treatmentPlanRouter = Router();
treatmentPlanRouter.use(requireCustomer);

treatmentPlanRouter.get("/", async (req, res) => {
  const plan = await prisma.treatmentPlan.findUnique({ where: { customerId: req.customer!.id } });
  if (!plan) return res.json({ plan: null });
  res.json({
    plan: {
      customerId: plan.customerId,
      startDate: plan.startDate,
      monthlyProducts: JSON.parse(plan.monthlyProducts)
    }
  });
});
