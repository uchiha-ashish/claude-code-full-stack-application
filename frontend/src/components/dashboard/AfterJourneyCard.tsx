import { ShieldCheck, ArrowRight } from "lucide-react";
import { AFTER_JOURNEY_TITLE, AFTER_JOURNEY_Q, AFTER_JOURNEY_A, CARE_PLAN_LABEL } from "@/lib/copy";

export function AfterJourneyCard() {
  return (
    <section className="px-4 mt-4">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck size={16} className="text-[#8A6A00]" />
        <h3 className="text-base font-semibold text-[#8A6A00]">{AFTER_JOURNEY_TITLE}</h3>
      </div>
      <div className="rounded-2xl bg-[#FCF4DB] p-4">
        <p className="text-sm font-semibold text-ink-900">{AFTER_JOURNEY_Q}</p>
        <p className="mt-2 text-sm text-ink-700 leading-relaxed">{AFTER_JOURNEY_A}</p>

        <div className="mt-4 pt-3 border-t border-[#E8DBA8] flex items-end justify-between gap-3">
          <p className="text-sm text-[#8A6A00] whitespace-pre-line leading-snug">{CARE_PLAN_LABEL}</p>
          <div className="flex items-center gap-1">
            <span className="h-9 w-9 rounded-md bg-white/80 border border-[#E8DBA8]" />
            <span className="h-9 w-9 rounded-md bg-white/80 border border-[#E8DBA8]" />
            <span className="h-9 w-9 rounded-md bg-white/80 border border-[#E8DBA8]" />
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#8A6A00] text-white">
              <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
