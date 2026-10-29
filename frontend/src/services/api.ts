import axios from 'axios'
import {
  AuditSummary,
  AuditDetail,
  AuditProgress,
  SEOIssue,
  IssueStatus,
  AIRecommendation,
  AIExecutiveSummary,
  KeywordDensityResult,
  PageSpeedResult,
  ComparisonResult,
  ScheduledAuditItem
} from '../types'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://seo-audit-ai-backend.onrender.com/api/v1'
    : 'http://127.0.0.1:8000/api/v1')

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const api = {
  // System Health
  getHealth: async () => {
    const res = await apiClient.get('/health')
    return res.data
  },

  // Audits
  startAudit: async (data: { url: string; max_pages: number; max_depth: number; follow_internal: boolean }): Promise<AuditSummary> => {
    const res = await apiClient.post<AuditSummary>('/audits', data)
    return res.data
  },

  listAudits: async (skip: number = 0, limit: number = 50): Promise<AuditSummary[]> => {
    const res = await apiClient.get<AuditSummary[]>('/audits', { params: { skip, limit } })
    return res.data
  },

  getAudit: async (id: number): Promise<AuditDetail> => {
    const res = await apiClient.get<AuditDetail>(`/audits/${id}`)
    return res.data
  },

  getAuditProgress: async (id: number): Promise<AuditProgress> => {
    const res = await apiClient.get<AuditProgress>(`/audits/${id}/progress`)
    return res.data
  },

  cancelAudit: async (id: number): Promise<{ message: string }> => {
    const res = await apiClient.post(`/audits/${id}/cancel`)
    return res.data
  },

  deleteAudit: async (id: number): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/audits/${id}`)
    return res.data
  },

  // Issues
  getIssues: async (
    auditId: number,
    params?: { severity?: string; category?: string; status?: string; search?: string }
  ): Promise<SEOIssue[]> => {
    const res = await apiClient.get<SEOIssue[]>(`/audits/${auditId}/issues`, { params })
    return res.data
  },

  updateIssueStatus: async (issueId: number, status: IssueStatus): Promise<SEOIssue> => {
    const res = await apiClient.patch<SEOIssue>(`/issues/${issueId}/status`, { status })
    return res.data
  },

  // AI
  getIssueRecommendation: async (issueId: number, customPrompt?: string): Promise<AIRecommendation> => {
    const res = await apiClient.post<AIRecommendation>('/ai/recommendation', {
      issue_id: issueId,
      custom_prompt: customPrompt,
    })
    return res.data
  },

  getExecutiveSummary: async (auditId: number): Promise<AIExecutiveSummary> => {
    const res = await apiClient.post<AIExecutiveSummary>('/ai/executive-summary', {
      audit_id: auditId,
    })
    return res.data
  },

  // Keyword Density
  getKeywordDensity: async (auditId: number): Promise<KeywordDensityResult> => {
    const res = await apiClient.get<KeywordDensityResult>(`/audits/${auditId}/keywords`)
    return res.data
  },

  // PageSpeed & Core Web Vitals
  getPageSpeed: async (url: string, strategy: 'mobile' | 'desktop' = 'mobile'): Promise<PageSpeedResult> => {
    const res = await apiClient.get<PageSpeedResult>('/pagespeed', { params: { url, strategy } })
    return res.data
  },

  // Competitor Head-to-Head Comparison
  compareCompetitors: async (urlA: string, urlB: string): Promise<ComparisonResult> => {
    const res = await apiClient.post<ComparisonResult>('/compare', { url_a: urlA, url_b: urlB })
    return res.data
  },

  // Scheduled Monitoring
  listSchedules: async (): Promise<ScheduledAuditItem[]> => {
    const res = await apiClient.get<ScheduledAuditItem[]>('/schedules')
    return res.data
  },

  createSchedule: async (data: { target_url: string; email: string; frequency: string }): Promise<ScheduledAuditItem> => {
    const res = await apiClient.post<ScheduledAuditItem>('/schedules', data)
    return res.data
  },

  deleteSchedule: async (id: number): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/schedules/${id}`)
    return res.data
  },

  // Diagnostic Tools
  checkSecurityHeaders: async (url: string) => {
    const res = await apiClient.post('/tools/security-headers', { url })
    return res.data
  },

  checkRobotsSitemap: async (url: string) => {
    const res = await apiClient.post('/tools/robots-sitemap', { url })
    return res.data
  },

  // Export URLs
  getExportCsvUrl: (auditId: number) => `${API_BASE_URL}/audits/${auditId}/export/csv`,
  getExportPdfUrl: (auditId: number) => `${API_BASE_URL}/audits/${auditId}/export/pdf`,
}
