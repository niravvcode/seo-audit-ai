import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, Play, StopCircle, ArrowRight, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react'
import { api } from '../services/api'
import { AuditProgress } from '../types'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ProgressBar } from '../components/ui/ProgressBar'

export const NewAuditPage: React.FC = () => {
  const navigate = useNavigate()

  // Form inputs
  const [url, setUrl] = useState('')
  const [maxPages, setMaxPages] = useState(10)
  const [maxDepth, setMaxDepth] = useState(2)
  const [followInternal, setFollowInternal] = useState(true)

  // Validation & Audit execution state
  const [urlError, setUrlError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeAuditId, setActiveAuditId] = useState<number | null>(null)
  const [progress, setProgress] = useState<AuditProgress | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const pollIntervalRef = useRef<any>(null)

  // Validate URL helper
  const validateUrl = (input: string): boolean => {
    setUrlError(null)
    const trimmed = input.trim()
    if (!trimmed) {
      setUrlError('Please enter a target website URL')
      return false
    }

    try {
      const formatted = trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`
      const parsed = new URL(formatted)

      // SSRF client-side pre-validation
      const host = parsed.hostname.toLowerCase()
      if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.') || host.endsWith('.local')) {
        setUrlError('Localhost and private internal network addresses are forbidden for security reasons.')
        return false
      }

      if (!host.includes('.')) {
        setUrlError('Please enter a valid top-level domain (e.g. example.com)')
        return false
      }

      return true
    } catch {
      setUrlError('Invalid URL format. Example: https://example.com')
      return false
    }
  }

  // Poll progress when an audit is active
  useEffect(() => {
    if (!activeAuditId) return

    const poll = async () => {
      try {
        const prog = await api.getAuditProgress(activeAuditId)
        setProgress(prog)

        if (prog.status === 'COMPLETED') {
          clearInterval(pollIntervalRef.current)
          setIsSubmitting(false)
        } else if (prog.status === 'FAILED' || prog.status === 'CANCELLED') {
          clearInterval(pollIntervalRef.current)
          setIsSubmitting(false)
          setErrorMessage(`Audit ended with status: ${prog.status}`)
        }
      } catch (err: any) {
        setErrorMessage('Failed to fetch audit progress')
      }
    }

    pollIntervalRef.current = setInterval(poll, 1500)
    poll() // initial call

    return () => clearInterval(pollIntervalRef.current)
  }, [activeAuditId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!validateUrl(url)) return

    let formattedUrl = url.trim()
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`
    }

    setIsSubmitting(true)
    setProgress(null)

    try {
      const result = await api.startAudit({
        url: formattedUrl,
        max_pages: Number(maxPages),
        max_depth: Number(maxDepth),
        follow_internal: followInternal,
      })

      setActiveAuditId(result.id)
    } catch (err: any) {
      setIsSubmitting(false)
      const detail = err?.response?.data?.detail || err?.message || 'Could not initiate audit.'
      setErrorMessage(detail)
    }
  }

  const handleCancel = async () => {
    if (!activeAuditId) return
    try {
      await api.cancelAudit(activeAuditId)
      setIsSubmitting(false)
      clearInterval(pollIntervalRef.current)
      setErrorMessage('Audit was cancelled.')
    } catch (err: any) {
      setErrorMessage('Failed to cancel audit.')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text">New SEO Audit</h1>
        <p className="text-sm text-text-muted">
          Configure crawl parameters to analyze technical compliance, on-page optimization, and security.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-danger-light border border-danger/30 rounded-xl flex items-start gap-3 text-danger-dark text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold mb-0.5">Audit Notification</h4>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Audit Progress Tracking Card */}
      {isSubmitting && progress && (
        <Card className="border-primary/40 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
              <h3 className="text-sm font-semibold text-text">Audit in Progress...</h3>
            </div>
            <Button variant="danger" size="sm" onClick={handleCancel} icon={<StopCircle className="w-4 h-4" />}>
              Cancel Crawl
            </Button>
          </CardHeader>
          <CardBody className="space-y-4">
            <ProgressBar
              value={progress.pages_crawled}
              max={progress.max_pages}
              label={`Crawling ${progress.pages_crawled} of ${progress.max_pages} pages`}
            />

            <div className="p-3 bg-surface-muted rounded-lg text-xs space-y-1">
              <div className="flex justify-between text-text-muted">
                <span>Current URL:</span>
                <span className="font-mono text-text truncate max-w-sm">
                  {progress.current_url || 'Initializing...'}
                </span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Status:</span>
                <span className="font-semibold text-primary">{progress.status}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Completed State Card */}
      {!isSubmitting && progress?.status === 'COMPLETED' && (
        <Card className="border-success/40 bg-success-light/30">
          <CardBody className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-success" />
              <div>
                <h3 className="text-base font-semibold text-text">Audit Successfully Completed!</h3>
                <p className="text-xs text-text-muted">
                  Analyzed {progress.pages_crawled} pages and evaluated 20 SEO rules.
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate(`/audits/${activeAuditId}`)}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              View Full Report
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Audit Configuration Form */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-text">Audit Parameters</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Target Website URL"
              placeholder="https://example.com"
              icon={<Globe className="w-4 h-4" />}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                if (urlError) validateUrl(e.target.value)
              }}
              error={urlError || undefined}
              helperText="The crawler starts from this address and follows internal hyperlinks within the same domain."
              disabled={isSubmitting}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Maximum Pages to Crawl
                </label>
                <select
                  value={maxPages}
                  onChange={(e) => setMaxPages(Number(e.target.value))}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-border bg-surface text-text px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={5}>5 pages (Quick test)</option>
                  <option value={10}>10 pages (Standard)</option>
                  <option value={25}>25 pages (Deep check)</option>
                  <option value={50}>50 pages (Maximum)</option>
                </select>
                <p className="mt-1 text-xs text-text-muted">Limits crawler duration and polite server load.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Maximum Crawl Depth
                </label>
                <select
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(Number(e.target.value))}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-border bg-surface text-text px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={1}>1 Level (Home + direct links)</option>
                  <option value={2}>2 Levels (Standard hierarchy)</option>
                  <option value={3}>3 Levels (Deep subpages)</option>
                </select>
                <p className="mt-1 text-xs text-text-muted">Hops away from the root address.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-surface-muted rounded-xl border border-border">
              <input
                id="follow-links"
                type="checkbox"
                checked={followInternal}
                onChange={(e) => setFollowInternal(e.target.checked)}
                disabled={isSubmitting}
                className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
              />
              <label htmlFor="follow-links" className="text-sm font-medium text-text cursor-pointer select-none">
                Follow internal hyperlinks automatically
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                icon={<Play className="w-4 h-4" />}
              >
                Launch SEO Audit
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
