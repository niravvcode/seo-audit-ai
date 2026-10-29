import React, { useState } from 'react'
import { api } from '../services/api'
import { SecurityHeaderAuditResult, RobotsSitemapResult } from '../types'
import {
  Wrench,
  ShieldCheck,
  FileCode2,
  Code2,
  Copy,
  Check,
  Search,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Lock,
  Layers,
  ArrowRight
} from 'lucide-react'

export const SeoToolsPage: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'security' | 'robots' | 'schema'>('security')
  const [url, setUrl] = useState('https://')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Security Headers State
  const [securityData, setSecurityData] = useState<SecurityHeaderAuditResult | null>(null)

  // Robots & Sitemap State
  const [robotsData, setRobotsData] = useState<RobotsSitemapResult | null>(null)

  // Schema Generator State
  const [schemaType, setSchemaType] = useState<'organization' | 'faq' | 'article' | 'product'>('organization')
  const [orgName, setOrgName] = useState('My Company')
  const [orgUrl, setOrgUrl] = useState('https://example.com')
  const [orgLogo, setOrgLogo] = useState('https://example.com/logo.png')
  const [faqQ1, setFaqQ1] = useState('What does your platform do?')
  const [faqA1, setFaqA1] = useState('We provide automated technical SEO audits and AI-driven remediations.')
  const [copied, setCopied] = useState(false)

  const handleSecurityCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    try {
      setLoading(true)
      setError(null)
      const data = await api.checkSecurityHeaders(url.trim())
      setSecurityData(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to inspect security headers.')
    } finally {
      setLoading(false)
    }
  }

  const handleRobotsCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    try {
      setLoading(true)
      setError(null)
      const data = await api.checkRobotsSitemap(url.trim())
      setRobotsData(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to analyze robots.txt & sitemap.')
    } finally {
      setLoading(false)
    }
  }

  // Generate Schema JSON-LD
  const generateSchemaJson = () => {
    if (schemaType === 'organization') {
      return JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: orgName,
          url: orgUrl,
          logo: orgLogo,
        },
        null,
        2
      )
    }
    if (schemaType === 'faq') {
      return JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: faqQ1,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faqA1,
              },
            },
          ],
        },
        null,
        2
      )
    }
    if (schemaType === 'article') {
      return JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'Complete Guide to Modern Technical SEO',
          author: {
            '@type': 'Person',
            name: 'SEO Specialist',
          },
          publisher: {
            '@type': 'Organization',
            name: orgName,
          },
          datePublished: '2026-10-29',
        },
        null,
        2
      )
    }
    return JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Enterprise SEO Audit Suite',
        description: 'Comprehensive automated SEO crawler and diagnostics tool.',
        brand: {
          '@type': 'Brand',
          name: orgName,
        },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'USD',
          price: '99.00',
          availability: 'https://schema.org/InStock',
        },
      },
      null,
      2
    )
  }

  const handleCopySchema = () => {
    navigator.clipboard.writeText(generateSchemaJson())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Wrench className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-text">SEO Diagnostic Toolbox</h1>
        </div>
        <p className="text-sm text-text-muted">
          Instant deep-dive tools for Security Headers, Robots.txt & Sitemap validation, and Schema.org JSON-LD generation.
        </p>
      </div>

      {/* Modern Soft Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTool('security')
            setError(null)
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTool === 'security'
              ? 'bg-primary text-text-inverse shadow-md shadow-primary/25 scale-[1.02]'
              : 'text-text-muted hover:text-text bg-surface border border-border hover:bg-surface-hover'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Security Headers & SSL
        </button>

        <button
          onClick={() => {
            setActiveTool('robots')
            setError(null)
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTool === 'robots'
              ? 'bg-primary text-text-inverse shadow-md shadow-primary/25 scale-[1.02]'
              : 'text-text-muted hover:text-text bg-surface border border-border hover:bg-surface-hover'
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          Robots.txt & Sitemap Inspector
        </button>

        <button
          onClick={() => {
            setActiveTool('schema')
            setError(null)
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTool === 'schema'
              ? 'bg-primary text-text-inverse shadow-md shadow-primary/25 scale-[1.02]'
              : 'text-text-muted hover:text-text bg-surface border border-border hover:bg-surface-hover'
          }`}
        >
          <Code2 className="w-4 h-4" />
          Schema.org JSON-LD Builder
        </button>
      </div>

      {/* Tool 1: Security Headers */}
      {activeTool === 'security' && (
        <div className="space-y-6">
          <form onSubmit={handleSecurityCheck} className="p-6 rounded-2xl bg-surface border border-border shadow-sm">
            <h3 className="text-base font-bold text-text mb-2">Inspect HTTP Security Headers & SSL</h3>
            <p className="text-xs text-text-muted mb-4">
              Google rewards secure websites. Check HSTS, Content-Security-Policy (CSP), and clickjacking protections.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-4 py-2.5 text-sm bg-surface-muted border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-primary text-text-inverse font-semibold text-sm hover:bg-primary-hover shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Analyze Headers
              </button>
            </div>
          </form>

          {error && (
            <div className="p-4 rounded-xl bg-danger-light border border-danger/20 text-danger text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {securityData && (
            <div className="space-y-6">
              {/* Overall Grade Card */}
              <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black ${
                      securityData.grade.startsWith('A')
                        ? 'bg-success-light text-success border border-success/30'
                        : securityData.grade === 'B'
                        ? 'bg-warning-light text-warning border border-warning/30'
                        : 'bg-danger-light text-danger border border-danger/30'
                    }`}
                  >
                    {securityData.grade}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      Security Posture
                    </span>
                    <h3 className="text-xl font-bold text-text">
                      Score: {securityData.score} / 100
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5 truncate max-w-md">
                      Target: {securityData.url}
                    </p>
                  </div>
                </div>

                {securityData.recommendations.length > 0 && (
                  <div className="text-xs bg-surface-muted p-3.5 rounded-xl border border-border max-w-md">
                    <span className="font-bold text-text block mb-1">Recommended Fixes:</span>
                    <ul className="list-disc list-inside space-y-1 text-text-muted">
                      {securityData.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Header Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(securityData.headers_analyzed).map(([header, details]: any) => (
                  <div key={header} className="p-4 rounded-xl bg-surface border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-text">{header}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          details.status === 'PASS'
                            ? 'bg-success-light text-success'
                            : details.status === 'WARN'
                            ? 'bg-warning-light text-warning'
                            : 'bg-danger-light text-danger'
                        }`}
                      >
                        {details.status}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mb-2 leading-relaxed">{details.description}</p>
                    {details.value && (
                      <div className="p-2 bg-surface-muted rounded-lg font-mono text-[11px] text-text-subtle truncate">
                        {details.value}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tool 2: Robots.txt & Sitemap */}
      {activeTool === 'robots' && (
        <div className="space-y-6">
          <form onSubmit={handleRobotsCheck} className="p-6 rounded-2xl bg-surface border border-border shadow-sm">
            <h3 className="text-base font-bold text-text mb-2">Robots.txt & XML Sitemap Inspector</h3>
            <p className="text-xs text-text-muted mb-4">
              Verify search crawler accessibility, inspect disallow directives, and check XML sitemap discovery.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-4 py-2.5 text-sm bg-surface-muted border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-primary text-text-inverse font-semibold text-sm hover:bg-primary-hover shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Scan Directives
              </button>
            </div>
          </form>

          {error && (
            <div className="p-4 rounded-xl bg-danger-light border border-danger/20 text-danger text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {robotsData && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm flex items-start gap-3">
                  {robotsData.has_robots ? (
                    <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-danger flex-shrink-0" />
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-text">Robots.txt Status</h4>
                    <p className="text-xs text-text-muted mt-0.5">
                      {robotsData.has_robots ? 'Found and accessible' : 'Missing or unreachable'}
                    </p>
                    <a
                      href={robotsData.robots_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-xs flex items-center gap-1 hover:underline mt-2 font-mono"
                    >
                      {robotsData.robots_url} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm flex items-start gap-3">
                  {robotsData.has_sitemap ? (
                    <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0" />
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-text">XML Sitemap Status</h4>
                    <p className="text-xs text-text-muted mt-0.5">
                      {robotsData.has_sitemap
                        ? `HTTP 200 • ${robotsData.sitemap_urls_count || 'Multiple'} URLs discovered`
                        : 'Sitemap not found at default root'}
                    </p>
                    <a
                      href={robotsData.sitemap_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-xs flex items-center gap-1 hover:underline mt-2 font-mono"
                    >
                      {robotsData.sitemap_url} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Raw Robots.txt Content */}
              {robotsData.robots_content && (
                <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-subtle mb-3">
                    Active Robots.txt Directives
                  </h4>
                  <pre className="p-4 bg-surface-muted rounded-xl border border-border text-xs font-mono text-text overflow-x-auto max-h-64">
                    {robotsData.robots_content}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tool 3: Schema.org Builder */}
      {activeTool === 'schema' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Builder Form */}
          <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm space-y-4">
            <h3 className="text-base font-bold text-text">Schema.org JSON-LD Generator</h3>
            <p className="text-xs text-text-muted">
              Select a schema type to generate Google-compliant rich snippet markup.
            </p>

            <div>
              <label className="block text-xs font-semibold text-text mb-1.5">Schema Type</label>
              <select
                value={schemaType}
                onChange={(e: any) => setSchemaType(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-surface-muted border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="organization">Organization</option>
                <option value="faq">FAQ Page</option>
                <option value="article">Article / Blog Post</option>
                <option value="product">Product</option>
              </select>
            </div>

            {schemaType === 'organization' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Company / Brand Name</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-surface-muted border border-border rounded-xl text-text focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Official Website URL</label>
                  <input
                    type="url"
                    value={orgUrl}
                    onChange={(e) => setOrgUrl(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-surface-muted border border-border rounded-xl text-text focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Logo Image URL</label>
                  <input
                    type="url"
                    value={orgLogo}
                    onChange={(e) => setOrgLogo(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-surface-muted border border-border rounded-xl text-text focus:outline-none"
                  />
                </div>
              </>
            )}

            {schemaType === 'faq' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Question #1</label>
                  <input
                    type="text"
                    value={faqQ1}
                    onChange={(e) => setFaqQ1(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-surface-muted border border-border rounded-xl text-text focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Answer #1</label>
                  <textarea
                    rows={3}
                    value={faqA1}
                    onChange={(e) => setFaqA1(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-surface-muted border border-border rounded-xl text-text focus:outline-none resize-none"
                  />
                </div>
              </>
            )}
          </div>

          {/* JSON-LD Preview & Copy */}
          <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-text-subtle">
                  Generated JSON-LD Snippet
                </span>
                <button
                  onClick={handleCopySchema}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-muted hover:bg-surface-hover border border-border text-xs font-semibold text-text transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>

              <pre className="p-4 bg-surface-muted rounded-xl border border-border font-mono text-xs text-text overflow-x-auto max-h-96">
                {`<script type="application/ld+json">\n${generateSchemaJson()}\n</script>`}
              </pre>
            </div>

            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
              <span>Embed this inside your page's &lt;head&gt; tag.</span>
              <a
                href="https://search.google.com/test/rich-results"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1 font-semibold"
              >
                Validate with Google <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
