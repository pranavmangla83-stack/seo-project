import { PricingFlow } from "@/components/pricing-flow";

type PricingPageProps = {
  searchParams: Promise<{
    scanId?: string;
    leadId?: string;
    websiteUrl?: string;
  }>;
};

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const params = await searchParams;
  const scanId = params.scanId ?? "";
  const leadId = params.leadId ?? "";
  const websiteUrl = params.websiteUrl ?? "";

  if (!scanId || !leadId || !websiteUrl) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <section className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold">Pricing is not ready yet</h1>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Complete a website scan and submit your email first.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <PricingFlow scanId={scanId} leadId={leadId} websiteUrl={websiteUrl} />
    </main>
  );
}
