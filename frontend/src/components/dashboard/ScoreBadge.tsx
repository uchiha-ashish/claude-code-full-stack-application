import { Badge } from "@/components/ui/Badge";
import { BAND_BG_CLASS } from "@/lib/bands";
import { Band, BandLabel } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ScoreBadge({ band, label }: { band: Band; label: BandLabel }) {
  return <Badge className={cn(BAND_BG_CLASS[band])}>{label}</Badge>;
}
