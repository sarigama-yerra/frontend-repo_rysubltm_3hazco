import React, { useEffect, useMemo, useState } from 'react'

const apiBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

const Field = ({ label, children }) => (
  <div>
    <label className="block text-sm text-blue-200/80 mb-1">{label}</label>
    {children}
  </div>
)

const OptionBadge = ({ children }) => (
  <span className="inline-flex items-center px-2 py-1 text-xs rounded bg-white/10 text-blue-100 border border-white/10">
    {children}
  </span>
)

const formatSize = (s) => `${s.width}×${s.height}×${s.depth} mm`

const Configurator = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [catalog, setCatalog] = useState([])

  const [cabinetCode, setCabinetCode] = useState('')
  const [sizeKey, setSizeKey] = useState('')
  const [material, setMaterial] = useState('')
  const [color, setColor] = useState('')
  const [customer, setCustomer] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState('')

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch(`${apiBase}/api/cabinets`)
        if (!res.ok) throw new Error('Failed to load catalog')
        const data = await res.json()
        setCatalog(data)
        if (data.length) setCabinetCode(data[0].code)
        setLoading(false)
      } catch (e) {
        setError(e.message)
        setLoading(false)
      }
    }
    fetchCatalog()
  }, [])

  const cabinet = useMemo(() => catalog.find(c => c.code === cabinetCode), [catalog, cabinetCode])

  const sizes = useMemo(() => {
    if (!cabinet) return []
    return cabinet.modules.map(m => ({ key: `${m.size.width}x${m.size.height}x${m.size.depth}`, label: formatSize(m.size), value: m.size }))
  }, [cabinet])

  const activeModule = useMemo(() => {
    if (!cabinet || !sizeKey) return null
    return cabinet.modules.find(m => `${m.size.width}x${m.size.height}x${m.size.depth}` === sizeKey)
  }, [cabinet, sizeKey])

  useEffect(() => {
    // reset dependent fields when selections change
    setSizeKey('')
    setMaterial('')
    setColor('')
    setSavedId('')
  }, [cabinetCode])

  useEffect(() => {
    setMaterial('')
    setColor('')
    setSavedId('')
  }, [sizeKey])

  const canSave = cabinet && activeModule && material && color

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    setError('')
    setSavedId('')
    try {
      const payload = {
        customer: customer || null,
        cabinet_code: cabinet.code,
        size: activeModule.size,
        material,
        color,
        notes: notes || null,
      }
      const res = await fetch(`${apiBase}/api/configurations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Failed to save configuration')
      }
      const data = await res.json()
      setSavedId(data.id)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-blue-100">Loading options...</div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-red-300">{error}</div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 grid md:grid-cols-2 gap-8">
      <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6 space-y-5">
        <h2 className="text-white text-xl font-semibold">Select Options</h2>

        <Field label="Cabinet Type">
          <select value={cabinetCode} onChange={(e) => setCabinetCode(e.target.value)} className="w-full bg-slate-900/60 border border-white/10 text-blue-100 rounded px-3 py-2">
            {catalog.map(c => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Size">
          <select value={sizeKey} onChange={(e) => setSizeKey(e.target.value)} className="w-full bg-slate-900/60 border border-white/10 text-blue-100 rounded px-3 py-2">
            <option value="" disabled>Select a size</option>
            {sizes.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Material">
          <select disabled={!activeModule} value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full bg-slate-900/60 border border-white/10 text-blue-100 rounded px-3 py-2 disabled:opacity-50">
            <option value="" disabled>{activeModule ? 'Select material' : 'Select size first'}</option>
            {activeModule?.materials.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </Field>

        <Field label="Color">
          <select disabled={!activeModule} value={color} onChange={(e) => setColor(e.target.value)} className="w-full bg-slate-900/60 border border-white/10 text-blue-100 rounded px-3 py-2 disabled:opacity-50">
            <option value="" disabled>{activeModule ? 'Select color' : 'Select size first'}</option>
            {activeModule?.colors.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Customer (optional)">
            <input value={customer} onChange={(e) => setCustomer(e.target.value)} className="w-full bg-slate-900/60 border border-white/10 text-blue-100 rounded px-3 py-2" placeholder="e.g. ACME Kitchens" />
          </Field>
          <Field label="Notes (optional)">
            <input value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-slate-900/60 border border-white/10 text-blue-100 rounded px-3 py-2" placeholder="Add any notes" />
          </Field>
        </div>

        <button onClick={handleSave} disabled={!canSave || saving} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/50 text-white font-medium py-2.5 rounded transition-colors">
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
        {savedId && (
          <p className="text-green-300 text-sm">Saved! ID: <span className="font-mono">{savedId}</span></p>
        )}
      </div>

      <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6 space-y-5">
        <h2 className="text-white text-xl font-semibold">Preview</h2>
        <div className="text-blue-100 space-y-3">
          <div>
            <p className="text-sm text-blue-300/80">Cabinet</p>
            <p className="text-lg">{cabinet?.name || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-blue-300/80">Size</p>
            <p className="text-lg">{activeModule ? formatSize(activeModule.size) : '-'}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeModule?.materials.map(m => (
              <OptionBadge key={m}>{m}</OptionBadge>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {activeModule?.colors.map(c => (
              <OptionBadge key={c}>{c}</OptionBadge>
            ))}
          </div>
          {material && color && (
            <div className="mt-4 p-4 rounded bg-slate-900/60 border border-white/10">
              <p className="text-sm text-blue-300/80 mb-1">Your selection</p>
              <p className="text-white">{material} in {color}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Configurator
