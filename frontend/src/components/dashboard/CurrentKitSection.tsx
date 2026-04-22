import { MonthlyGoal } from "@/lib/types";
import { CURRENT_KIT_TITLE } from "@/lib/copy";
import { ProductCard } from "./ProductCard";

export function CurrentKitSection({ goal }: { goal: MonthlyGoal | null }) {
  if (!goal) {
    return (
      <section className="mt-5">
        <h3 className="px-4 text-base font-semibold text-ink-900 mb-2">{CURRENT_KIT_TITLE}</h3>
        <p className="px-4 text-sm text-ink-500">
          Your plan will appear here once your doctor finalizes it.
        </p>
      </section>
    );
  }

  const hasNext = goal.nextMonth && goal.nextMonth.length > 0;

  return (
    <section className="mt-5">
      <h3 className="px-4 text-base font-semibold text-ink-900 mb-1">{CURRENT_KIT_TITLE}</h3>
      {goal.phaseCopy && (
        <p className="px-4 text-xs text-ink-500 leading-snug mb-2">{goal.phaseCopy}</p>
      )}

      <p className="px-4 mt-2 text-xs font-semibold uppercase tracking-wide text-ink-500">This month</p>
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-2 pt-2">
        {goal.currentMonth.map((p) => (
          <ProductCard key={`current-${p.name}`} product={p} />
        ))}
      </div>

      {hasNext && (
        <>
          <p className="px-4 mt-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Next month</p>
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-2 pt-2">
            {goal.nextMonth.map((p) => (
              <ProductCard key={`next-${p.name}`} product={p} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
