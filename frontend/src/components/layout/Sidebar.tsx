import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, History, BookOpen, ShieldCheck } from 'lucide-react'

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/audits/new', label: 'New SEO Audit', icon: <PlusCircle className="w-4 h-4" /> },
    { to: '/audits', label: 'Audit History', icon: <History className="w-4 h-4" /> },
    { to: '/methodology', label: 'Methodology', icon: <BookOpen className="w-4 h-4" /> },
  ]

  return (
    <aside className="w-64 border-r border-border bg-surface flex flex-col justify-between p-4 shrink-0 hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-text-subtle uppercase tracking-wider">
          Navigation
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-text-inverse shadow-sm shadow-primary/20'
                  : 'text-text-muted hover:text-text hover:bg-surface-hover'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="p-3 bg-surface-muted border border-border rounded-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-text mb-1">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>SSRF Protected</span>
        </div>
        <p className="text-[11px] text-text-muted leading-relaxed">
          Crawler verifies all IP destinations and restricts internal loopback & private subnets.
        </p>
      </div>
    </aside>
  )
}
