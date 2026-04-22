import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { fetchHairProgress } from "@/lib/api";
import { MobileShell } from "@/components/layout/MobileShell";
import { HAIR_PROGRESS_TITLE, HAIR_POSITION_LABEL } from "@/lib/copy";
import { formatScanDate } from "@/lib/utils";
import type { HairProgressScan } from "@/lib/types";

export const dynamic = "force-dynamic";

const POSITIONS: Array<keyof typeof HAIR_POSITION_LABEL> = ["front", "back", "side", "crown"];

function PhotoTile({ src, label }: { src?: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-ink-100 border border-ink-100">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "repeating-conic-gradient(#E5E7EB 0% 25%, #F1F5F9 0% 50%)",
            backgroundSize: "16px 16px"
          }}
        />
        {src && <img src={src} alt={label} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />}
      </div>
      <span className="mt-2 text-sm text-ink-700">{label}</span>
    </div>
  );
}

function ScanBlock({ scan }: { scan: HairProgressScan }) {
  return (
    <section className="px-4 mt-6">
      <h2 className="text-lg font-semibold text-ink-900 mb-3">{formatScanDate(scan.scanTimestamp)}</h2>
      <div className="grid grid-cols-2 gap-4">
        {POSITIONS.map((p) => (
          <PhotoTile key={p} src={scan.photos[p]} label={HAIR_POSITION_LABEL[p]} />
        ))}
      </div>
      <div className="mt-6 border-t border-ink-100" />
    </section>
  );
}

export default async function HairProgressPage({
  searchParams
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const sp = await searchParams;
  const customerId = sp.c ?? process.env.DEMO_CUSTOMER_ID ?? "0314683c-44c2-4383-b94d-efaaa5b4e7c8";

  let data: { scans: HairProgressScan[] };
  try {
    data = await fetchHairProgress(customerId);
  } catch (e) {
    return (
      <MobileShell>
        <div className="p-6">
          <h1 className="text-lg font-semibold">Unavailable</h1>
          <p className="text-xs text-ink-500 mt-2">{(e as Error).message}</p>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <header className="flex items-center gap-4 px-4 pt-6 pb-2">
        <Link href="/dashboard" aria-label="Back" className="text-ink-900">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="flex-1 text-center text-xl font-semibold text-ink-900 pr-8">{HAIR_PROGRESS_TITLE}</h1>
      </header>
      {data.scans.length === 0 ? (
        <p className="px-4 mt-8 text-sm text-ink-500">No scans yet.</p>
      ) : (
        data.scans.map((s) => <ScanBlock key={s.id} scan={s} />)
      )}
      <div className="h-10" />
    </MobileShell>
  );
}
