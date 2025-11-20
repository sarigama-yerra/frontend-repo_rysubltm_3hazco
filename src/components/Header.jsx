import React from 'react'

const Header = () => {
  return (
    <header className="px-6 py-5 border-b border-white/10 bg-slate-900/60 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/flame-icon.svg" alt="Logo" className="w-8 h-8" />
          <h1 className="text-white text-xl font-semibold tracking-tight">Furniture Module Configurator</h1>
        </div>
        <a href="/test" className="text-sm text-blue-300 hover:text-blue-200">Check backend</a>
      </div>
    </header>
  )
}

export default Header
