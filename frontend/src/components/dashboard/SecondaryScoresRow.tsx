import { Card } from "@/components/ui/Card";
import { LatestScan, Trend } from "@/lib/types";
import { SecondaryScoreTile } from "./SecondaryScoreTile";

export function SecondaryScoresRow({ latest, trend }: { latest: LatestScan; trend?: Trend }) {
  const hs = latest.bands.hairStrength;
  const se = latest.bands.scalpEnvironment;

  const hsDelta =
    trend?.hairStrength && trend.hairStrength.length >= 2
      ? latest.hairStrengthScore - trend.hairStrength[trend.hairStrength.length - 2].score
      : null;
  const seDelta =
    trend?.scalpEnvironment && trend.scalpEnvironment.length >= 2
      ? latest.scalpEnvironmentScore - trend.scalpEnvironment[trend.scalpEnvironment.length - 2].score
      : null;

  return (
    <div className="px-4 mt-3">
      <Card>
        <div className="flex divide-x divide-ink-100">
          <SecondaryScoreTile
            group="HAIR_STRENGTH"
            score={latest.hairStrengthScore}
            band={hs.band}
            delta={hsDelta}
          />
          <SecondaryScoreTile
            group="SCALP_ENVIRONMENT"
            score={latest.scalpEnvironmentScore}
            band={se.band}
            delta={seDelta}
          />
        </div>
      </Card>
    </div>
  );
}
