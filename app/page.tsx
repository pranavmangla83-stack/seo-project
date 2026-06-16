import {
  CheckCircle2,
  Clock,
  Link2,
  Zap
} from "lucide-react";
import { ScanForm } from "@/components/scan-form";

const checks = [
  "Website SEO checker",
  "SEO checker",
  "SEO optimizer",
  "SEO audit",
  "SEO optimization",
  "Technical SEO"
];

const impactSteps = [
  "Scan your site for SEO problems",
  "Prioritize issues by ranking impact",
  "Follow simple recommendations",
  "Apply fixes in minutes, not hours"
];

const landingPlans = [
  {
    name: "Starter",
    price: "Rs 499",
    description: "For small websites that need a quick SEO audit and clear next steps.",
    features: [
      "Website SEO checker report",
      "Top SEO issues summary",
      "Title and meta description checks",
      "On-page optimization recommendations"
    ]
  },
  {
    name: "Growth",
    price: "Rs 1,499",
    description: "For businesses that want deeper guidance and faster SEO optimization.",
    features: [
      "Everything in Starter",
      "Prioritized SEO fix plan",
      "Content and technical SEO checks",
      "One-click fix interest access"
    ]
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <img
              alt="FixMySEO logo"
              className="h-11 w-11 rounded-md"
              height={44}
              src="/logo.svg"
              width={44}
            />
            <div>
              <p className="text-base font-semibold">FixMySEO</p>
              <p className="text-sm text-slate-500">Website SEO scanner</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-sm text-slate-600 sm:flex">
            <CheckCircle2 aria-hidden="true" size={16} />
            No login needed
          </div>
        </header>

        <div className="flex flex-1 items-start py-4 lg:hero-top lg:py-8">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
              <Link2 aria-hidden="true" size={16} />
              Website SEO checker for quick SEO audits
            </p>
            <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
              Find SEO Issues and Improve Your Website Rankings
            </h1>
            <p className="mt-3 max-w-xl text-lg leading-8 text-slate-600">
              Scan your website, identify SEO problems, and get actionable
              fixes for titles, meta descriptions, content, technical SEO, and
              on-page optimization.
            </p>

            <ScanForm />

            <div className="mt-5 flex flex-wrap gap-2">
              {checks.map((check) => (
                <span
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
                  key={check}
                >
                  {check}
                </span>
              ))}
            </div>

            <div className="mt-8 grid gap-4 text-sm leading-6 text-slate-600">
              <p>
                Use FixMySEO as a website SEO checker to run a fast SEO audit
                and find issues that may be holding back your rankings.
              </p>
              <p>
                The SEO checker focuses on practical SEO optimization signals
                like page titles, meta descriptions, content quality, technical
                SEO basics, and on-page optimization.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="min-h-screen border-t border-slate-200 bg-white">
        <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-10 sm:px-8 lg:landing-two-col lg:px-10 lg:py-14">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
              <Zap aria-hidden="true" size={16} />
              SEO optimizer for practical fixes
            </p>
            <h2 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
              Stop guessing why your website isn&apos;t getting traffic.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              We scan your site, identify the issues with the biggest ranking
              impact, prioritize them, and help you fix them in minutes, not
              hours. No SEO expertise required. Just follow the recommendations
              and apply fixes with a few clicks.
            </p>
          </div>

          <div className="grid gap-4">
            {impactSteps.map((step, index) => (
              <div
                className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5"
                key={step}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white">
                  {index + 1}
                </div>
                <p className="font-semibold text-slate-950">{step}</p>
              </div>
            ))}
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-start gap-3">
                <Clock
                  aria-hidden="true"
                  className="text-emerald-800"
                  size={22}
                />
                <p className="text-sm leading-6 text-emerald-800">
                  Built for business owners who want clear SEO recommendations,
                  not a confusing technical report.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="min-h-screen border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-emerald-800">
              India pricing
            </p>
            <h2 className="mt-2 text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
              Start with an affordable SEO audit
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Choose the level of SEO optimization help you want after your
              website scan.
            </p>
          </div>

          <div className="landing-pricing-grid mt-10">
            {landingPlans.map((plan) => (
              <article className="pricing-plan" key={plan.name}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-slate-950">
                      {plan.name}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {plan.description}
                    </p>
                  </div>
                  <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                    India
                  </p>
                </div>

                <p className="mt-5 text-4xl font-semibold text-slate-950">
                  {plan.price}
                </p>

                <div className="mt-5 grid gap-3">
                  {plan.features.map((feature) => (
                    <div className="flex items-start gap-3" key={feature}>
                      <CheckCircle2
                        aria-hidden="true"
                        className="text-emerald-800"
                        size={18}
                      />
                      <p className="text-sm leading-6 text-slate-600">
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
