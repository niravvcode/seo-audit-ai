import React from 'react'
import { Link } from 'react-router-dom'
import { Sun, Moon, Cpu, Plus, Sparkles, Activity } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="h-16 border-b border-border bg-surface/85 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-3 group">
          {/* Roar AI Geometric Emblem */}
          <div className="relative w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center group-hover:border-primary/60 transition-colors shadow-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Cpu className="w-4 h-4 text-primary relative z-10" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-bold text-base tracking-tight text-text">
              SEO AUDIT <span className="text-primary font-black">AI</span>
            </span>
            <span className="text-[10px] font-mono tracking-wider text-text-subtle uppercase px-1.5 py-0.5 rounded border border-border bg-surface-muted hidden sm:inline-block">
              ENGINE v2.6
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* Real-time Telemetry Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface-muted/60 text-xs font-mono text-text-muted">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="text-[11px] text-text-muted">NEURAL WORKER: ACTIVE</span>
        </div>

        {/* Start New Audit CTA */}
        <Link
          to="/audits/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-text-inverse text-xs font-semibold hover:bg-primary-hover shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Audit</span>
        </Link>

        {/* Theme Mode Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme mode"
          className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-surface-hover border border-border transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-warning" />
          ) : (
            <Moon className="w-4 h-4 text-primary" />
          )}
        </button>
      </div>
    </header>
  )
}
