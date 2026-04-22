import { Share2 } from "lucide-react";
import { SHARE_RESULTS } from "@/lib/copy";

export function ShareResultsBar() {
  return (
    <div className="sticky bottom-0 left-0 right-0 border-t border-ink-100 bg-white/95 backdrop-blur px-4 py-3">
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary py-3 text-sm font-semibold text-white"
      >
        <Share2 size={16} />
        {SHARE_RESULTS}
      </button>
    </div>
  );
}
