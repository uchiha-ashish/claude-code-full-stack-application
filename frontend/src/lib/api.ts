import { DashboardPayload, HairProgressScan } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

export async function fetchDashboard(customerId: string): Promise<DashboardPayload> {
  const res = await fetch(`${API_BASE}/api/dashboard`, {
    headers: { "x-traya-customer-id": customerId },
    cache: "no-store"
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`dashboard_fetch_failed ${res.status}: ${body}`);
  }
  return res.json();
}

export async function createBooking(customerId: string, scheduledAt: Date): Promise<void> {
  const res = await fetch(`${API_BASE}/api/bookings`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-traya-customer-id": customerId },
    body: JSON.stringify({ scheduledAt: scheduledAt.toISOString() })
  });
  if (!res.ok) throw new Error(`create_booking_failed ${res.status}`);
}

export async function fetchHairProgress(customerId: string): Promise<{ scans: HairProgressScan[] }> {
  const res = await fetch(`${API_BASE}/api/hair-progress`, {
    headers: { "x-traya-customer-id": customerId },
    cache: "no-store"
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`hair_progress_fetch_failed ${res.status}: ${body}`);
  }
  return res.json();
}

export async function rescheduleBooking(customerId: string, id: number, scheduledAt: Date): Promise<void> {
  const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", "x-traya-customer-id": customerId },
    body: JSON.stringify({ scheduledAt: scheduledAt.toISOString() })
  });
  if (!res.ok) throw new Error(`reschedule_failed ${res.status}`);
}
