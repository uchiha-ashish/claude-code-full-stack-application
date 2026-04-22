import { fetchDashboard } from "@/lib/api";
import { MobileShell } from "@/components/layout/MobileShell";
import { ScanTimestamp } from "@/components/dashboard/ScanTimestamp";
import { ScalpPhotoThumbnail } from "@/components/dashboard/ScalpPhotoThumbnail";
import { OverallScoreCard } from "@/components/dashboard/OverallScoreCard";
import { SecondaryScoresRow } from "@/components/dashboard/SecondaryScoresRow";
import { MetricList } from "@/components/dashboard/MetricList";
import { CurrentKitSection } from "@/components/dashboard/CurrentKitSection";
import { KitJourneySection } from "@/components/dashboard/KitJourneySection";
import { AfterJourneyCard } from "@/components/dashboard/AfterJourneyCard";
import { NextMilestoneCard } from "@/components/dashboard/NextMilestoneCard";
import { AiNutritionistCard } from "@/components/dashboard/AiNutritionistCard";
import { Disclaimer } from "@/components/dashboard/Disclaimer";
import { FirmwareNote } from "@/components/dashboard/FirmwareNote";
import { ShareResultsBar } from "@/components/dashboard/ShareResultsBar";
import { CASE1_HEADINGS, CASE2_HEADINGS } from "@/lib/copy";

export const dynamic = "force-dynamic";

// For demo: customer id comes from ?c= query param, falling back to DEMO_CUSTOMER_ID env.
// In production the app shell sets the x-traya-customer-id header upstream.
export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const sp = await searchParams;
  const customerId = sp.c ?? process.env.DEMO_CUSTOMER_ID ?? "0314683c-44c2-4383-b94d-efaaa5b4e7c8";

  let data;
  try {
    data = await fetchDashboard(customerId);
  } catch (e) {
    return (
      <MobileShell>
        <div className="p-6">
          <h1 className="text-lg font-semibold">Dashboard unavailable</h1>
          <p className="text-sm text-ink-500 mt-2">
            Couldn&apos;t load data for customer <code>{customerId}</code>. Is the backend running on{" "}
            <code>{process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000"}</code>?
          </p>
          <p className="text-xs text-ink-500 mt-4">{(e as Error).message}</p>
        </div>
      </MobileShell>
    );
  }

  const isCase2 = data.case === "CASE_2";

  return (
    <MobileShell>
      <ScanTimestamp
        at={data.latestScan.scanTimestamp}
        firstName={data.customer.firstName}
        variant={isCase2 ? "latest" : "first"}
      />

      <ScalpPhotoThumbnail photos={data.latestScan.photos} deltas={data.deltas} />

      <OverallScoreCard
        score={data.latestScan.scalpHealthScore}
        band={data.latestScan.bands.scalpHealth.band}
        label={data.latestScan.bands.scalpHealth.label}
        variant={isCase2 ? "tracking" : "starting"}
        deltaFromPrevious={data.deltas?.scalpHealth ?? null}
        trendPoints={data.trend?.scalpHealth}
      />

      {isCase2 && data.trend?.firmwareMismatch && <FirmwareNote />}

      <SecondaryScoresRow latest={data.latestScan} trend={data.trend} />

      {data.case === "CASE_1" && data.summary.case1 && (
        <>
          <MetricList
            title={CASE1_HEADINGS.goodThings}
            rows={data.summary.case1.goodThings}
            emphasis="good"
          />
          <MetricList
            title={CASE1_HEADINGS.improvementAreas}
            rows={data.summary.case1.improvementAreas}
            emphasis="target"
            showFullAnalysisLink
          />
        </>
      )}

      {data.case === "CASE_2" && data.summary.case2 && (
        <>
          <MetricList
            title={CASE2_HEADINGS.improved}
            rows={[
              ...data.summary.case2.hairStrength.improved,
              ...data.summary.case2.scalpEnvironment.improved
            ]}
            emphasis="good"
          />
          <MetricList
            title={CASE2_HEADINGS.degraded}
            rows={[
              ...data.summary.case2.hairStrength.degraded,
              ...data.summary.case2.scalpEnvironment.degraded
            ]}
            emphasis="target"
            showFullAnalysisLink
          />
        </>
      )}

      <CurrentKitSection goal={data.monthlyGoal} />

      <KitJourneySection journey={data.kitJourney} />

      <AfterJourneyCard />

      <NextMilestoneCard
        customerId={customerId}
        component={data.booking.component}
        latestScanAt={data.latestScan.scanTimestamp}
        existingBooking={data.booking.existing}
      />

      <AiNutritionistCard />

      <div className="h-4" />

      <Disclaimer text={data.disclaimer} />

      <ShareResultsBar />
    </MobileShell>
  );
}
