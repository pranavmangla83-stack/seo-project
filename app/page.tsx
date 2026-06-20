import {
  CheckCircle2,
  Clock,
  Link2,
  SearchCheck,
  ShieldCheck,
  Zap
} from "lucide-react";
import { ScanForm } from "@/components/scan-form";

const checks = [
  "SEO checker",
  "Improve SEO",
  "Website optimization",
  "SEO audit",
  "SEO optimization",
  "SEO optimizer",
  "SEO analyzer"
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
    <main className="home-page">
      <header className="home-topbar">
        <div className="home-topbar-inner">
          <div className="home-brand">
            <span className="home-brand-mark">
              <SearchCheck aria-hidden="true" size={18} />
            </span>
            <div>
              <p>FixMySEO</p>
              <span>Website SEO scanner</span>
            </div>
          </div>
          <div className="home-topbar-proof">
            <CheckCircle2 aria-hidden="true" size={16} />
            No login needed
          </div>
        </div>
      </header>

      <section className="home-hero-section">
        <div className="home-shell home-hero-grid">
          <div className="home-hero-copy">
            <p className="home-kicker">
              <Link2 aria-hidden="true" size={16} />
              SEO checker for quick website audits
            </p>
            <h1>
              Find SEO Issues and Improve Your Website Rankings
            </h1>
            <p className="home-hero-subtitle">
              Scan your website, identify SEO problems, and get actionable
              fixes for titles, meta descriptions, content, technical SEO, and
              on-page optimization.
            </p>

            <ScanForm />

            <div className="home-keyword-pills">
              {checks.map((check) => (
                <span
                  key={check}
                >
                  {check}
                </span>
              ))}
            </div>
          </div>

          <aside className="home-preview-card" aria-label="Example SEO report preview">
            <div className="home-preview-header">
              <span>
                <span className="report-status-dot" />
                Check complete
              </span>
              <strong>example.com</strong>
            </div>
            <div className="home-preview-score">
              <div className="report-score-ring" style={{ background: "conic-gradient(#e58a1f 68%, #eef2f7 0)" }}>
                <div>
                  <span>68</span>
                  <small>out of 100</small>
                </div>
              </div>
              <div>
                <p>Website health</p>
                <span>Needs attention</span>
              </div>
            </div>
            <div className="home-preview-fixes">
              {impactSteps.slice(0, 3).map((step, index) => (
                <div key={step}>
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="home-section">
        <div className="home-shell home-value-grid">
          <div>
            <p className="home-kicker">
              <Zap aria-hidden="true" size={16} />
              SEO optimizer for practical fixes
            </p>
            <h2>
              Stop guessing why your website isn&apos;t getting traffic.
            </h2>
            <p>
              We scan your site, identify the issues with the biggest ranking
              impact, prioritize them, and help you fix them in minutes, not
              hours. No SEO expertise required. Just follow the recommendations
              and apply fixes with a few clicks.
            </p>
          </div>

          <div className="home-steps-card">
            {impactSteps.map((step, index) => (
              <div
                className="home-step"
                key={step}
              >
                <span>
                  {index + 1}
                </span>
                <p>{step}</p>
              </div>
            ))}
            <div className="home-note">
              <Clock aria-hidden="true" size={20} />
              <p>
                Built for business owners who want clear SEO recommendations,
                not a confusing technical report.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section home-pricing-section">
        <div className="home-shell">
          <div className="home-section-heading">
            <p>
              India pricing
            </p>
            <h2>
              Start with an affordable SEO audit
            </h2>
            <span>
              Choose the level of SEO optimization help you want after your
              website scan.
            </span>
          </div>

          <div className="home-pricing-grid">
            {landingPlans.map((plan) => (
              <article className="home-plan-card" key={plan.name}>
                <div className="home-plan-top">
                  <div>
                    <h3>
                      {plan.name}
                    </h3>
                    <p>
                      {plan.description}
                    </p>
                  </div>
                  <span>
                    India
                  </span>
                </div>

                <strong>
                  {plan.price}
                </strong>

                <div className="home-plan-features">
                  {plan.features.map((feature) => (
                    <div key={feature}>
                      <ShieldCheck aria-hidden="true" size={18} />
                      <p>
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
