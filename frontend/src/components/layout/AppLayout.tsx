import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-text flex flex-col relative selection:bg-primary selection:text-text-inverse">
      <Navbar />
      <div className="flex-1 flex relative z-10">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
