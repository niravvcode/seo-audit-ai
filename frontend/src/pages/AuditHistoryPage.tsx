import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { History, Search, Trash2, ExternalLink, PlusCircle } from 'lucide-react'
import { api } from '../services/api'
import { AuditSummary } from '../types'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { StatusBadge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useTheme } from '../context/ThemeContext'
import { getHealthScoreColor } from '../config/theme'

export const AuditHistoryPage: React.FC = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [audits, setAudits] = useState<AuditSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchAudits()
  }, [])

  const fetchAudits = async () => {
    try {
      setLoading(true)
      const data = await api.listAudits()
      setAudits(data)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm(`Are you sure you want to delete audit #${id}?`)) return
    try {
      await api.deleteAudit(id)
      setAudits((prev) => prev.filter((a) => a.id !== id))
    } catch (err: any) {
      alert('Failed to delete audit: ' + err?.message)
    }
  }

  const filtered = audits.filter((a) =>
    a.website_url.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return <LoadingSpinner size="lg" label="Loading historical audits..." />
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Audit History</h1>
          <p className="text-sm text-text-muted">
            Track and review all previous crawl diagnostics and reports.
          </p>
        </div>
        <Link to="/audits/new">
          <Button icon={<PlusCircle className="w-4 h-4" />}>New Audit</Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-text">Saved Audits</h2>
            <span className="text-xs bg-surface-muted text-text-muted px-2 py-0.5 rounded-full font-bold">
              {audits.length}
            </span>
          </div>

          <div className="w-full sm:w-64">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-subtle" />
              <input
                type="text"
                placeholder="Filter by website URL..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </CardHeader>

        {audits.length === 0 ? (
          <EmptyState
            icon={<History className="w-8 h-8" />}
            title="No audit history"
            description="Your audit history is empty. Launch your first website crawl to start tracking performance."
            action={
              <Link to="/audits/new">
                <Button size="sm">Launch Audit</Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted/50 border-b border-border text-xs uppercase text-text-subtle font-semibold">
                <tr>
                  <th className="px-5 py-3">Website</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Health Score</th>
                  <th className="px-5 py-3">Pages</th>
                  <th className="px-5 py-3">Issues</th>
                  <th className="px-5 py-3">Crawled Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {filtered.map((audit) => (
                  <tr key={audit.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-text">
                      <span className="truncate max-w-xs block">{audit.website_url}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={audit.status} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 font-bold">
                      <span style={{ color: getHealthScoreColor(audit.health_score, isDark) }}>
                        {audit.health_score.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-text-muted">{audit.total_pages_crawled}</td>
                    <td className="px-5 py-3.5 text-text">
                      <span>{audit.total_issues_found}</span>
                      {audit.critical_issues_count > 0 && (
                        <span className="text-danger ml-1 font-semibold">
                          ({audit.critical_issues_count} crit)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-text-subtle">
                      {new Date(audit.started_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/audits/${audit.id}`}>
                          <Button variant="outline" size="sm" icon={<ExternalLink className="w-3 h-3" />}>
                            Report
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(audit.id)}
                          className="text-danger hover:bg-danger-light"
                          aria-label="Delete audit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
