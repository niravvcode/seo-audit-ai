import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { KeywordDensityResult, KeywordItem } from '../../types'
import { AlertTriangle, Search, Hash, Loader2, Sparkles } from 'lucide-react'

interface KeywordAnalyzerProps {
  auditId: number
}

export const KeywordAnalyzer: React.FC<KeywordAnalyzerProps> = ({ auditId }) => {
  const [data, setData] = useState<KeywordDensityResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'1-gram' | '2-gram' | '3-gram'>('1-gram')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await api.getKeywordDensity(auditId)
        setData(res)
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to analyze keywords.')
      } finally {
        setLoading(false)
      }
    }
    fetchKeywords()
  }, [auditId])

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-xl p-12 text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
        <p className="text-sm text-foreground-secondary">Computing n-gram keyword density...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-surface border border-border rounded-xl p-8 text-center text-foreground-secondary">
        <p className="text-sm">{error || 'No text content available for keyword density analysis.'}</p>
      </div>
    )
  }

  const getList = (): KeywordItem[] => {
    if (activeTab === '1-gram') return data.one_grams
    if (activeTab === '2-gram') return data.two_grams
    return data.three_grams
  }

  const filteredList = getList().filter((item) =>
    item.keyword.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-foreground">Keyword Density & N-Gram Analyzer</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              {data.total_words.toLocaleString()} total words
            </span>
          </div>
          <p className="text-sm text-foreground-secondary mt-0.5">
            Identify top repeated phrases and prevent Google keyword stuffing penalties.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-4 h-4 text-foreground-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search phrases..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface-raised border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Stuffing Alerts */}
      {data.stuffing_warnings && data.stuffing_warnings.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold">Keyword Stuffing Risk Detected</h4>
            <ul className="text-xs space-y-1 mt-1 text-amber-500/90 list-disc list-inside">
              {data.stuffing_warnings.map((w, idx) => (
                <li key={idx}>
                  <strong>"{w.keyword}"</strong> density is{' '}
                  <span className="font-semibold">{w.density_percent}%</span> ({w.warning})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab('1-gram')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === '1-gram'
              ? 'bg-primary text-white shadow-sm'
              : 'text-foreground-secondary hover:text-foreground bg-surface-raised'
          }`}
        >
          Single Words (1-Gram)
        </button>
        <button
          onClick={() => setActiveTab('2-gram')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === '2-gram'
              ? 'bg-primary text-white shadow-sm'
              : 'text-foreground-secondary hover:text-foreground bg-surface-raised'
          }`}
        >
          2-Word Phrases (Bigram)
        </button>
        <button
          onClick={() => setActiveTab('3-gram')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === '3-gram'
              ? 'bg-primary text-white shadow-sm'
              : 'text-foreground-secondary hover:text-foreground bg-surface-raised'
          }`}
        >
          3-Word Phrases (Trigram)
        </button>
      </div>

      {/* Keyword Table */}
      {filteredList.length === 0 ? (
        <p className="text-sm text-center py-8 text-foreground-secondary">
          No keywords found matching "{search}".
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
                <th className="py-2.5 px-3">Keyword / Phrase</th>
                <th className="py-2.5 px-3 text-right">Occurrences</th>
                <th className="py-2.5 px-3 w-48">Density</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredList.slice(0, 25).map((item, idx) => (
                <tr key={idx} className="hover:bg-surface-raised transition-colors">
                  <td className="py-2.5 px-3 font-medium text-foreground flex items-center gap-2">
                    <span className="text-xs font-mono text-foreground-muted w-5">#{idx + 1}</span>
                    {item.keyword}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground">
                    {item.count}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-surface-raised rounded-full h-2 overflow-hidden border border-border">
                        <div
                          className={`h-full rounded-full ${
                            item.density_percent > 3.5
                              ? 'bg-amber-500'
                              : 'bg-primary'
                          }`}
                          style={{
                            width: `${Math.min(item.density_percent * 20, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono font-semibold text-foreground-secondary w-12 text-right">
                        {item.density_percent}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
