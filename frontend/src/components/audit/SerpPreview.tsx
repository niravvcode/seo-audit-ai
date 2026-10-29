import React, { useState } from 'react'
import { Monitor, Smartphone, CheckCircle, AlertTriangle } from 'lucide-react'

interface SerpPreviewProps {
  initialTitle?: string | null
  initialDescription?: string | null
  url: string
}

export const SerpPreview: React.FC<SerpPreviewProps> = ({
  initialTitle,
  initialDescription,
  url,
}) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [title, setTitle] = useState(initialTitle || 'Website Title')
  const [description, setDescription] = useState(
    initialDescription || 'This is the meta description snippet that will appear in Google search results.'
  )

  const titleLength = title.length
  const descLength = description.length

  const titleStatus =
    titleLength >= 40 && titleLength <= 60
      ? 'good'
      : titleLength > 60
      ? 'warning'
      : 'short'

  const descStatus =
    descLength >= 120 && descLength <= 160
      ? 'good'
      : descLength > 160
      ? 'warning'
      : 'short'

  const domain = (() => {
    try {
      return new URL(url).hostname
    } catch {
      return url
    }
  })()

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-text">Google SERP Snippet Preview</h3>
          <p className="text-xs sm:text-sm text-text-muted">
            Simulate how this page appears on Google Search and test metadata revisions.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-xl border border-border">
          <button
            onClick={() => setDevice('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              device === 'desktop'
                ? 'bg-primary text-text-inverse shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" /> Desktop
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              device === 'mobile'
                ? 'bg-primary text-text-inverse shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile
          </button>
        </div>
      </div>

      {/* Interactive Mockup */}
      <div className="mb-6 p-5 rounded-2xl bg-[#ffffff] dark:bg-[#1a1b1e] border border-border transition-all shadow-inner">
        <div className={device === 'mobile' ? 'max-w-sm mx-auto' : 'max-w-2xl'}>
          {/* URL Breadcrumb */}
          <div className="flex items-center gap-2 mb-1 text-xs">
            <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-200">
              {domain.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-medium text-[#202124] dark:text-[#bdc1c6] leading-none">
                {domain}
              </span>
              <span className="text-[11px] text-[#4d5156] dark:text-[#9aa0a6] truncate max-w-md">
                {url}
              </span>
            </div>
          </div>

          {/* Title */}
          <h4 className="text-[18px] sm:text-[20px] font-normal text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-snug line-clamp-1 mb-1">
            {title || 'Missing Title'}
          </h4>

          {/* Snippet */}
          <p className="text-[13px] sm:text-[14px] text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-2">
            {description || 'Missing Meta Description tag.'}
          </p>
        </div>
      </div>

      {/* Live Editor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-text">SEO Title</label>
            <span
              className={`text-xs font-bold flex items-center gap-1 ${
                titleStatus === 'good'
                  ? 'text-success'
                  : titleStatus === 'warning'
                  ? 'text-warning'
                  : 'text-text-subtle'
              }`}
            >
              {titleStatus === 'good' ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
              {titleLength} / 60 chars
            </span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 text-sm bg-surface-muted border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="Enter SEO title..."
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-text">Meta Description</label>
            <span
              className={`text-xs font-bold flex items-center gap-1 ${
                descStatus === 'good'
                  ? 'text-success'
                  : descStatus === 'warning'
                  ? 'text-warning'
                  : 'text-text-subtle'
              }`}
            >
              {descStatus === 'good' ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
              {descLength} / 160 chars
            </span>
          </div>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 text-sm bg-surface-muted border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            placeholder="Enter meta description..."
          />
        </div>
      </div>
    </div>
  )
}
