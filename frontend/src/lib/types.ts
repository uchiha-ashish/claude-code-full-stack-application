export type Band = "warning" | "caution" | "normal" | "healthy";
export type BandLabel = "Warning" | "Caution" | "Normal" | "Healthy";
export type ItemGroup = "HAIR_STRENGTH" | "SCALP_ENVIRONMENT";
export type ItemKey =
  | "DENSITY"
  | "HAIRS_PER_FOLLICLE"
  | "THICKNESS"
  | "VOLUME"
  | "SENSITIVITY"
  | "MOISTURE"
  | "SEBUM"
  | "DANDRUFF";
export type BookingComponent = "PREMATURE" | "MATURE";
export type TreatmentPhase = "weeks_0_8" | "weeks_8_16" | "weeks_16_plus";

export interface ScanItemRow {
  itemKey: ItemKey;
  label: string;
  group: ItemGroup;
  score: number;
  rawValue: number | null;
  unit: string | null;
  band: Band;
}

export interface ScanPhotos {
  front?: string;
  back?: string;
  side?: string;
  crown?: string;
  count: number;
}

export interface LatestScan {
  id: number;
  scanTimestamp: string;
  firmwareVersion: string | null;
  scalpHealthScore: number;
  hairStrengthScore: number;
  scalpEnvironmentScore: number;
  bands: {
    scalpHealth: { band: Band; label: BandLabel };
    hairStrength: { band: Band; label: BandLabel };
    scalpEnvironment: { band: Band; label: BandLabel };
  };
  photos: ScanPhotos;
  items: ScanItemRow[];
}

export interface ScoreDeltas {
  scalpHealth: number;
  hairStrength: number;
  scalpEnvironment: number;
}

export interface KitRow {
  index: number;
  title: string;
  body: string;
  isCurrent: boolean;
}

export interface KitJourney {
  currentKitIndex: number;
  totalKits: number;
  percentLeft: number;
  kits: KitRow[];
}

export interface HairProgressScan {
  id: number;
  scanTimestamp: string;
  photos: ScanPhotos;
}

export interface TrendPoint {
  scanDate: string;
  score: number;
}

export interface Trend {
  scalpHealth: TrendPoint[];
  hairStrength: TrendPoint[];
  scalpEnvironment: TrendPoint[];
  firmwareMismatch: boolean;
}

export interface SummaryRow {
  itemKey: ItemKey;
  label: string;
  score: number;
  band: Band;
  description: string;
  expectation: string;
}

export interface DeltaRow extends SummaryRow {
  delta: number;
  previousScore: number;
  direction: "up" | "down";
}

export interface DashboardCase1Summary {
  goodThings: SummaryRow[];
  improvementAreas: SummaryRow[];
}

export interface DashboardCase2Summary {
  hairStrength: { improved: DeltaRow[]; degraded: DeltaRow[] };
  scalpEnvironment: { improved: DeltaRow[]; degraded: DeltaRow[] };
}

export interface ProductPill {
  name: string;
  purpose: string;
}

export interface MonthlyGoal {
  phase: TreatmentPhase;
  phaseCopy: string;
  currentMonth: ProductPill[];
  nextMonth: ProductPill[];
}

export interface DashboardPayload {
  case: "CASE_1" | "CASE_2";
  customer: { id: string; firstName: string | null; onAlcoholMinoxidil: boolean };
  latestScan: LatestScan;
  trend?: Trend;
  deltas: ScoreDeltas | null;
  summary: { case1?: DashboardCase1Summary; case2?: DashboardCase2Summary };
  monthlyGoal: MonthlyGoal | null;
  booking: {
    existing: { id: number; scheduledAt: string } | null;
    component: BookingComponent;
    daysSinceLatestScan: number;
    rationale: string;
  };
  kitJourney: KitJourney;
  disclaimer: string;
}
