import React, { useState } from 'react'
import { Share2, Globe, Image as ImageIcon } from 'lucide-react'

interface SocialPreviewProps {
  title?: string | null
  description?: string | null
  url: string
  imageUrl?: string | null
}

export const SocialPreview: React.FC<SocialPreviewProps> = ({
  title,
  description,
  url,
  imageUrl,
}) => {
  const [platform, setPlatform] = useState<'twitter' | 'facebook' | 'whatsapp'>('twitter')

  const domain = (() => {
    try {
      return new URL(url).hostname
    } catch {
      return url
    }
  })()

  const displayTitle = title || 'Website Open Graph Title'
  const displayDesc =
    description || 'Add an og:description or twitter:description meta tag for enhanced social sharing.'

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-text">Social Share Card Preview</h3>
          <p className="text-xs sm:text-sm text-text-muted">
            Inspect how your Open Graph & Twitter metadata appears when shared across major platforms.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-xl border border-border">
          <button
            onClick={() => setPlatform('twitter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              platform === 'twitter'
                ? 'bg-primary text-text-inverse shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Twitter / X
          </button>
          <button
            onClick={() => setPlatform('facebook')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              platform === 'facebook'
                ? 'bg-primary text-text-inverse shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Facebook / LinkedIn
          </button>
          <button
            onClick={() => setPlatform('whatsapp')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              platform === 'whatsapp'
                ? 'bg-primary text-text-inverse shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            WhatsApp
          </button>
        </div>
      </div>

      {/* Previews */}
      <div className="flex justify-center p-6 bg-surface-muted rounded-2xl border border-border">
        {platform === 'twitter' && (
          <div className="w-full max-w-lg rounded-2xl overflow-hidden border border-[#cfd9de] dark:border-[#2f3336] bg-black text-white shadow-md">
            <div className="h-52 bg-slate-800 flex items-center justify-center relative overflow-hidden">
              {imageUrl ? (
                <img src={imageUrl} alt="OG Card" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <ImageIcon className="w-8 h-8 opacity-50" />
                  <span className="text-xs">Missing og:image / twitter:image</span>
                </div>
              )}
              <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-md bg-black/75 text-[11px] text-white backdrop-blur-sm">
                {domain}
              </div>
            </div>
            <div className="p-4 bg-[#000000] border-t border-[#2f3336]">
              <p className="text-xs text-[#71767b] mb-0.5 truncate">{domain}</p>
              <h4 className="text-sm font-bold text-white line-clamp-1 mb-1">{displayTitle}</h4>
              <p className="text-xs text-[#71767b] line-clamp-2 leading-relaxed">{displayDesc}</p>
            </div>
          </div>
        )}

        {platform === 'facebook' && (
          <div className="w-full max-w-lg rounded-2xl overflow-hidden border border-border bg-[#ffffff] dark:bg-[#242526] text-text shadow-md">
            <div className="h-56 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
              {imageUrl ? (
                <img src={imageUrl} alt="OG Card" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-text-muted">
                  <ImageIcon className="w-8 h-8 opacity-50" />
                  <span className="text-xs">No og:image specified</span>
                </div>
              )}
            </div>
            <div className="p-4 bg-[#f0f2f5] dark:bg-[#3a3b3c]">
              <span className="text-[11px] font-bold text-text-subtle uppercase tracking-wider">
                {domain}
              </span>
              <h4 className="text-sm font-bold text-text line-clamp-1 mt-0.5 mb-1">
                {displayTitle}
              </h4>
              <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">{displayDesc}</p>
            </div>
          </div>
        )}

        {platform === 'whatsapp' && (
          <div className="w-full max-w-sm rounded-2xl overflow-hidden bg-[#e7ffdb] dark:bg-[#005c4b] border border-border p-3 text-text shadow-md">
            <div className="flex gap-3 bg-white dark:bg-[#025144] rounded-xl p-2.5 shadow-sm">
              <div className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
                {imageUrl ? (
                  <img src={imageUrl} alt="OG" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {displayTitle}
                </h5>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                  {displayDesc}
                </p>
                <span className="text-[10px] text-slate-400 block mt-1 truncate">{domain}</span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-2 px-1">
              <span className="text-[10px] text-emerald-800 dark:text-emerald-200 font-mono truncate max-w-[200px]">
                {url}
              </span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400">12:00 PM</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
