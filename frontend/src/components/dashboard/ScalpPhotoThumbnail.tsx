import Link from "next/link";
import { ScanPhotos, ScoreDeltas } from "@/lib/types";
import { photosLabel } from "@/lib/copy";
import { BAND_HEX } from "@/lib/bands";

interface Props {
  photos: ScanPhotos;
  deltas?: ScoreDeltas | null;
}

function DeltaChip({ value }: { value: number }) {
  const isUp = value >= 0;
  const color = isUp ? BAND_HEX.healthy : BAND_HEX.warning;
  const sign = isUp ? "+" : "";
  return (
    <span
      className="inline-flex items-center rounded-full bg-white/95 px-2 py-0.5 text-xs font-semibold shadow-sm"
      style={{ color }}
    >
      {sign}
      {value}
    </span>
  );
}

export function ScalpPhotoThumbnail({ photos, deltas }: Props) {
  const preview = photos.front ?? photos.back ?? photos.side ?? photos.crown;
  const total = Math.max(1, photos.count || (preview ? 1 : 0));

  return (
    <div className="px-4 mt-3">
      <Link
        href="/hair-progress"
        className="relative block w-[148px] h-[148px] rounded-2xl overflow-hidden bg-ink-100"
        aria-label="View all scalp photos"
      >
        <div
          className="absolute inset-0 rounded-2xl bg-ink-100"
          style={{
            backgroundImage: `repeating-conic-gradient(#E5E7EB 0% 25%, #F1F5F9 0% 50%)`,
            backgroundSize: "16px 16px"
          }}
        />
        {preview && (
          <img
            src={preview}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        )}
        {/* Stacked-card hint */}
        <span className="absolute -right-1 -top-1 h-full w-full rounded-2xl border border-ink-100 bg-white/40 -z-10" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-2">
          <span className="text-[11px] font-semibold tracking-wide text-white">
            {photosLabel(total)}
          </span>
        </div>

        {deltas && (
          <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
            <DeltaChip value={deltas.scalpHealth} />
            <DeltaChip value={deltas.hairStrength} />
            <DeltaChip value={deltas.scalpEnvironment} />
          </div>
        )}
      </Link>
    </div>
  );
}
