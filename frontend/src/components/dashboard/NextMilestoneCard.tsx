"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { BookingComponent } from "@/lib/types";
import {
  NEXT_MILESTONE_EYEBROW,
  NEXT_MILESTONE_TITLE,
  RECOMMENDED_DATE_LABEL,
  BOOK_NEXT_CTA,
  BOOKED_LABEL,
  RESCHEDULE_CTA,
  BOOKING_RATIONALE,
  bookFromLabel,
  NOTIFY_WHEN_READY
} from "@/lib/copy";
import { createBooking, rescheduleBooking } from "@/lib/api";

interface Props {
  customerId: string;
  component: BookingComponent;
  latestScanAt: string;
  existingBooking: { id: number; scheduledAt: string } | null;
}

function formatDay(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long" });
}

function formatDayTime(d: Date): string {
  const day = d.toLocaleDateString("en-IN", { day: "numeric", month: "long" });
  const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${day} • ${time}`;
}

// Native datetime-local inputs take "YYYY-MM-DDTHH:mm" with no timezone suffix.
function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function NextMilestoneCard({ customerId, component, latestScanAt, existingBooking }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const rescheduleInputRef = useRef<HTMLInputElement>(null);

  const scan = new Date(latestScanAt);
  const recommended = new Date(scan);
  recommended.setDate(recommended.getDate() + 30);
  const earliest = new Date(scan);
  earliest.setDate(earliest.getDate() + 25);

  const booked = existingBooking ? new Date(existingBooking.scheduledAt) : null;

  const handleBook = () => {
    setError(null);
    startTransition(async () => {
      try {
        await createBooking(customerId, recommended);
        router.refresh();
      } catch (e) {
        setError((e as Error).message);
      }
    });
  };

  const handleReschedule = (nextDate: Date) => {
    if (!existingBooking) return;
    setError(null);
    startTransition(async () => {
      try {
        await rescheduleBooking(customerId, existingBooking.id, nextDate);
        router.refresh();
      } catch (e) {
        setError((e as Error).message);
      }
    });
  };

  const onRescheduleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const v = e.target.value;
    if (!v) return;
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) handleReschedule(d);
  };

  let body: React.ReactNode;
  if (booked) {
    body = (
      <>
        <p className="text-sm text-ink-700">{BOOKED_LABEL}</p>
        <p className="mt-0.5 text-lg font-semibold text-ink-900">{formatDayTime(booked)}</p>
        <div className="relative mt-4">
          <Button
            variant="secondary"
            size="lg"
            className="bg-white text-ink-900 hover:bg-white/80"
            onClick={() => rescheduleInputRef.current?.showPicker?.() ?? rescheduleInputRef.current?.click()}
            disabled={isPending}
          >
            {isPending ? "Updating…" : RESCHEDULE_CTA}
          </Button>
          <input
            ref={rescheduleInputRef}
            type="datetime-local"
            defaultValue={toLocalInputValue(booked)}
            onChange={onRescheduleInputChange}
            className="absolute inset-0 opacity-0 pointer-events-none"
            aria-hidden
          />
        </div>
      </>
    );
  } else if (component === "MATURE") {
    body = (
      <>
        <p className="text-sm text-ink-700">{RECOMMENDED_DATE_LABEL}</p>
        <p className="mt-0.5 text-lg font-semibold text-ink-900">{formatDay(recommended)}</p>
        <Button size="lg" className="mt-4 bg-ink-900 text-white hover:bg-ink-900/90" onClick={handleBook} disabled={isPending}>
          {isPending ? "Booking…" : BOOK_NEXT_CTA}
        </Button>
      </>
    );
  } else {
    body = (
      <>
        <p className="text-sm text-ink-700">{bookFromLabel(formatDay(earliest))}</p>
        <p className="mt-0.5 text-lg font-semibold text-ink-900">{NOTIFY_WHEN_READY}</p>
        <Button variant="secondary" size="lg" className="mt-4 bg-white text-ink-900 hover:bg-white/80" disabled>
          {RESCHEDULE_CTA}
        </Button>
      </>
    );
  }

  return (
    <section className="px-4 mt-5">
      <div className="rounded-2xl bg-[#E8EEF0] p-4 text-center">
        <p className="text-[11px] font-bold tracking-[0.14em] text-brand-primary">{NEXT_MILESTONE_EYEBROW}</p>
        <p className="mt-1 text-lg font-semibold text-ink-900">{NEXT_MILESTONE_TITLE}</p>
        <div className="mt-3">{body}</div>
        {error && <p className="mt-2 text-xs text-band-warning">{error}</p>}
      </div>
      <p className="mt-2 text-center text-xs text-ink-500">{BOOKING_RATIONALE}</p>
    </section>
  );
}
