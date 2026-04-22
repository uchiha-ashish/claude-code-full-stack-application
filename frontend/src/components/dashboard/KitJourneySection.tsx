import { ArrowRight, LineChart } from "lucide-react";
import { KitJourney } from "@/lib/types";
import {
  KIT_JOURNEY_TITLE,
  YOUR_KIT_JOURNEY,
  kitProgressLabel,
  kitPercentLeftLabel,
  CURRENT_CHIP
} from "@/lib/copy";

export function KitJourneySection({ journey }: { journey: KitJourney }) {
  const { currentKitIndex, totalKits, percentLeft, kits } = journey;
  const completedPct = ((currentKitIndex - 1) / totalKits) * 100;

  return (
    <section className="px-4 mt-6">
      <h3 className="text-base font-semibold text-ink-900">{KIT_JOURNEY_TITLE}</h3>
      <div className="mt-1 flex items-center justify-between text-xs">
        <span className="font-semibold text-brand-primary">{kitProgressLabel(currentKitIndex, totalKits)}</span>
        <span className="text-ink-500">{kitPercentLeftLabel(percentLeft)}</span>
      </div>
      <div className="mt-1.5 h-2 w-full rounded-full bg-ink-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-primary transition-[width]"
          style={{ width: `${Math.max(4, completedPct + (100 - completedPct) / 2)}%` }}
        />
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-ink-900">
        <LineChart size={16} className="text-ink-500" />
        <span className="font-medium">{YOUR_KIT_JOURNEY}</span>
      </div>

      <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto -mx-4 px-4 pb-1 snap-x">
        {kits.map((kit) => {
          const isDone = kit.index < currentKitIndex;
          const isCurrent = kit.isCurrent;
          const base = "snap-start shrink-0 w-[220px] rounded-2xl border p-3";
          const cls = isCurrent
            ? "border-brand-primary bg-white shadow-sm"
            : isDone
              ? "border-ink-100 bg-ink-100/60 text-ink-500"
              : "border-ink-100 bg-white";
          return (
            <div key={kit.index} className={`${base} ${cls}`}>
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-ink-900">Kit {kit.index}</p>
                {isCurrent && (
                  <span className="rounded-md bg-ink-900/5 px-2 py-0.5 text-[10px] font-bold tracking-wide text-ink-900">
                    {CURRENT_CHIP}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm font-semibold leading-snug text-ink-900">{kit.title}</p>
              <p className="mt-1 text-xs text-ink-500 leading-snug line-clamp-2">{kit.body}</p>
              <div className="mt-3 flex justify-end">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink-100 text-ink-700">
                  <ArrowRight size={14} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-center gap-1.5">
        {kits.map((k) => (
          <span
            key={k.index}
            className={`h-1.5 rounded-full transition-all ${k.isCurrent ? "w-6 bg-ink-900" : "w-1.5 bg-ink-300"}`}
          />
        ))}
      </div>
    </section>
  );
}
