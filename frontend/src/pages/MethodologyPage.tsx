import React from 'react'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import { ShieldCheck, CheckCircle2, AlertTriangle, Layers, Cpu, Code2 } from 'lucide-react'

export const MethodologyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text">SEO Audit Engine Methodology</h1>
        <p className="text-sm text-text-muted">
          Transparent, deterministic technical rules and scoring framework powering SEO Audit AI.
        </p>
      </div>

      {/* Health Scoring Formula */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold text-text">Scoring Algorithm & Weights</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-4 text-xs text-text-muted leading-relaxed">
          <p>
            The overall <b>SEO Health Score</b> starts at 100 points. Identified defects apply weighted point
            deductions calibrated to search engine visibility risks:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 bg-danger-light/60 border border-danger/30 rounded-xl">
              <span className="font-bold text-danger text-sm block">Critical: -15.0 pts</span>
              <span className="text-[11px] text-text-muted">Missing title, 4xx/5xx crawl errors, dead roots</span>
            </div>
            <div className="p-3 bg-warning-light/60 border border-warning/30 rounded-xl">
              <span className="font-bold text-warning-dark text-sm block">High: -8.0 pts</span>
              <span className="text-[11px] text-text-muted">Missing meta desc, missing H1, HTTP insecure, duplicate titles</span>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-300 dark:border-yellow-800/40 rounded-xl">
              <span className="font-bold text-yellow-700 dark:text-yellow-400 text-sm block">Medium: -4.0 pts</span>
              <span className="text-[11px] text-text-muted">Missing alt tags, missing canonical, slow response time</span>
            </div>
            <div className="p-3 bg-primary-light/60 border border-primary/30 rounded-xl">
              <span className="font-bold text-primary-dark text-sm block">Low: -1.5 pts</span>
              <span className="text-[11px] text-text-muted">Missing html lang, skipped heading level, title too long</span>
            </div>
          </div>

          <p className="text-text-subtle italic">
            * Note: To prevent a single issue area from skewing the audit disproportionately, deductions are capped by
            category (Technical: 40 pts, Security: 35 pts, On-Page: 35 pts, Content: 25 pts, Performance: 20 pts)
            and normalized across crawled pages.
          </p>
        </CardBody>
      </Card>

      {/* Implemented SEO Checks */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-secondary" />
            <h2 className="text-base font-semibold text-text">The 20 Deterministic SEO Checks</h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {[
              { id: '1', title: 'Missing Page Title', desc: 'Identifies pages missing the crucial <title> element.' },
              { id: '2', title: 'Title Length (10-65 chars)', desc: 'Flags truncated or overly short titles.' },
              { id: '3', title: 'Duplicate Title Tags', desc: 'Cross-page check finding identical titles.' },
              { id: '4', title: 'Missing Meta Description', desc: 'Checks for missing description meta tags.' },
              { id: '5', title: 'Meta Description Length (50-165 chars)', desc: 'Prevents snippet truncation in SERPs.' },
              { id: '6', title: 'Missing H1 Heading', desc: 'Detects pages lacking an overarching theme heading.' },
              { id: '7', title: 'Multiple H1 Headings', desc: 'Review recommendation for heading outline clarity.' },
              { id: '8', title: 'Heading Hierarchy Progression', desc: 'Checks sequential order (e.g. H1 -> H2 without jumping to H4).' },
              { id: '9', title: 'Broken Internal Links', desc: 'Detects internal links pointing to 4xx/5xx dead ends.' },
              { id: '10', title: 'HTTP Error Responses', desc: 'Flags crawlable pages returning 404, 500, or 503.' },
              { id: '11', title: 'Missing Image Alt Attributes', desc: 'Checks accessibility & Google Images indexing tags.' },
              { id: '12', title: 'Canonical Tag Validation', desc: 'Validates presence and absolute HTTPS destination.' },
              { id: '13', title: 'Redirect Chains & Loops', desc: 'Identifies hops wasting crawl budget (> 1 hop).' },
              { id: '14', title: 'Sitemap Accessibility (/sitemap.xml)', desc: 'Verifies standard discovery sitemap availability.' },
              { id: '15', title: 'Robots.txt Directives (/robots.txt)', desc: 'Checks crawler governance and user-agent rules.' },
              { id: '16', title: 'HTTP vs. HTTPS Protocol', desc: 'Checks SSL encryption and modern security signals.' },
              { id: '17', title: 'Mixed Active/Passive Content', desc: 'Flags unencrypted HTTP assets on HTTPS pages.' },
              { id: '18', title: 'Duplicate Page Content Hashing', desc: 'Detects near-verbatim duplicate page bodies.' },
              { id: '19', title: 'Missing HTML lang Declaration', desc: 'Ensures screen-reader and multilingual accessibility.' },
              { id: '20', title: 'Response Time Observations', desc: 'Identifies latency bottlenecks (>1.5s warning, >3s critical).' },
            ].map((check) => (
              <div key={check.id} className="p-3 bg-surface-muted rounded-lg border border-border">
                <span className="font-semibold text-text block mb-0.5">
                  {check.id}. {check.title}
                </span>
                <span className="text-text-muted text-[11px]">{check.desc}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Security Guarantees */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-success" />
            <h2 className="text-base font-semibold text-text">SSRF Security Architecture</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-3 text-xs text-text-muted leading-relaxed">
          <p>
            To prevent Server-Side Request Forgery (SSRF), all crawl targets and redirect chains are strictly filtered:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-text">
            <li>Forbidden Schemes: Only standard <code>http://</code> and <code>https://</code> are accepted.</li>
            <li>DNS Pre-flight Validation: Resolves hostnames and verifies every IP address.</li>
            <li>Prohibited Subnets: Private subnets (RFC 1918), loopback (127.0.0.0/8, ::1), carrier-grade NAT, and cloud metadata (169.254.169.254) are rejected immediately.</li>
            <li>Redirect Re-validation: Every hop in a redirect sequence is validated before the crawler proceeds.</li>
          </ul>
        </CardBody>
      </Card>
    </div>
  )
}
