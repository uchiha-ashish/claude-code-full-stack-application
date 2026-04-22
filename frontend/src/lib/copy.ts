// PRD §7 — All customer-visible copy lives here so it is easy for the medical team to review.
// Guardrails: no diagnostic language, no efficacy claims, no comparisons, always directional.

export const DISCLAIMER =
  "This score is a tracking tool to help you and your Traya team monitor progress. It is not a medical diagnosis. Please consult your Traya doctor for treatment decisions.";

export const BOOKING_RATIONALE = "Regular scalp tests help track progress & fine-tune your plan";

// Header copy
export const case1Header = (firstName: string | null, dateLabel: string) =>
  `Hi ${firstName ?? "there"}, Your first scalp test is on ${dateLabel}`;
export const CASE2_HEADER_TITLE = "Your latest scalp test results";

// Overall score card
export const OVERALL_SCORE_TITLE = "Your current scalp health";
export const OVERALL_SCORE_LEAD = "Your overall score";
export const OVERALL_SCORE_SUB_CASE1 = "This is your starting point";
export const OVERALL_SCORE_SUB_CASE2 = "We'll track this over time";
export const deltaPill = (delta: number) =>
  `${delta > 0 ? "+" : ""}${delta} since your last scan`;

// Secondary score tiles
export const SCORE_LABELS = {
  scalpHealth: "Your overall score",
  hairStrength: "Hair strength",
  scalpEnvironment: "Scalp environment"
};

export const SCORE_SUBTITLES = {
  hairStrength: "Avg. of density, fullness, thickness, and volume",
  scalpEnvironment: "Avg. of calm, hydration, oil balance, and clarity"
};

export const GROUP_LABEL = {
  HAIR_STRENGTH: "Hair strength",
  SCALP_ENVIRONMENT: "Scalp environment"
};

// Case-specific section headings
export const CASE1_HEADINGS = {
  goodThings: "What's looking good",
  improvementAreas: "What your plan is targeting"
};

export const CASE2_HEADINGS = {
  improved: "Healthy signs",
  degraded: "Areas we're working on"
};

export const SEE_FULL_ANALYSIS = "See full scalp analysis";

// Current kit
export const CURRENT_KIT_TITLE = "Your current kit";

// Kit journey
export const KIT_JOURNEY_TITLE = "Visible results will take 8 Kits";
export const kitProgressLabel = (current: number, total: number) => `Kit ${current} of ${total}`;
export const kitPercentLeftLabel = (percent: number) => `${percent}% left to see result`;
export const YOUR_KIT_JOURNEY = "Your kit journey";
export const CURRENT_CHIP = "CURRENT";

// After journey
export const AFTER_JOURNEY_TITLE = "After your journey";
export const AFTER_JOURNEY_Q = "What happens after kit 8?";
export const AFTER_JOURNEY_A =
  "Your treatment will be finished and you'll be promoted to a Care Plan. We will help you maintain your achieved hair growth and get even better results.";
export const CARE_PLAN_LABEL = "Care Plan\nUsually Includes";

// Next milestone (booking) card
export const NEXT_MILESTONE_EYEBROW = "NEXT MILESTONE";
export const NEXT_MILESTONE_TITLE = "Track your 30-day growth";
export const RECOMMENDED_DATE_LABEL = "Recommended date";
export const BOOK_NEXT_CTA = "Book Your Next Scan";
export const BOOKED_LABEL = "Your scan is booked";
export const RESCHEDULE_CTA = "Rescheduled";
export const bookFromLabel = (dateLabel: string) => `You can book from ${dateLabel}`;
export const NOTIFY_WHEN_READY = "We'll notify you when it's time";

// AI Nutritionist (redesigned)
export const AI_NUTRITIONIST = {
  eyebrow: "AI NUTRITIONIST",
  title: "Up to 30% of hair loss is linked to..",
  body: "Get a personalised diet plan based on your..",
  cta: "View Your Diet Plan"
};

// Share + firmware
export const SHARE_RESULTS = "Share my results";
export const FIRMWARE_MISMATCH_NOTE =
  "Your scans were taken on different device versions — measurement methodology may have changed slightly.";

// Photos thumbnail
export const photosLabel = (n: number) => `${n} PHOTOS`;

// Hair Progress page
export const HAIR_PROGRESS_TITLE = "Hair Progress";
export const HAIR_POSITION_LABEL: Record<"front" | "back" | "side" | "crown", string> = {
  front: "Front",
  back: "Back",
  side: "Side",
  crown: "Crown"
};
