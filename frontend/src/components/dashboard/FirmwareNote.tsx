import { FIRMWARE_MISMATCH_NOTE } from "@/lib/copy";
import { Info } from "lucide-react";

export function FirmwareNote() {
  return (
    <div className="px-4 mt-3">
      <div className="rounded-xl border border-band-caution/30 bg-band-caution/10 px-3 py-2 flex gap-2 items-start">
        <Info className="h-4 w-4 text-band-caution shrink-0 mt-0.5" />
        <p className="text-xs text-ink-700 leading-snug">{FIRMWARE_MISMATCH_NOTE}</p>
      </div>
    </div>
  );
}
