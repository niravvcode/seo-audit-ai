import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { PageSpeedResult } from '../../types'
import { Gauge, Smartphone, Monitor, CheckCircle, AlertTriangle, RefreshCw, Zap } from 'lucide-react'

interface CoreWebVitalsProps {
  url: string
}

export const CoreWebVitals: React.FC<CoreWebVitalsProps> = ({ url }) => {
  const [strategy, setStrategy] = useState<'mobile' | 'desktop'>('mobile')
  const [data, setData] = useState<PageSpeedResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVitals = async (selectedStrategy: 'mobile' | 'desktop') => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.getPageSpeed(url, selectedStrategy)
      setData(res)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to retrieve Core Web Vitals.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVitals(strategy)
  }, [url, strategy])

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10'
    if (score >= 50) return 'text-amber-500 border-amber-500/20 bg-amber-500/10'
    return 'text-rose-500 border-rose-500/20 bg-rose-500/10'
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-foreground">Google Core Web Vitals & Speed Lab</h3>
          </div>
          <p className="text-sm text-foreground-secondary mt-0.5">
            Real performance telemetry measuring loading speed, interactivity, and visual stability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-surface-raised p-1 rounded-lg border border-border">
            <button
              onClick={() => setStrategy('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                strategy === 'mobile'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Mobile
            </button>
            <button
              onClick={() => setStrategy('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                strategy === 'desktop'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" /> Desktop
            </button>
          </div>
          <button
            onClick={() => fetchVitals(strategy)}
            disabled={loading}
            className="p-2 rounded-lg bg-surface-raised border border-border text-foreground-secondary hover:text-foreground transition-colors disabled:opacity-50"
            title="Refresh Performance"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm text-foreground-secondary">
            Running Lighthouse simulation for {strategy} viewport...
          </p>
        </div>
      ) : error || !data ? (
        <div className="py-8 text-center text-foreground-secondary">
          <p className="text-sm">{error || 'Unable to retrieve speed metrics.'}</p>
        </div>
      ) : (
        <div>
          {/* Performance Score Card */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-5 mb-6 rounded-xl bg-surface-raised border border-border gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold text-2xl ${getScoreColor(
                  data.performance_score
                )}`}
              >
                {data.performance_score}
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground">
                  Lighthouse Performance Score
                </h4>
                <p className="text-xs text-foreground-secondary mt-0.5">
                  Source: {data.source} ({strategy.toUpperCase()})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Good (90-100)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Needs Imp. (50-89)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Poor (0-49)</span>
              </div>
            </div>
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {Object.entries(data.metrics).map(([key, metric]) => {
              const isGood = metric.status === 'good'
              return (
                <div
                  key={key}
                  className="p-4 rounded-xl bg-surface-raised border border-border flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-foreground-secondary uppercase tracking-wider">
                        {key.toUpperCase()}
                      </span>
                      {isGood ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </div>
                    <div className="text-xl font-bold font-mono text-foreground mb-1">
                      {metric.value}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-foreground-muted line-clamp-2 mb-2">
                      {metric.label}
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isGood
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      {isGood ? 'Good' : 'Needs Work'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
