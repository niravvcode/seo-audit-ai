export type AuditStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

export type IssueSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'

export type IssueCategory = 'ON_PAGE' | 'TECHNICAL' | 'CONTENT' | 'SECURITY' | 'PERFORMANCE'

export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'IGNORED'

export interface Website {
  id: number
  url: string
  domain: string
  created_at: string
  updated_at: string
}

export interface CrawledPage {
  id: number
  audit_id: number
  url: string
  status_code: number | null
  response_time_ms: number | null
  depth: number
  title: string | null
  meta_description: string | null
  h1_count: number
  word_count: number
  error_message: string | null
  created_at: string
}

export interface SEOIssue {
  id: number
  audit_id: number
  page_id?: number | null
  rule_id: string
  category: IssueCategory
  severity: IssueSeverity
  title: string
  affected_url: string
  evidence: string
  explanation: string
  why_it_matters: string
  suggested_fix: string
  estimated_effort: string
  status: IssueStatus
  created_at: string
  updated_at: string
}

export interface AuditSummary {
  id: number
  website_id: number
  website_url: string
  status: AuditStatus
  health_score: number
  total_pages_crawled: number
  total_issues_found: number
  critical_issues_count: number
  high_issues_count: number
  medium_issues_count: number
  low_issues_count: number
  info_issues_count: number
  max_pages: number
  max_depth: number
  follow_internal: boolean
  started_at: string
  completed_at: string | null
}

export interface AuditDetail extends AuditSummary {
  website: Website
  pages: CrawledPage[]
  issues: SEOIssue[]
}

export interface AuditProgress {
  id: number
  status: AuditStatus
  pages_crawled: number
  max_pages: number
  issues_found: number
  current_url: string | null
}

export interface AIRecommendation {
  issue_id: number
  rule_id: string
  title: string
  ai_explanation: string
  suggested_implementation: string
  code_or_tag_example?: string
  priority_level: string
  disclaimer: string
}

export interface AIExecutiveSummary {
  audit_id: number
  executive_summary: string
  key_strengths: string[]
  critical_risks: string[]
  immediate_actions: string[]
}


export interface KeywordItem {
  keyword: string
  count: number
  density_percent: number
}

export interface KeywordStuffingWarning {
  keyword: string
  density_percent: number
  warning: string
}

export interface KeywordDensityResult {
  total_words: number
  one_grams: KeywordItem[]
  two_grams: KeywordItem[]
  three_grams: KeywordItem[]
  stuffing_warnings: KeywordStuffingWarning[]
}

export interface PageSpeedMetric {
  value: string
  label: string
  status: 'good' | 'needs_improvement'
}

export interface PageSpeedResult {
  source: string
  strategy: string
  performance_score: number
  metrics: {
    lcp: PageSpeedMetric
    cls: PageSpeedMetric
    tbt: PageSpeedMetric
    fcp: PageSpeedMetric
    speed_index: PageSpeedMetric
  }
}

export interface CompetitorSide {
  url: string
  health_score: number
  total_issues: number
  critical_issues: number
  categories: Record<string, number>
}

export interface ComparisonResult {
  site_a: CompetitorSide
  site_b: CompetitorSide
  winner: string
  score_diff: number
  comparison_summary: string
}

export interface ScheduledAuditItem {
  id: number
  target_url: string
  email: string
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  is_active: boolean
  last_run_at: string | null
  created_at: string
}


export interface SecurityHeaderItem {
  present: boolean
  value: string | null
  status: 'PASS' | 'FAIL' | 'WARN'
  description: string
}

export interface SecurityHeaderAuditResult {
  url: string
  grade: string
  score: number
  headers_analyzed: Record<string, SecurityHeaderItem>
  recommendations: string[]
}

export interface RobotsSitemapResult {
  url: string
  has_robots: boolean
  robots_url: string
  robots_content: string | null
  disallow_rules: string[]
  sitemaps_declared: string[]
  has_sitemap: boolean
  sitemap_url: string
  sitemap_status: number
  sitemap_urls_count: number | null
  analysis: string
}
