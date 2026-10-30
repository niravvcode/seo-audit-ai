import React from 'react'
import { Link } from 'react-router-dom'
import { Sun, Moon, Search, Plus, Terminal } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="h-14 border-b border-border bg-surface/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          {/* Linear-style Monogram Icon */}
          <div className="w-7 h-7 rounded-lg bg-text text-text-inverse flex items-center justify-center font-black text-xs shadow-sm group-hover:scale-105 transition-transform">
            S
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-text">SEO Audit</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-surface-muted border border-border text-text-muted">
              v2.4
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Engine status indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-surface text-xs font-mono text-text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-[11px]">engine.live</span>
        </div>

        {/* Quick Audit CTA */}
        <Link
          to="/audits/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-text-inverse text-xs font-semibold hover:bg-primary-hover shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Audit</span>
        </Link>

        {/* Theme Mode Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme mode"
          className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-surface-hover border border-border transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-warning" />
          ) : (
            <Moon className="w-4 h-4 text-text-muted" />
          )}
        </button>
      </div>
    </header>
  )
}
