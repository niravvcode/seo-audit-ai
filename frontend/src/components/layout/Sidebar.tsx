import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  PlusCircle,
  History,
  BookOpen,
  ShieldCheck,
  Swords,
  CalendarClock,
  Wrench,
  CheckSquare,
  Sparkles
} from 'lucide-react'

export const Sidebar: React.FC = () => {
  const sections = [
    {
      title: 'Audits & Intelligence',
      items: [
        { to: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { to: '/audits/new', label: 'New SEO Audit', icon: <PlusCircle className="w-4 h-4" /> },
        { to: '/compare', label: 'Competitor Battle', icon: <Swords className="w-4 h-4" /> },
        { to: '/schedules', label: 'Monitoring Schedules', icon: <CalendarClock className="w-4 h-4" /> },
        { to: '/audits', label: 'Audit History', icon: <History className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Diagnostics & Tools',
      items: [
        { to: '/tools', label: 'SEO Diagnostic Tools', icon: <Wrench className="w-4 h-4" /> },
        { to: '/checklist', label: 'SEO Launch Checklist', icon: <CheckSquare className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Documentation',
      items: [
        { to: '/methodology', label: 'Audit Methodology', icon: <BookOpen className="w-4 h-4" /> },
      ],
    },
  ]

  return (
    <aside className="w-64 border-r border-border bg-surface/70 backdrop-blur-md flex flex-col justify-between p-4 shrink-0 hidden md:flex min-h-[calc(100vh-4rem)] transition-colors">
      <div className="space-y-6">
        {sections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-bold text-text-subtle uppercase tracking-wider">
              {sec.title}
            </div>
            {sec.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-primary text-text-inverse shadow-sm shadow-primary/20 scale-[1.01]'
                      : 'text-text-muted hover:text-text hover:bg-surface-hover'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      <div className="p-3.5 bg-surface-muted border border-border rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-text mb-1">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>SSRF Protected Crawler</span>
        </div>
        <p className="text-[11px] text-text-muted leading-relaxed">
          Autonomous DNS validation prevents internal loopback and cloud metadata SSRF access.
        </p>
      </div>
    </aside>
  )
}
