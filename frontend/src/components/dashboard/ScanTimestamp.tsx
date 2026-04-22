import { formatScanDate } from "@/lib/utils";
import { case1Header, CASE2_HEADER_TITLE } from "@/lib/copy";

interface Props {
  at: string;
  firstName: string | null;
  variant: "first" | "latest";
}

export function ScanTimestamp({ at, firstName, variant }: Props) {
  const dateLabel = formatScanDate(at);
  return (
    <div className="px-4 pt-6 pb-4 bg-[#DCEAD3]">
      {variant === "first" ? (
        <h1 className="text-xl font-semibold text-ink-900 leading-snug">
          {case1Header(firstName, dateLabel)}
        </h1>
      ) : (
        <>
          <h1 className="text-xl font-semibold text-ink-900 leading-snug">{CASE2_HEADER_TITLE}</h1>
          <p className="mt-1 text-sm text-ink-700">{dateLabel}</p>
        </>
      )}
    </div>
  );
}
