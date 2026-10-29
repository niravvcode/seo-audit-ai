import React from 'react'
import { Link } from 'react-router-dom'
import { Sun, Moon, Search, Sparkles, Plus, Zap, ShieldCheck } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="h-16 border-b border-border bg-surface/85 backdrop-blur-xl sticky top-0 z-30 px-6 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-3 font-bold text-lg text-text group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary via-secondary to-accent text-text-inverse flex items-center justify-center shadow-md shadow-primary/25 transition-transform group-hover:scale-105">
            <Search className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="font-extrabold tracking-tight">SEO Audit</span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                AI Pro
              </span>
            </div>
            <span className="text-[11px] text-text-muted font-normal tracking-wide">
              Automated Technical & On-Page Intelligence
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Launch CTA */}
        <Link
          to="/audits/new"
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-text-inverse text-xs font-semibold hover:bg-primary-hover transition-all shadow-sm shadow-primary/25"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Audit</span>
        </Link>

        {/* Live Engine Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface-muted rounded-full border border-border text-xs text-text-muted">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="font-medium">Engine Online</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme mode"
          className="p-2 text-text-muted hover:text-text rounded-xl hover:bg-surface-hover border border-border transition-all"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-warning transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-secondary transition-transform hover:-rotate-12" />
          )}
        </button>
      </div>
    </header>
  )
}
