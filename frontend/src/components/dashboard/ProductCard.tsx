import { Leaf } from "lucide-react";
import { ProductPill } from "@/lib/types";

export function ProductCard({ product }: { product: ProductPill }) {
  return (
    <div className="shrink-0 w-[180px] rounded-2xl bg-brand-accent p-3">
      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold tracking-wide text-brand-primary shadow-sm">
        <Leaf size={12} />
        AYURVEDA
      </span>
      <div className="mt-3 flex h-[140px] items-center justify-center rounded-xl bg-white/60">
        {/* Placeholder product visual — Phase-1 has no product image pipeline. */}
        <div className="h-20 w-12 rounded-md bg-gradient-to-b from-[#6B7D3A] to-[#2F3A1A]" />
        <div className="ml-2 h-16 w-9 rounded-md bg-gradient-to-b from-[#CFCFC3] to-[#D6D3B8]" />
      </div>
      <p className="mt-3 text-sm font-semibold text-ink-900">{product.name}</p>
      <p className="mt-1 text-xs text-ink-500 leading-snug line-clamp-3">{product.purpose}</p>
    </div>
  );
}
