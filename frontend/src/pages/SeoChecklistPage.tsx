import React, { useState, useEffect } from 'react'
import {
  CheckSquare,
  CheckCircle2,
  Circle,
  RotateCcw,
  Sparkles,
  Layers,
  Zap,
  Share2,
  FileSearch
} from 'lucide-react'

interface ChecklistItem {
  id: string
  title: string
  description: string
  category: 'indexing' | 'onpage' | 'performance' | 'social'
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // 1. Indexing & Architecture
  {
    id: 'idx-1',
    category: 'indexing',
    title: 'Robots.txt is active and not blocking search crawlers',
    description: 'Ensure User-agent: * does not have a global Disallow: / directive blocking indexing.',
  },
  {
    id: 'idx-2',
    category: 'indexing',
    title: 'XML Sitemap is submitted and declared',
    description: 'Provide an updated sitemap.xml in robots.txt and submit it to Google Search Console.',
  },
  {
    id: 'idx-3',
    category: 'indexing',
    title: 'Self-referential Canonical tags implemented',
    description: 'Every indexable page must contain a <link rel="canonical" href="..."> to prevent duplicate content.',
  },
  {
    id: 'idx-4',
    category: 'indexing',
    title: 'HTTPS enforced with 301 redirects and HSTS',
    description: 'Redirect all insecure http:// requests to https:// and enable Strict-Transport-Security.',
  },
  {
    id: 'idx-5',
    category: 'indexing',
    title: 'Custom 404 error page returns HTTP 404 status',
    description: 'Prevent soft-404s by returning genuine 404 header status on non-existent routes.',
  },

  // 2. On-Page & Architecture
  {
    id: 'onp-1',
    category: 'onpage',
    title: 'Exactly one descriptive <h1> heading per page',
    description: 'Ensure the main page topic is encapsulated in a single <h1> tag at the top of the content.',
  },
  {
    id: 'onp-2',
    category: 'onpage',
    title: 'SEO Title tag between 50 and 60 characters',
    description: 'Avoid truncation in Google SERPs by keeping titles under 60 characters with primary keywords first.',
  },
  {
    id: 'onp-3',
    category: 'onpage',
    title: 'Meta description between 120 and 160 characters',
    description: 'Write engaging copy that entices searchers to click without exceeding 160 characters.',
  },
  {
    id: 'onp-4',
    category: 'onpage',
    title: 'Every informative image has descriptive Alt text',
    description: 'Search engines rely on alt attributes for image context and accessibility.',
  },
  {
    id: 'onp-5',
    category: 'onpage',
    title: 'Logical H1 -> H2 -> H3 heading hierarchy',
    description: 'Do not skip heading levels (e.g. going directly from H1 to H3) for semantic clarity.',
  },

  // 3. Performance & Speed
  {
    id: 'prf-1',
    category: 'performance',
    title: 'LCP (Largest Contentful Paint) under 2.5 seconds',
    description: 'Optimize hero banners, preload critical fonts, and leverage CDN caching.',
  },
  {
    id: 'prf-2',
    category: 'performance',
    title: 'CLS (Cumulative Layout Shift) under 0.1',
    description: 'Always specify explicit width and height on images, videos, and iframe embeds.',
  },
  {
    id: 'prf-3',
    category: 'performance',
    title: 'Modern image formats used (WebP or AVIF)',
    description: 'Serve compressed modern image formats instead of heavy uncompressed PNGs or JPEGs.',
  },
  {
    id: 'prf-4',
    category: 'performance',
    title: 'Font display swap enabled for web fonts',
    description: 'Prevent invisible text flashes by specifying font-display: swap in CSS @font-face.',
  },

  // 4. Social & Structured Data
  {
    id: 'soc-1',
    category: 'social',
    title: 'Open Graph meta tags (og:title, og:description, og:image)',
    description: 'Ensures rich previews appear on LinkedIn, Facebook, and WhatsApp.',
  },
  {
    id: 'soc-2',
    category: 'social',
    title: 'Twitter Card markup (twitter:card summary_large_image)',
    description: 'Configures visual cards for X / Twitter link previews with high-res images.',
  },
  {
    id: 'soc-3',
    category: 'social',
    title: 'Valid Schema.org JSON-LD structured data',
    description: 'Include Organization, FAQ, or Article schemas to earn rich snippet stars in search results.',
  },
]

export const SeoChecklistPage: React.FC = () => {
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('seo_checklist_state')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('seo_checklist_state', JSON.stringify(completed))
    } catch (e) {
      console.error(e)
    }
  }, [completed])

  const toggleItem = (id: string) => {
    setCompleted((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleReset = () => {
    if (window.confirm('Reset all checklist progress?')) {
      setCompleted({})
    }
  }

  const totalItems = CHECKLIST_ITEMS.length
  const completedCount = Object.values(completed).filter(Boolean).length
  const percentComplete = Math.round((completedCount / totalItems) * 100)

  const categories = [
    { key: 'indexing', title: 'Indexing & Architecture', icon: <FileSearch className="w-4 h-4 text-primary" /> },
    { key: 'onpage', title: 'On-Page SEO & Content', icon: <Layers className="w-4 h-4 text-secondary" /> },
    { key: 'performance', title: 'Speed & Core Web Vitals', icon: <Zap className="w-4 h-4 text-amber-500" /> },
    { key: 'social', title: 'Social Cards & Structured Data', icon: <Share2 className="w-4 h-4 text-emerald-500" /> },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CheckSquare className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-text">SEO Master Audit Checklist</h1>
          </div>
          <p className="text-sm text-text-muted">
            Track your site's readiness across indexing, metadata, performance, and structured data standards.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset All
        </button>
      </div>

      {/* Progress Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-surface to-secondary/10 border border-primary/20 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Launch Readiness Progress
          </span>
          <h3 className="text-2xl font-black text-text mt-0.5">
            {percentComplete}% Completed
          </h3>
          <p className="text-xs text-text-muted mt-1">
            {completedCount} of {totalItems} critical technical SEO checkpoints verified.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <div className="h-3 bg-surface-muted rounded-full overflow-hidden border border-border">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 rounded-full"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const items = CHECKLIST_ITEMS.filter((i) => i.category === cat.key)
          const catDone = items.filter((i) => completed[i.id]).length

          return (
            <div key={cat.key} className="p-6 rounded-2xl bg-surface border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-surface-muted border border-border">
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-text">{cat.title}</h3>
                    <span className="text-xs text-text-muted">
                      {catDone} / {items.length} completed
                    </span>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-border">
                {items.map((item) => {
                  const isChecked = Boolean(completed[item.id])
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className="py-3.5 flex items-start gap-3 cursor-pointer group transition-colors hover:bg-surface-hover/50 rounded-xl px-2"
                    >
                      <button
                        type="button"
                        aria-label="Toggle task"
                        className="mt-0.5 flex-shrink-0 text-text-subtle group-hover:text-primary transition-colors"
                      >
                        {isChecked ? (
                          <CheckCircle2 className="w-5 h-5 text-primary fill-primary/10" />
                        ) : (
                          <Circle className="w-5 h-5 text-text-subtle" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`text-sm font-semibold transition-all ${
                            isChecked
                              ? 'line-through text-text-subtle'
                              : 'text-text group-hover:text-primary'
                          }`}
                        >
                          {item.title}
                        </h4>
                        <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
