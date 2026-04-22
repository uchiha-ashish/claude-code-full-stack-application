import { DISCLAIMER } from "@/lib/copy";

export function Disclaimer({ text }: { text?: string }) {
  return (
    <div className="px-4 mt-6 mb-8">
      <p className="text-[11px] text-ink-500 leading-relaxed text-center">{text ?? DISCLAIMER}</p>
    </div>
  );
}
