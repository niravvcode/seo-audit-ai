import React, { useState } from 'react'
import { api } from '../services/api'
import { ComparisonResult } from '../types'
import { Swords, Trophy, AlertTriangle, ArrowRight, Loader2, Sparkles, ShieldCheck } from 'lucide-react'

export const CompetitorComparePage: React.FC = () => {
  const [urlA, setUrlA] = useState('https://')
  const [urlB, setUrlB] = useState('https://')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ComparisonResult | null>(null)

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlA.trim() || !urlB.trim()) {
      setError('Please provide two valid URLs for comparison.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await api.compareCompetitors(urlA.trim(), urlB.trim())
      setResult(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Comparison analysis failed. Please verify the URLs.')
    } finally {
      setLoading(false)
    }
  }

  const getCleanDomain = (urlStr: string) => {
    try {
      return new URL(urlStr).hostname
    } catch {
      return urlStr
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Swords className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Competitor Head-to-Head Battle</h1>
        </div>
        <p className="text-sm text-foreground-secondary">
          Benchmark your website side-by-side against any competitor across technical SEO, content, speed, and health score.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleCompare} className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Your Website URL (Site A)
            </label>
            <input
              type="url"
              required
              value={urlA}
              onChange={(e) => setUrlA(e.target.value)}
              placeholder="https://yoursite.com"
              className="w-full px-3.5 py-2 text-sm bg-surface-raised border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Competitor URL (Site B)
            </label>
            <input
              type="url"
              required
              value={urlB}
              onChange={(e) => setUrlB(e.target.value)}
              placeholder="https://competitor.com"
              className="w-full px-3.5 py-2 text-sm bg-surface-raised border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            SSRF Protected Crawling Engine
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Both Domains...
              </>
            ) : (
              <>
                <Swords className="w-4 h-4" />
                Run Head-to-Head Audit
              </>
            )}
          </button>
        </div>
      </form>

      {/* Comparison Scorecard */}
      {result && (
        <div className="space-y-6">
          {/* Winner Banner */}
          <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 via-surface to-primary/10 border border-primary/20 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Battle Outcome
                </span>
                <h3 className="text-xl font-bold text-foreground">
                  {result.winner === 'TIE'
                    ? "It's a Technical Dead Heat!"
                    : `${getCleanDomain(result.winner)} leads by ${result.score_diff} points`}
                </h3>
              </div>
            </div>

            <div className="text-sm text-foreground-secondary max-w-md text-center md:text-right">
              {result.comparison_summary}
            </div>
          </div>

          {/* Side by Side Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Site A */}
            <div
              className={`p-6 rounded-xl bg-surface border transition-all ${
                result.winner === result.site_a.url
                  ? 'border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20'
                  : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-foreground-secondary uppercase tracking-wider">
                  Site A
                </span>
                {result.winner === result.site_a.url && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
                    <Trophy className="w-3 h-3" /> Winner
                  </span>
                )}
              </div>

              <h4 className="text-lg font-bold text-foreground truncate mb-1" title={result.site_a.url}>
                {getCleanDomain(result.site_a.url)}
              </h4>
              <p className="text-xs text-foreground-muted font-mono truncate mb-6">
                {result.site_a.url}
              </p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 rounded-lg bg-surface-raised border border-border text-center">
                  <span className="text-[10px] uppercase font-semibold text-foreground-muted block mb-1">
                    Health Score
                  </span>
                  <span className="text-2xl font-bold font-mono text-primary">
                    {result.site_a.health_score}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-surface-raised border border-border text-center">
                  <span className="text-[10px] uppercase font-semibold text-foreground-muted block mb-1">
                    Issues
                  </span>
                  <span className="text-2xl font-bold font-mono text-foreground">
                    {result.site_a.total_issues}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-surface-raised border border-border text-center">
                  <span className="text-[10px] uppercase font-semibold text-foreground-muted block mb-1">
                    Critical
                  </span>
                  <span className="text-2xl font-bold font-mono text-rose-500">
                    {result.site_a.critical_issues}
                  </span>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-foreground-secondary block mb-2">
                  Issue Category Density
                </span>
                {Object.entries(result.site_a.categories).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between text-xs py-1 border-b border-border">
                    <span className="text-foreground-secondary">{cat}</span>
                    <span className="font-mono font-semibold text-foreground">{count} issues</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Site B */}
            <div
              className={`p-6 rounded-xl bg-surface border transition-all ${
                result.winner === result.site_b.url
                  ? 'border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20'
                  : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-foreground-secondary uppercase tracking-wider">
                  Site B (Competitor)
                </span>
                {result.winner === result.site_b.url && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
                    <Trophy className="w-3 h-3" /> Winner
                  </span>
                )}
              </div>

              <h4 className="text-lg font-bold text-foreground truncate mb-1" title={result.site_b.url}>
                {getCleanDomain(result.site_b.url)}
              </h4>
              <p className="text-xs text-foreground-muted font-mono truncate mb-6">
                {result.site_b.url}
              </p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 rounded-lg bg-surface-raised border border-border text-center">
                  <span className="text-[10px] uppercase font-semibold text-foreground-muted block mb-1">
                    Health Score
                  </span>
                  <span className="text-2xl font-bold font-mono text-primary">
                    {result.site_b.health_score}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-surface-raised border border-border text-center">
                  <span className="text-[10px] uppercase font-semibold text-foreground-muted block mb-1">
                    Issues
                  </span>
                  <span className="text-2xl font-bold font-mono text-foreground">
                    {result.site_b.total_issues}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-surface-raised border border-border text-center">
                  <span className="text-[10px] uppercase font-semibold text-foreground-muted block mb-1">
                    Critical
                  </span>
                  <span className="text-2xl font-bold font-mono text-rose-500">
                    {result.site_b.critical_issues}
                  </span>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-foreground-secondary block mb-2">
                  Issue Category Density
                </span>
                {Object.entries(result.site_b.categories).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between text-xs py-1 border-b border-border">
                    <span className="text-foreground-secondary">{cat}</span>
                    <span className="font-mono font-semibold text-foreground">{count} issues</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
