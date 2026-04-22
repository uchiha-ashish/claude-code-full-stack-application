import { ArrowUp, ArrowDown } from "lucide-react";
import { Band, ItemGroup } from "@/lib/types";
import { BAND_HEX } from "@/lib/bands";
import { GROUP_LABEL, SCORE_SUBTITLES, deltaPill } from "@/lib/copy";

interface Props {
  group: ItemGroup;
  score: number;
  band: Band;
  delta?: number | null;
}

export function SecondaryScoreTile({ group, score, band, delta }: Props) {
  const hasDelta = typeof delta === "number";
  const isUp = (delta ?? 0) >= 0;
  const subtitleKey = group === "HAIR_STRENGTH" ? "hairStrength" : "scalpEnvironment";

  return (
    <div className="flex-1 px-3 py-3">
      <p className="text-2xl font-bold leading-tight" style={{ color: BAND_HEX[band] }}>
        {score}
        <span className="text-base text-ink-500 font-semibold">/100</span>
      </p>
      <p className="text-base font-semibold text-ink-900 mt-1">{GROUP_LABEL[group]}</p>

      {hasDelta ? (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-500">
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: isUp ? BAND_HEX.healthy : BAND_HEX.warning }}
          >
            {isUp ? <ArrowUp size={12} strokeWidth={3} /> : <ArrowDown size={12} strokeWidth={3} />}
          </span>
          <span>{deltaPill(delta!)}</span>
        </div>
      ) : (
        <p className="mt-2 text-xs text-ink-500 leading-snug">{SCORE_SUBTITLES[subtitleKey]}</p>
      )}
    </div>
  );
}
