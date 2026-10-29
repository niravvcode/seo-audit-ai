import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { ScheduledAuditItem } from '../types'
import { CalendarClock, Plus, Trash2, Mail, Globe, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'

export const ScheduledAuditsPage: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduledAuditItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [targetUrl, setTargetUrl] = useState('https://')
  const [email, setEmail] = useState('')
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY')

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      const data = await api.listSchedules()
      setSchedules(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load scheduled audits.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedules()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetUrl.trim() || !email.trim()) return

    try {
      setSubmitting(true)
      setError(null)
      await api.createSchedule({
        target_url: targetUrl.trim(),
        email: email.trim(),
        frequency,
      })
      setTargetUrl('https://')
      setEmail('')
      await fetchSchedules()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create schedule.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this monitoring schedule?')) return
    try {
      await api.deleteSchedule(id)
      setSchedules(schedules.filter((s) => s.id !== id))
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete schedule.')
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <CalendarClock className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-text">Scheduled Monitoring & Alerting</h1>
        </div>
        <p className="text-sm text-text-muted">
          Configure automated cron audits to track SEO health over time and receive proactive alerts when regressions occur.
        </p>
      </div>

      {/* Create Schedule Form */}
      <form onSubmit={handleCreate} className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-text mb-4">Add New Scheduled Audit</h3>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-danger-light border border-danger/20 text-danger text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-text mb-1.5">Target Website</label>
            <input
              type="url"
              required
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-2.5 text-sm bg-surface-muted border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1.5">
              Notification Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alerts@company.com"
              className="w-full px-4 py-2.5 text-sm bg-surface-muted border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1.5">Frequency</label>
            <select
              value={frequency}
              onChange={(e: any) => setFrequency(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-surface-muted border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="DAILY">Daily Check</option>
              <option value="WEEKLY">Weekly Summary</option>
              <option value="MONTHLY">Monthly Audit</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-primary text-text-inverse text-sm font-semibold hover:bg-primary-hover transition-all shadow-sm shadow-primary/25 disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Schedule...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Monitor
              </>
            )}
          </button>
        </div>
      </form>

      {/* Schedules List */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-text mb-4">Active Monitoring Schedules</h3>

        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
            <p className="text-sm text-text-muted">Loading recurring jobs...</p>
          </div>
        ) : schedules.length === 0 ? (
          <div className="py-12 text-center text-text-muted">
            <CalendarClock className="w-10 h-10 mx-auto text-text-subtle mb-2 opacity-50" />
            <p className="text-sm">No scheduled monitors configured yet.</p>
            <p className="text-xs text-text-subtle mt-1">
              Add your first URL above to enable continuous automated health checks.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-semibold text-text-subtle uppercase tracking-wider">
                  <th className="py-3 px-4">Target Website</th>
                  <th className="py-3 px-4">Alert Recipient</th>
                  <th className="py-3 px-4">Cadence</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {schedules.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-hover transition-colors">
                    <td className="py-3.5 px-4 font-medium text-text">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-text-subtle flex-shrink-0" />
                        <span className="truncate max-w-xs">{item.target_url}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-text-muted">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Mail className="w-3.5 h-3.5 text-text-subtle" />
                        <span>{item.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        {item.frequency}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        Active
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg text-text-subtle hover:text-danger hover:bg-danger/10 transition-colors"
                        title="Delete Schedule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
