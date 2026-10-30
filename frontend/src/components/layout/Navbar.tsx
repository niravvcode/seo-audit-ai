import React from 'react'
import { Link } from 'react-router-dom'
import { Sun, Moon, Search, Sparkles, Plus, Zap, ShieldCheck } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="h-16 border-b border-border/80 bg-surface/70 backdrop-blur-2xl sticky top-0 z-40 px-6 flex items-center justify-between transition-colors shadow-sm">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-3.5 font-bold text-lg text-text group">
          {/* 2026 Holographic Glowing Icon */}
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl blur-sm opacity-50 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary via-secondary to-accent text-text-inverse flex items-center justify-center shadow-md">
              <Search className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="font-black tracking-tight text-base sm:text-lg">SEO Audit</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-primary/15 to-secondary/15 text-primary border border-primary/25 shadow-sm">
                2026 NextGen
              </span>
            </div>
            <span className="text-[11px] text-text-muted font-normal tracking-wide hidden sm:inline-block">
              Autonomous Technical & On-Page Intelligence
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Launch CTA */}
        <Link
          to="/audits/new"
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-text-inverse text-xs font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95 shimmer-btn"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Audit</span>
        </Link>

        {/* Live Pulse Engine Status */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-surface/60 backdrop-blur-md rounded-full border border-border/80 text-xs text-text-muted shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          <span className="font-semibold text-text">Engine Online</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme mode"
          className="p-2.5 text-text-muted hover:text-text rounded-xl bg-surface/80 hover:bg-surface-hover border border-border/80 transition-all shadow-sm active:scale-90"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-warning transition-transform hover:rotate-90 duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-secondary transition-transform hover:-rotate-45 duration-300" />
          )}
        </button>
      </div>
    </header>
  )
}
