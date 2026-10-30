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
  Terminal,
  Activity
} from 'lucide-react'

export const Sidebar: React.FC = () => {
  const sections = [
    {
      title: 'PLATFORM',
      items: [
        { to: '/', label: 'Command Center', icon: <LayoutDashboard className="w-4 h-4" /> },
        { to: '/audits/new', label: 'Launch New Crawl', icon: <PlusCircle className="w-4 h-4" /> },
        { to: '/compare', label: 'Competitor Battle', icon: <Swords className="w-4 h-4" /> },
        { to: '/schedules', label: 'Automated Monitors', icon: <CalendarClock className="w-4 h-4" /> },
        { to: '/audits', label: 'Diagnostic History', icon: <History className="w-4 h-4" /> },
      ],
    },
    {
      title: 'ENGINE TOOLS',
      items: [
        { to: '/tools', label: 'Security & Directives', icon: <Wrench className="w-4 h-4" /> },
        { to: '/checklist', label: 'Launch Quality Gate', icon: <CheckSquare className="w-4 h-4" /> },
      ],
    },
    {
      title: 'ARCHITECTURE',
      items: [
        { to: '/methodology', label: 'Scoring Algorithm', icon: <BookOpen className="w-4 h-4" /> },
      ],
    },
  ]

  return (
    <aside className="w-64 border-r border-border bg-surface flex flex-col justify-between p-4 shrink-0 hidden md:flex min-h-[calc(100vh-4rem)] text-xs">
      <div className="space-y-6">
        {sections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-mono font-bold tracking-widest text-text-subtle uppercase">
              {sec.title}
            </div>
            {sec.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/25 shadow-xs font-semibold'
                      : 'text-text-muted hover:text-text hover:bg-surface-hover'
                  }`
                }
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Roar AI System Telemetry Badge */}
      <div className="p-3.5 rounded-xl bg-surface-muted border border-border space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
          <span className="flex items-center gap-1.5 font-semibold text-text">
            <ShieldCheck className="w-3.5 h-3.5 text-success" />
            SSRF Firewall
          </span>
          <span className="text-success font-bold">ARMED</span>
        </div>
        <p className="text-[11px] text-text-subtle leading-relaxed">
          Autonomous DNS filter verifying egress destinations against private subnets.
        </p>
      </div>
    </aside>
  )
}
