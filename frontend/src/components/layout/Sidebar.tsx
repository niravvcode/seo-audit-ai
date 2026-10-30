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
  CheckSquare
} from 'lucide-react'

export const Sidebar: React.FC = () => {
  const sections = [
    {
      title: 'Audits',
      items: [
        { to: '/', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
        { to: '/audits/new', label: 'New Audit', icon: <PlusCircle className="w-4 h-4" /> },
        { to: '/compare', label: 'Competitor Battle', icon: <Swords className="w-4 h-4" /> },
        { to: '/schedules', label: 'Monitoring Schedules', icon: <CalendarClock className="w-4 h-4" /> },
        { to: '/audits', label: 'History', icon: <History className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Tools',
      items: [
        { to: '/tools', label: 'Diagnostics & Headers', icon: <Wrench className="w-4 h-4" /> },
        { to: '/checklist', label: 'Launch Checklist', icon: <CheckSquare className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Resources',
      items: [
        { to: '/methodology', label: 'Scoring Methodology', icon: <BookOpen className="w-4 h-4" /> },
      ],
    },
  ]

  return (
    <aside className="w-60 border-r border-border bg-surface flex flex-col justify-between p-3 shrink-0 hidden md:flex min-h-[calc(100vh-3.5rem)] text-xs">
      <div className="space-y-5">
        {sections.map((sec, idx) => (
          <div key={idx} className="space-y-0.5">
            <div className="px-2.5 py-1 text-[11px] font-semibold text-text-subtle uppercase tracking-wider">
              {sec.title}
            </div>
            {sec.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                    isActive
                      ? 'bg-surface-muted text-text font-semibold shadow-xs'
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

      <div className="p-3 bg-surface-muted border border-border rounded-lg text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-text">
          <ShieldCheck className="w-3.5 h-3.5 text-success" />
          <span>SSRF Protected</span>
        </div>
        <p className="text-[11px] text-text-muted leading-relaxed">
          DNS firewall filtering loopbacks & private networks.
        </p>
      </div>
    </aside>
  )
}
