import type { ItemGroup, ItemKey } from "../enums.js";
import { BeconDetailItem, BeconPayload } from "../types/becon.js";

type Mapping = {
  itemKey: ItemKey;
  group: ItemGroup;
  consumerLabel: string;
};

export const BECON_TO_TRAYA: Record<string, Mapping> = {
  HAIR_FOLLICLE_DENSITY: { itemKey: "DENSITY", group: "HAIR_STRENGTH", consumerLabel: "Hair Density" },
  HAIR_PER_HAIR_FOLLICLE: { itemKey: "HAIRS_PER_FOLLICLE", group: "HAIR_STRENGTH", consumerLabel: "Follicle Fullness" },
  HAIR_THICKNESS: { itemKey: "THICKNESS", group: "HAIR_STRENGTH", consumerLabel: "Hair Thickness" },
  HAIR_QUANTITY: { itemKey: "VOLUME", group: "HAIR_STRENGTH", consumerLabel: "Hair Fullness" },
  SENSITIVITY: { itemKey: "SENSITIVITY", group: "SCALP_ENVIRONMENT", consumerLabel: "Scalp Calm" },
  WATER: { itemKey: "MOISTURE", group: "SCALP_ENVIRONMENT", consumerLabel: "Scalp Hydration" },
  OIL: { itemKey: "SEBUM", group: "SCALP_ENVIRONMENT", consumerLabel: "Scalp Oil Balance" },
  DEAD_SKIN: { itemKey: "DANDRUFF", group: "SCALP_ENVIRONMENT", consumerLabel: "Scalp Clarity" }
};

export const CONSUMER_LABEL: Record<ItemKey, string> = {
  DENSITY: "Hair Density",
  HAIRS_PER_FOLLICLE: "Follicle Fullness",
  THICKNESS: "Hair Thickness",
  VOLUME: "Hair Fullness",
  SENSITIVITY: "Scalp Calm",
  MOISTURE: "Scalp Hydration",
  SEBUM: "Scalp Oil Balance",
  DANDRUFF: "Scalp Clarity"
};

export interface MappedScanItem {
  itemKey: ItemKey;
  group: ItemGroup;
  score: number;
  rawValue: number | null;
  unit: string | null;
}

export function mapDetailItems(items: BeconDetailItem[]): MappedScanItem[] {
  const out: MappedScanItem[] = [];
  for (const it of items) {
    const m = BECON_TO_TRAYA[it.item];
    if (!m) continue;
    out.push({
      itemKey: m.itemKey,
      group: m.group,
      score: Math.round(it.my_average_score),
      rawValue: it.my_average_value ?? null,
      unit: it.unit ?? null
    });
  }
  return out;
}

export interface ScanPhotos {
  front?: string;
  back?: string;
  side?: string;
  crown?: string;
  count: number;
}

export interface ExtractedScan {
  scanId: number;
  customerId: string;
  clinicId: string;
  scanTimestamp: Date;
  firmwareVersion: string | null;
  scalpHealthScore: number;
  items: MappedScanItem[];
  photos: ScanPhotos;
  customer: {
    firstName?: string;
    phoneNumber?: string;
    gender?: string;
    birth?: string;
    email?: string;
  };
}

// Becon position → consumer-facing slot. Sample payloads only expose
// FOREHEAD / HIND_HEAD; side & crown stay undefined until the device ships more angles.
const POSITION_SLOT: Record<string, keyof Omit<ScanPhotos, "count">> = {
  FOREHEAD: "front",
  HIND_HEAD: "back",
  TOP_HEAD: "crown",
  CROWN: "crown",
  SIDE: "side",
  SIDE_HEAD: "side"
};

export function extractPhotos(payload: BeconPayload): ScanPhotos {
  const result = payload.composite_scalp_result?.result as any;
  const detail = Array.isArray(result?.detail_items) ? result.detail_items : [];
  const photos: ScanPhotos = { count: 0 };
  for (const item of detail) {
    const images = Array.isArray(item?.images) ? item.images : [];
    for (const img of images) {
      const slot = POSITION_SLOT[img?.position];
      if (slot && !photos[slot] && typeof img.image_url === "string") {
        photos[slot] = img.image_url;
      }
    }
    if (photos.front && photos.back && photos.side && photos.crown) break;
  }
  photos.count = (["front", "back", "side", "crown"] as const).reduce(
    (acc, slot) => acc + (photos[slot] ? 1 : 0),
    0
  );
  return photos;
}

export function extractFromPayload(payload: BeconPayload): ExtractedScan {
  const r = payload.composite_scalp_result;
  return {
    scanId: r.id,
    customerId: payload.traya_customer_id,
    clinicId: payload.traya_clinic_id,
    scanTimestamp: new Date(r.analysis_date ?? r.reg_date),
    firmwareVersion: r.firmware_version ?? null,
    scalpHealthScore: Math.round(r.result.overview.composite_scalp_score),
    items: mapDetailItems(r.result.detail_items),
    photos: extractPhotos(payload),
    customer: {
      firstName: r.result.customer?.first_name,
      phoneNumber: r.result.customer?.phone_number,
      gender: r.result.customer?.gender,
      birth: r.result.customer?.birth,
      email: r.result.customer?.email
    }
  };
}
