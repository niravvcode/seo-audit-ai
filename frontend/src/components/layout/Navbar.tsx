import React from 'react'
import { Link } from 'react-router-dom'
import { Sun, Moon, Search, Sparkles } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-text">
          <div className="w-9 h-9 rounded-xl bg-primary text-text-inverse flex items-center justify-center shadow-md shadow-primary/25">
            <Search className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="leading-tight flex items-center gap-1.5">
              SEO Audit <span className="text-primary font-black">AI</span>
            </span>
            <span className="text-[10px] text-text-muted font-normal tracking-wide">
              Automated Technical & On-Page Diagnostics
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface-muted rounded-full border border-border text-xs text-text-muted">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span>Engine Online</span>
        </div>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme mode"
          className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-surface-hover border border-border transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-secondary" />}
        </button>
      </div>
    </header>
  )
}
