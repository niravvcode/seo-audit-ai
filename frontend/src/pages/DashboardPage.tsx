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
  Cpu,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  Lock
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
    return <LoadingSpinner size="lg" label="Initializing diagnostic telemetry..." />
  }

  if (error) {
    return (
      <div className="p-6 bg-danger-light border border-danger/20 rounded-2xl text-danger-dark">
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
          <h1 className="text-2xl font-bold tracking-tight text-text">Command Center</h1>
          <p className="text-xs text-text-muted">Real-time technical and on-page diagnostic platform</p>
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
    { name: 'Critical', value: audits.reduce((acc, a) => acc + a.critical_issues_count, 0), color: '#FF5A5F' },
    { name: 'High', value: audits.reduce((acc, a) => acc + a.high_issues_count, 0), color: '#FF8F3D' },
    { name: 'Medium', value: audits.reduce((acc, a) => acc + a.medium_issues_count, 0), color: '#FFB020' },
    { name: 'Low', value: audits.reduce((acc, a) => acc + a.low_issues_count, 0), color: '#8B7CFF' },
    { name: 'Info', value: audits.reduce((acc, a) => acc + a.info_issues_count, 0), color: '#46C8D8' },
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
    <div className="space-y-10">
      {/* Roar AI Inspired Cinematic Hero Section */}
      <section className="relative rounded-3xl bg-surface-muted border border-border p-8 sm:p-12 overflow-hidden shadow-lg">
        {/* Ambient Top Glow Beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NEURAL CRAWLER & HEURISTIC ANALYSIS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Autonomous Technical SEO Intelligence.
          </h1>

          <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-2xl">
            Continuous crawling infrastructure verifying 20+ ranking rules, Google Core Web Vitals, and Gemini-synthesized code remediation patches.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/audits/new">
              <Button size="lg" icon={<Plus className="w-4 h-4 stroke-[2.5]" />}>
                Launch New Audit
              </Button>
            </Link>
            <Link to="/tools">
              <Button variant="outline" size="lg" icon={<Cpu className="w-4 h-4 text-accent" />}>
                Security & Header Tools
              </Button>
            </Link>
          </div>
        </div>

        {/* Roar AI System Processing Pipeline Diagram */}
        <div className="mt-8 pt-8 border-t border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-surface/80 border border-border space-y-1">
            <div className="text-text-subtle text-[10px] uppercase">Phase 1: Ingestion</div>
            <div className="text-text font-bold flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-primary" />
              SSRF Safe Crawler
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-surface/80 border border-border space-y-1">
            <div className="text-text-subtle text-[10px] uppercase">Phase 2: Validation</div>
            <div className="text-text font-bold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-accent" />
              20+ Heuristic Rules
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-surface/80 border border-border space-y-1">
            <div className="text-text-subtle text-[10px] uppercase">Phase 3: Telemetry</div>
            <div className="text-text font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-warning" />
              Core Web Vitals
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-surface/80 border border-border space-y-1">
            <div className="text-text-subtle text-[10px] uppercase">Phase 4: Synthesis</div>
            <div className="text-text font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-success" />
              Gemini Code Patch
            </div>
          </div>
        </div>
      </section>

      {/* Cinematic KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-surface-muted border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-text-subtle font-mono uppercase tracking-wider">
            <span>Average Health</span>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span
              className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight"
              style={{ color: getHealthScoreColor(avgHealthScore, isDark) }}
            >
              {avgHealthScore}
            </span>
            <span className="text-xs text-text-subtle font-mono">/ 100</span>
          </div>
          <div className="text-xs text-text-muted mt-1">Across all completed crawls</div>
        </div>

        <div className="p-6 rounded-2xl bg-surface-muted border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-text-subtle font-mono uppercase tracking-wider">
            <span>Pages Audited</span>
            <FileText className="w-4 h-4 text-accent" />
          </div>
          <div className="mt-4 text-3xl sm:text-4xl font-extrabold font-mono text-text tracking-tight">
            {totalPages}
          </div>
          <div className="text-xs text-text-muted mt-1">{totalAudits} domains scanned</div>
        </div>

        <div className="p-6 rounded-2xl bg-surface-muted border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-text-subtle font-mono uppercase tracking-wider">
            <span>Critical Blockers</span>
            <Flame className="w-4 h-4 text-danger" />
          </div>
          <div className="mt-4 text-3xl sm:text-4xl font-extrabold font-mono text-danger tracking-tight">
            {totalCritical}
          </div>
          <div className="text-xs text-text-muted mt-1">Immediate indexing penalties</div>
        </div>

        <div className="p-6 rounded-2xl bg-surface-muted border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-text-subtle font-mono uppercase tracking-wider">
            <span>High Severity</span>
            <AlertTriangle className="w-4 h-4 text-warning" />
          </div>
          <div className="mt-4 text-3xl sm:text-4xl font-extrabold font-mono text-warning tracking-tight">
            {totalHigh}
          </div>
          <div className="text-xs text-text-muted mt-1">Ranking & crawl deficiencies</div>
        </div>
      </section>

      {/* Visual Analytics Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Severity Radial Matrix */}
        <div className="p-6 rounded-2xl bg-surface-muted border border-border shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-subtle mb-4">
              Deficiency Distribution Matrix
            </h3>
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
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {severityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#11151B',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border text-xs font-mono">
            {severityChartData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-text-muted">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </span>
                <span className="font-bold text-text">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Health Trajectory Trends */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-surface-muted border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-subtle">
              Health Score Trajectory
            </h3>
            <span className="text-xs text-text-muted font-mono">Last 7 Audit Runs</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentAuditsTrend}>
                <XAxis
                  dataKey="name"
                  stroke="#727D8B"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#727D8B"
                  fontSize={11}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#11151B',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="score" fill="#8B7CFF" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* High-Precision Audit Log Table */}
      <section className="rounded-2xl bg-surface-muted border border-border overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-subtle">
            Recent Audit Sessions
          </h3>
          <Link to="/audits" className="text-xs text-accent hover:underline flex items-center gap-1 font-mono">
            <span>FULL ARCHIVE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-surface border-b border-border text-text-subtle uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Domain</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Health Score</th>
                <th className="py-3 px-6">Depth/Pages</th>
                <th className="py-3 px-6">Findings</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {audits.slice(0, 5).map((audit) => (
                <tr key={audit.id} className="hover:bg-surface-hover/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-text">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-text-subtle shrink-0" />
                      <span className="truncate max-w-xs">{audit.website_url}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={audit.status} />
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className="font-bold text-sm"
                      style={{ color: getHealthScoreColor(audit.health_score, isDark) }}
                    >
                      {audit.health_score.toFixed(1)} / 100
                    </span>
                  </td>
                  <td className="py-4 px-6 text-text-muted">
                    {audit.total_pages_crawled} pages
                  </td>
                  <td className="py-4 px-6 text-text">
                    <span className="font-bold">{audit.total_issues_found}</span> issues
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link to={`/audits/${audit.id}`}>
                      <Button variant="outline" size="xs">
                        Inspect Report
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
