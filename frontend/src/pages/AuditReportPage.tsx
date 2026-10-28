import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Download,
  FileSpreadsheet,
  FileCode,
  Sparkles,
  Search,
  Filter,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  Info,
  Clock,
  Layers,
  Shield,
  Zap,
} from 'lucide-react'
import { api } from '../services/api'
import { AuditDetail, SEOIssue, IssueStatus, AIRecommendation, AIExecutiveSummary } from '../types'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { SeverityBadge, StatusBadge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useTheme } from '../context/ThemeContext'
import { getHealthScoreColor } from '../config/theme'

export const AuditReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const auditId = Number(id)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [audit, setAudit] = useState<AuditDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtering & Sorting
  const [severityFilter, setSeverityFilter] = useState<string>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Selected Issue Modal & AI State
  const [selectedIssue, setSelectedIssue] = useState<SEOIssue | null>(null)
  const [aiRec, setAiRec] = useState<AIRecommendation | null>(null)
  const [loadingAi, setLoadingAi] = useState(false)

  // Executive Summary Modal
  const [execSummary, setExecSummary] = useState<AIExecutiveSummary | null>(null)
  const [loadingExec, setLoadingExec] = useState(false)
  const [isExecModalOpen, setIsExecModalOpen] = useState(false)

  useEffect(() => {
    loadAudit()
  }, [auditId])

  const loadAudit = async () => {
    try {
      setLoading(true)
      const data = await api.getAudit(auditId)
      setAudit(data)
    } catch (err: any) {
      setError(err?.message || 'Could not load audit report')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (issueId: number, newStatus: IssueStatus) => {
    try {
      const updated = await api.updateIssueStatus(issueId, newStatus)
      if (audit) {
        setAudit({
          ...audit,
          issues: audit.issues.map((i) => (i.id === issueId ? updated : i)),
        })
      }
      if (selectedIssue && selectedIssue.id === issueId) {
        setSelectedIssue(updated)
      }
    } catch (err: any) {
      alert('Failed to update issue status: ' + err?.message)
    }
  }

  const handleOpenAiFix = async (issue: SEOIssue) => {
    setSelectedIssue(issue)
    setAiRec(null)
    setLoadingAi(true)
    try {
      const rec = await api.getIssueRecommendation(issue.id)
      setAiRec(rec)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoadingAi(false)
    }
  }

  const handleGenerateExecSummary = async () => {
    setIsExecModalOpen(true)
    if (!execSummary) {
      setLoadingExec(true)
      try {
        const summary = await api.getExecutiveSummary(auditId)
        setExecSummary(summary)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingExec(false)
      }
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" label="Generating detailed technical report..." />
  }

  if (error || !audit) {
    return (
      <div className="p-8 text-center bg-danger-light border border-danger/20 rounded-xl text-danger-dark">
        <h3 className="text-lg font-semibold mb-2">Error Loading Audit Report</h3>
        <p className="text-sm mb-4">{error || 'Report not found'}</p>
        <Link to="/audits">
          <Button variant="outline">Back to Audits</Button>
        </Link>
      </div>
    )
  }

  // Filter issues
  const filteredIssues = audit.issues.filter((issue) => {
    if (severityFilter !== 'ALL' && issue.severity !== severityFilter) return false
    if (categoryFilter !== 'ALL' && issue.category !== categoryFilter) return false
    if (statusFilter !== 'ALL' && issue.status !== statusFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const inTitle = issue.title.toLowerCase().includes(q)
      const inUrl = issue.affected_url.toLowerCase().includes(q)
      const inEv = issue.evidence.toLowerCase().includes(q)
      if (!inTitle && !inUrl && !inEv) return false
    }
    return true
  })

  // Sort: Critical -> High -> Medium -> Low -> Info
  const severityRank: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
    INFO: 4,
  }
  filteredIssues.sort((a, b) => severityRank[a.severity] - severityRank[b.severity])

  return (
    <div className="space-y-8">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">
              SEO Audit Report #{audit.id}
            </span>
            <span className="text-text-subtle">•</span>
            <span className="text-xs text-text-subtle">
              {new Date(audit.started_at).toLocaleString()}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <span className="truncate max-w-xl">{audit.website_url}</span>
            <a
              href={audit.website_url}
              target="_blank"
              rel="noreferrer"
              className="text-text-subtle hover:text-primary transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateExecSummary}
            icon={<Sparkles className="w-4 h-4 text-secondary" />}
          >
            AI Executive Summary
          </Button>

          <a href={api.getExportCsvUrl(audit.id)} download>
            <Button variant="outline" size="sm" icon={<FileSpreadsheet className="w-4 h-4" />}>
              CSV Export
            </Button>
          </a>

          <a href={api.getExportPdfUrl(audit.id)} download>
            <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />}>
              PDF Report
            </Button>
          </a>
        </div>
      </div>

      {/* Summary Score & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Score Box */}
        <Card className="p-6 md:col-span-1 flex flex-col justify-center items-center text-center bg-surface-muted/30">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            SEO Health Score
          </span>
          <div className="flex items-baseline gap-1 my-1">
            <span
              className="text-5xl font-black tracking-tight"
              style={{ color: getHealthScoreColor(audit.health_score, isDark) }}
            >
              {audit.health_score.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-text-subtle">/ 100</span>
          </div>
          <p className="text-xs text-text-muted mt-2 max-w-[200px]">
            Weighted formula deducting for critical, technical, and on-page deficiencies.
          </p>
        </Card>

        {/* Severity Metrics */}
        <Card className="p-6 md:col-span-3 grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-3 bg-danger-light/50 border border-danger/20 rounded-xl">
            <span className="text-[11px] font-bold uppercase text-danger-dark">Critical</span>
            <div className="text-2xl font-bold text-danger mt-1">{audit.critical_issues_count}</div>
            <p className="text-[10px] text-text-muted mt-0.5">Indexing blockers</p>
          </div>

          <div className="p-3 bg-warning-light/50 border border-warning/20 rounded-xl">
            <span className="text-[11px] font-bold uppercase text-warning-dark">High</span>
            <div className="text-2xl font-bold text-warning mt-1">{audit.high_issues_count}</div>
            <p className="text-[10px] text-text-muted mt-0.5">Ranking impediments</p>
          </div>

          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 rounded-xl">
            <span className="text-[11px] font-bold uppercase text-yellow-700 dark:text-yellow-400">
              Medium
            </span>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
              {audit.medium_issues_count}
            </div>
            <p className="text-[10px] text-text-muted mt-0.5">Crawl & usability</p>
          </div>

          <div className="p-3 bg-primary-light/50 border border-primary/20 rounded-xl">
            <span className="text-[11px] font-bold uppercase text-primary-dark">Low</span>
            <div className="text-2xl font-bold text-primary mt-1">{audit.low_issues_count}</div>
            <p className="text-[10px] text-text-muted mt-0.5">Minor hygiene</p>
          </div>

          <div className="p-3 bg-info-light/50 border border-info/20 rounded-xl">
            <span className="text-[11px] font-bold uppercase text-info-dark">Info</span>
            <div className="text-2xl font-bold text-info mt-1">{audit.info_issues_count}</div>
            <p className="text-[10px] text-text-muted mt-0.5">Best practices</p>
          </div>
        </Card>
      </div>

      {/* Pages Crawled Overview Strip */}
      <div className="p-4 bg-surface border border-border rounded-xl flex flex-wrap items-center justify-between text-xs text-text-muted gap-4">
        <div className="flex items-center gap-6">
          <span>
            <b>Pages Analyzed:</b> {audit.total_pages_crawled}
          </span>
          <span>
            <b>Total Findings:</b> {audit.total_issues_found}
          </span>
          <span>
            <b>Crawl Scope:</b> Depth {audit.max_depth}, max {audit.max_pages} pages
          </span>
        </div>
        <Link to="/methodology" className="text-primary hover:underline flex items-center gap-1 font-medium">
          <Info className="w-3.5 h-3.5" /> Understand Scoring Methodology
        </Link>
      </div>

      {/* Issues Table with Filtering */}
      <Card>
        <CardHeader className="flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-text">Prioritized SEO Issues</h2>
            <span className="px-2 py-0.5 text-xs bg-surface-muted text-text-muted font-bold rounded-full">
              {filteredIssues.length}
            </span>
          </div>

          {/* Search Bar */}
          <div className="w-full sm:w-72">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-subtle" />
              <input
                type="text"
                placeholder="Search issues, URLs, evidence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </CardHeader>

        {/* Filters Toolbar */}
        <div className="p-4 border-b border-border bg-surface-muted/30 flex flex-wrap gap-3 items-center text-xs">
          <div className="flex items-center gap-1.5 text-text-muted font-semibold">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </div>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1 rounded-md border border-border bg-surface text-text font-medium"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
            <option value="INFO">Info</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1 rounded-md border border-border bg-surface text-text font-medium"
          >
            <option value="ALL">All Categories</option>
            <option value="ON_PAGE">On-Page SEO</option>
            <option value="TECHNICAL">Technical SEO</option>
            <option value="CONTENT">Content & Hierarchy</option>
            <option value="SECURITY">Security</option>
            <option value="PERFORMANCE">Performance</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 rounded-md border border-border bg-surface text-text font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="IGNORED">Ignored</option>
          </select>

          {(severityFilter !== 'ALL' || categoryFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSeverityFilter('ALL')
                setCategoryFilter('ALL')
                setStatusFilter('ALL')
                setSearchQuery('')
              }}
              className="text-primary hover:underline ml-auto font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Table of issues */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted/40 border-b border-border text-[11px] uppercase tracking-wider text-text-subtle font-semibold">
              <tr>
                <th className="px-5 py-3">Severity</th>
                <th className="px-5 py-3">Issue Title</th>
                <th className="px-5 py-3">Affected URL</th>
                <th className="px-5 py-3">Effort</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-text-muted">
                    No issues match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-surface-hover/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <SeverityBadge severity={issue.severity} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 font-medium text-text">
                      <div>{issue.title}</div>
                      <div className="text-[11px] text-text-muted mt-0.5 line-clamp-1">{issue.evidence}</div>
                    </td>
                    <td className="px-5 py-3.5 text-text-muted font-mono max-w-[220px] truncate">
                      {issue.affected_url}
                    </td>
                    <td className="px-5 py-3.5 text-text-muted whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-text-subtle" />
                        {issue.estimated_effort}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={issue.status}
                        onChange={(e) => handleStatusChange(issue.id, e.target.value as IssueStatus)}
                        className="text-xs bg-surface border border-border rounded px-2 py-1 font-medium focus:ring-1 focus:ring-primary"
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="IGNORED">Ignored</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAiFix(issue)}
                        icon={<Sparkles className="w-3 h-3 text-primary" />}
                      >
                        Details & AI Fix
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Issue Details & AI Fix Modal */}
      <Modal
        isOpen={Boolean(selectedIssue)}
        onClose={() => setSelectedIssue(null)}
        title={selectedIssue?.title}
        size="lg"
      >
        {selectedIssue && (
          <div className="space-y-6 text-sm">
            {/* Meta header */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-surface-muted rounded-xl border border-border text-xs">
              <div className="flex items-center gap-2">
                <SeverityBadge severity={selectedIssue.severity} />
                <span className="text-text-subtle">•</span>
                <span className="font-semibold text-text uppercase">{selectedIssue.category}</span>
                <span className="text-text-subtle">•</span>
                <span>Rule: <code className="text-primary font-mono">{selectedIssue.rule_id}</code></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-muted">Effort: <b>{selectedIssue.estimated_effort}</b></span>
              </div>
            </div>

            {/* Affected URL */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-subtle mb-1">
                Affected Target URL
              </h4>
              <p className="font-mono text-xs bg-surface-muted p-2 rounded-lg border border-border break-all">
                {selectedIssue.affected_url}
              </p>
            </div>

            {/* Exact Evidence */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-subtle mb-1">
                Exact Crawler Evidence
              </h4>
              <p className="p-3 bg-surface-muted font-mono text-xs rounded-lg border border-border text-text">
                {selectedIssue.evidence}
              </p>
            </div>

            {/* Why it matters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-subtle mb-1">
                  Explanation
                </h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  {selectedIssue.explanation}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-subtle mb-1">
                  Why It Matters For SEO
                </h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  {selectedIssue.why_it_matters}
                </p>
              </div>
            </div>

            {/* Standard Suggested Fix */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-subtle mb-1">
                Recommended Remediation
              </h4>
              <p className="p-3 bg-primary-light/40 border border-primary/20 rounded-lg text-xs text-text">
                {selectedIssue.suggested_fix}
              </p>
            </div>

            {/* AI-Assisted Recommendation Card */}
            <div className="p-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-surface border border-secondary/30 rounded-xl space-y-3">
              <div className="flex items-center gap-2 font-semibold text-text text-sm">
                <Sparkles className="w-4 h-4 text-secondary" />
                <span>AI Developer Recommendations & Code Fix</span>
              </div>

              {loadingAi ? (
                <LoadingSpinner size="sm" label="Generating AI code recommendations..." />
              ) : aiRec ? (
                <div className="space-y-3 text-xs">
                  <p className="text-text-muted leading-relaxed">{aiRec.ai_explanation}</p>
                  {aiRec.code_or_tag_example && (
                    <div>
                      <span className="font-mono text-[11px] text-text-subtle block mb-1">
                        Sample Code / Tag Implementation:
                      </span>
                      <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto">
                        <code>{aiRec.code_or_tag_example}</code>
                      </pre>
                    </div>
                  )}
                  <p className="text-[11px] text-text-subtle italic">{aiRec.disclaimer}</p>
                </div>
              ) : (
                <p className="text-xs text-text-muted">Failed to load AI recommendations.</p>
              )}
            </div>

            {/* Status change actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-text-muted font-medium">Update Status:</span>
                <select
                  value={selectedIssue.status}
                  onChange={(e) => handleStatusChange(selectedIssue.id, e.target.value as IssueStatus)}
                  className="px-2.5 py-1 text-xs border border-border bg-surface text-text rounded-md font-medium"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="IGNORED">Ignored</option>
                </select>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedIssue(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Executive Summary Modal */}
      <Modal
        isOpen={isExecModalOpen}
        onClose={() => setIsExecModalOpen(false)}
        title="Executive SEO Audit Summary"
        size="md"
      >
        {loadingExec ? (
          <LoadingSpinner size="md" label="Synthesizing executive brief..." />
        ) : execSummary ? (
          <div className="space-y-5 text-sm">
            <p className="text-xs text-text-muted leading-relaxed p-4 bg-surface-muted rounded-xl border border-border">
              {execSummary.executive_summary}
            </p>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-success-dark mb-2">
                Key Strengths
              </h4>
              <ul className="space-y-1.5 text-xs text-text">
                {execSummary.key_strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-danger-dark mb-2">
                Critical Risks
              </h4>
              <ul className="space-y-1.5 text-xs text-text">
                {execSummary.critical_risks.map((r, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-danger shrink-0 mt-1.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                Immediate Action Plan
              </h4>
              <ul className="space-y-1.5 text-xs text-text">
                {execSummary.immediate_actions.map((a, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-primary">{idx + 1}.</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <Button size="sm" onClick={() => setIsExecModalOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
