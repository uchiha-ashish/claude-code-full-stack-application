import { AI_NUTRITIONIST } from "@/lib/copy";

export function AiNutritionistCard() {
  return (
    <section className="px-4 mt-5">
      <div className="relative overflow-hidden rounded-2xl bg-[#F3F6EE] p-4 pr-36">
        <p className="text-[11px] font-bold tracking-[0.14em] text-[#6B7D3A]">{AI_NUTRITIONIST.eyebrow}</p>
        <p className="mt-1 text-lg font-semibold text-ink-900 leading-snug">{AI_NUTRITIONIST.title}</p>
        <p className="mt-1 text-sm text-ink-500 leading-snug">{AI_NUTRITIONIST.body}</p>
        <button
          type="button"
          className="mt-3 rounded-xl bg-white px-4 py-2 text-sm font-medium text-ink-900 border border-ink-100"
        >
          {AI_NUTRITIONIST.cta}
        </button>
        {/* Decorative spinach silhouette */}
        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-28 w-28">
          <div className="absolute inset-0 rounded-full bg-[#4E6B28]/60 blur-xl" />
          <svg viewBox="0 0 64 64" className="relative h-full w-full text-[#4E6B28]">
            <path
              fill="currentColor"
              d="M32 4c6 4 10 10 11 18-1-1-5-3-9-3 4 3 8 8 8 14-2-1-7-3-10-2 3 3 7 8 7 14-8 4-18 4-26 0 0-6 4-11 7-14-3-1-8 1-10 2 0-6 4-11 8-14-4 0-8 2-9 3 1-8 5-14 11-18 4 4 6 7 6 11 0-4 2-7 6-11z"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
