import React from 'react'
import Header from './components/Header'
import Configurator from './components/Configurator'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-blue-100">
      <Header />
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.06),transparent_50%)] pointer-events-none" />
        <Configurator />
      </div>
    </div>
  )
}

export default App
