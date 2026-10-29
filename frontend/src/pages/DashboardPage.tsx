import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Globe,
  FileText,
  AlertTriangle,
  Flame,
  Activity,
  ArrowRight,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { api } from '../services/api'
import { AuditSummary } from '../types'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge, StatusBadge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useTheme } from '../context/ThemeContext'
import { THEME_CONFIG, getHealthScoreColor } from '../config/theme'

export const DashboardPage: React.FC = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const chartTokens = THEME_CONFIG[theme].charts

  const [audits, setAudits] = useState<AuditSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const data = await api.listAudits()
      setAudits(data)
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" label="Loading dashboard metrics..." />
  }

  if (error) {
    return (
      <div className="p-6 bg-danger-light border border-danger/20 rounded-xl text-danger-dark">
        <h3 className="font-semibold text-base mb-1">Failed to load dashboard</h3>
        <p className="text-sm">{error}</p>
        <Button className="mt-4" size="sm" onClick={loadDashboardData}>
          Retry
        </Button>
      </div>
    )
  }

  // Aggregate metrics across actual saved audits
  const totalAudits = audits.length
  const totalPages = audits.reduce((acc, a) => acc + a.total_pages_crawled, 0)
  const totalIssues = audits.reduce((acc, a) => acc + a.total_issues_found, 0)
  const totalCritical = audits.reduce((acc, a) => acc + a.critical_issues_count, 0)
  const totalHigh = audits.reduce((acc, a) => acc + a.high_issues_count, 0)
  const completedAudits = audits.filter((a) => a.status === 'COMPLETED')
  const avgHealthScore =
    completedAudits.length > 0
      ? Math.round(
          completedAudits.reduce((acc, a) => acc + a.health_score, 0) / completedAudits.length
        )
      : 0

  if (totalAudits === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text">SEO Performance Dashboard</h1>
          <p className="text-sm text-text-muted">Real-time technical and on-page audit overview</p>
        </div>
        <EmptyState
          icon={<Globe className="w-10 h-10" />}
          title="No website audits found"
          description="You haven't run any SEO audits yet. Enter a website URL to start your first comprehensive technical audit."
          action={
            <Link to="/audits/new">
              <Button icon={<PlusCircle className="w-4 h-4" />}>Start First Audit</Button>
            </Link>
          }
        />
      </div>
    )
  }

  // Severity Distribution data for chart
  const severityChartData = [
    { name: 'Critical', value: audits.reduce((acc, a) => acc + a.critical_issues_count, 0), color: chartTokens.critical },
    { name: 'High', value: audits.reduce((acc, a) => acc + a.high_issues_count, 0), color: chartTokens.high },
    { name: 'Medium', value: audits.reduce((acc, a) => acc + a.medium_issues_count, 0), color: chartTokens.medium },
    { name: 'Low', value: audits.reduce((acc, a) => acc + a.low_issues_count, 0), color: chartTokens.low },
    { name: 'Info', value: audits.reduce((acc, a) => acc + a.info_issues_count, 0), color: chartTokens.info },
  ]

  // Recent 5 audits for trend
  const recentAuditsTrend = [...completedAudits]
    .slice(0, 7)
    .reverse()
    .map((a) => ({
      name: a.website_url.replace(/https?:\/\/(www\.)?/, '').slice(0, 15),
      score: a.health_score,
      issues: a.total_issues_found,
    }))

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary/10 via-surface to-secondary/10 border border-primary/20 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/15 text-primary border border-primary/25">
              SEO Command Center
            </span>
            <span className="text-xs text-text-muted">• {totalAudits} Active Audits</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight">
            Comprehensive SEO Health & Diagnostics
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl leading-relaxed">
            Monitor technical crawl blockers, Google Core Web Vitals, SERP previews, and competitor benchmarks in one unified workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <Link to="/audits/new" className="w-full sm:w-auto">
            <Button size="md" icon={<PlusCircle className="w-4 h-4" />}>
              Start New Audit
            </Button>
          </Link>
          <Link to="/tools" className="w-full sm:w-auto">
            <Button variant="outline" size="md">
              Diagnostic Tools
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Average SEO Health
            </span>
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span
              className="text-3xl font-black font-mono tracking-tight"
              style={{ color: getHealthScoreColor(avgHealthScore, isDark) }}
            >
              {avgHealthScore}
            </span>
            <span className="text-xs font-semibold text-text-subtle">/ 100</span>
          </div>
          <p className="mt-1 text-xs text-text-muted">Across all completed crawls</p>
        </Card>

        <Card hover className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Pages Analyzed
            </span>
            <div className="p-2.5 rounded-2xl bg-info/10 text-info">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-black font-mono text-text tracking-tight">{totalPages}</div>
          <p className="mt-1 text-xs text-text-muted">{totalAudits} websites crawled</p>
        </Card>

        <Card hover className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Critical Blockers
            </span>
            <div className="p-2.5 rounded-2xl bg-danger/10 text-danger">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-black font-mono text-danger tracking-tight">{totalCritical}</div>
          <p className="mt-1 text-xs text-text-muted">Immediate action required</p>
        </Card>

        <Card hover className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              High Priority Issues
            </span>
            <div className="p-2.5 rounded-2xl bg-warning/10 text-warning">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-black font-mono text-warning tracking-tight">{totalHigh}</div>
          <p className="mt-1 text-xs text-text-muted">Impacting rankings & CTR</p>
        </Card>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Severity Breakdown */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h3 className="text-sm font-semibold text-text">Issue Severity Distribution</h3>
          </CardHeader>
          <CardBody className="flex flex-col items-center">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {severityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      borderRadius: '0.5rem',
                      color: 'var(--color-text)',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 w-full text-xs">
              {severityChartData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-text-muted">{item.name}</span>
                  </div>
                  <span className="font-semibold text-text">{item.value}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Audit Scores History Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-sm font-semibold text-text">Recent Audit Health Scores</h3>
          </CardHeader>
          <CardBody>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recentAuditsTrend}>
                  <XAxis
                    dataKey="name"
                    stroke="var(--color-text-muted)"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="var(--color-text-muted)"
                    fontSize={11}
                    domain={[0, 100]}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      borderRadius: '0.5rem',
                      color: 'var(--color-text)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="score" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Audits Table */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-text">Recent Audits</h3>
          <Link to="/audits" className="text-xs text-primary hover:underline flex items-center gap-1">
            View All History <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted/50 border-b border-border text-xs uppercase text-text-subtle font-semibold">
              <tr>
                <th className="px-5 py-3">Website</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Health Score</th>
                <th className="px-5 py-3">Pages</th>
                <th className="px-5 py-3">Issues</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {audits.slice(0, 5).map((audit) => (
                <tr key={audit.id} className="hover:bg-surface-hover/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-text">
                    <span className="truncate max-w-[200px] block">{audit.website_url}</span>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={audit.status} size="sm" />
                  </td>
                  <td className="px-5 py-3 font-semibold">
                    <span style={{ color: getHealthScoreColor(audit.health_score, isDark) }}>
                      {audit.health_score.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-text-muted">{audit.total_pages_crawled}</td>
                  <td className="px-5 py-3">
                    <span className="text-text font-medium">{audit.total_issues_found}</span>
                    {audit.critical_issues_count > 0 && (
                      <span className="ml-1.5 text-xs text-danger font-semibold">
                        ({audit.critical_issues_count} crit)
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-text-subtle text-xs">
                    {new Date(audit.started_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link to={`/audits/${audit.id}`}>
                      <Button variant="outline" size="sm" icon={<ExternalLink className="w-3 h-3" />}>
                        Report
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
