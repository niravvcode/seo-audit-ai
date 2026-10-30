import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Globe,
  FileText,
  AlertTriangle,
  Flame,
  Activity,
  ArrowRight,
  Plus,
  ExternalLink,
  ShieldCheck,
  TrendingUp
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

  // Aggregate metrics
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
          <h1 className="text-xl font-bold tracking-tight text-text">Overview</h1>
          <p className="text-xs text-text-muted">Real-time technical and on-page audit diagnostics</p>
        </div>
        <EmptyState
          icon={<Globe className="w-10 h-10" />}
          title="No website audits found"
          description="You haven't run any SEO audits yet. Enter a website URL to start your first technical crawl."
          action={
            <Link to="/audits/new">
              <Button icon={<Plus className="w-4 h-4" />}>Start First Audit</Button>
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
    <div className="space-y-6">
      {/* Executive Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text">Overview</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Aggregated diagnostics across {totalAudits} audited websites
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/audits/new">
            <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />}>Start Audit</Button>
          </Link>
        </div>
      </div>

      {/* Stripe-Grade Metric KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>Average Health</span>
            <Activity className="w-4 h-4 text-text-subtle" />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span
              className="text-2xl font-bold font-mono tracking-tight"
              style={{ color: getHealthScoreColor(avgHealthScore, isDark) }}
            >
              {avgHealthScore}
            </span>
            <span className="text-xs text-text-subtle font-mono">/ 100</span>
          </div>
          <div className="text-[11px] text-text-muted mt-1">Across all completed crawls</div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>Pages Analyzed</span>
            <FileText className="w-4 h-4 text-text-subtle" />
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-text tracking-tight">{totalPages}</div>
          <div className="text-[11px] text-text-muted mt-1">{totalAudits} websites crawled</div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>Critical Issues</span>
            <Flame className="w-4 h-4 text-danger" />
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-danger tracking-tight">{totalCritical}</div>
          <div className="text-[11px] text-text-muted mt-1">Immediate indexing risks</div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>High Severity</span>
            <AlertTriangle className="w-4 h-4 text-warning" />
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-warning tracking-tight">{totalHigh}</div>
          <div className="text-[11px] text-text-muted mt-1">Ranking & crawl impediments</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Severity Distribution */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
              Severity Distribution
            </h3>
          </CardHeader>
          <CardBody className="flex flex-col items-center">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={3}
                  >
                    {severityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#141720' : '#ffffff',
                      borderColor: isDark ? '#1e222d' : '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-border text-xs">
              {severityChartData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-text-muted">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name}
                  </span>
                  <span className="font-mono font-medium text-text">{d.value}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Health Score Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
                Audit Health Trends
              </h3>
            </div>
            <span className="text-xs text-text-muted font-mono">Recent 7 Crawls</span>
          </CardHeader>
          <CardBody>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recentAuditsTrend}>
                  <XAxis
                    dataKey="name"
                    stroke={isDark ? '#575a65' : '#94a3b8'}
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke={isDark ? '#575a65' : '#94a3b8'}
                    fontSize={11}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#141720' : '#ffffff',
                      borderColor: isDark ? '#1e222d' : '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Audits Table */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
            Recent Website Audits
          </h3>
          <Link to="/audits" className="text-xs text-accent hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-muted/50 border-b border-border text-text-subtle uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-4">Website</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Health Score</th>
                <th className="py-2.5 px-4">Pages</th>
                <th className="py-2.5 px-4">Issues Found</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {audits.slice(0, 5).map((audit) => (
                <tr key={audit.id} className="hover:bg-surface-hover/80 transition-colors">
                  <td className="py-3 px-4 font-medium text-text">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-text-subtle shrink-0" />
                      <span className="truncate max-w-xs">{audit.website_url}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={audit.status} />
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className="font-mono font-bold"
                      style={{ color: getHealthScoreColor(audit.health_score, isDark) }}
                    >
                      {audit.health_score.toFixed(1)} / 100
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-text-muted">
                    {audit.total_pages_crawled}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-text font-medium">{audit.total_issues_found}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link to={`/audits/${audit.id}`}>
                      <Button variant="ghost" size="xs">
                        View Report
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
