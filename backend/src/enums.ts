// String-literal enums shared across the backend.
// Prisma enums are not supported on SQLite, so these are enforced at the app layer.
export type ItemKey =
  | "DENSITY"
  | "HAIRS_PER_FOLLICLE"
  | "THICKNESS"
  | "VOLUME"
  | "SENSITIVITY"
  | "MOISTURE"
  | "SEBUM"
  | "DANDRUFF";

export type ItemGroup = "HAIR_STRENGTH" | "SCALP_ENVIRONMENT";

export type BookingStatus = "BOOKED" | "COMPLETED" | "CANCELLED";

export const ITEM_KEYS: ItemKey[] = [
  "DENSITY",
  "HAIRS_PER_FOLLICLE",
  "THICKNESS",
  "VOLUME",
  "SENSITIVITY",
  "MOISTURE",
  "SEBUM",
  "DANDRUFF"
];
