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
    <aside className="w-64 border-r border-border/70 bg-surface/60 backdrop-blur-xl flex flex-col justify-between p-4 shrink-0 hidden md:flex min-h-[calc(100vh-4rem)] transition-colors">
      <div className="space-y-6">
        {sections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-black text-text-subtle uppercase tracking-widest">
              {sec.title}
            </div>
            {sec.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-secondary text-text-inverse shadow-md shadow-primary/25 scale-[1.02]'
                      : 'text-text-muted hover:text-text hover:bg-surface-hover/80 active:scale-95'
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

      <div className="p-4 bg-gradient-to-b from-surface-muted to-surface border border-border/80 rounded-2xl shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none group-hover:bg-primary/20 transition-all"></div>
        <div className="flex items-center gap-2 text-xs font-bold text-text mb-1 relative z-10">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>SSRF Cybersecurity</span>
        </div>
        <p className="text-[11px] text-text-muted leading-relaxed relative z-10">
          Autonomous DNS firewall filtering all loopbacks, internal LANs, and cloud metadata.
        </p>
      </div>
    </aside>
  )
}
