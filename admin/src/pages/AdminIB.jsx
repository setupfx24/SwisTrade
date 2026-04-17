import { useState, useEffect } from 'react'
import { adminApi } from '../services/admin'

export default function AdminIB() {
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ level_1_pct: 30, decay_factor: 0.5 })

  const handleSave = async (e) => {
    e.preventDefault()
    try { await adminApi.setIBSettings(form); setMessage('IB level settings saved') } catch { setMessage('Failed') }
  }

  // Calculate preview
  const levels = []
  for (let i = 1; i <= 10; i++) {
    levels.push({ level: i, pct: (form.level_1_pct * Math.pow(form.decay_factor, i - 1)).toFixed(2) })
  }

  return (
    <div className="dash-page">
      <div className="dash-page__header"><div><h2 className="dash-page__title">IB LEVEL SETTINGS</h2><p className="dash-page__subtitle">Configure 10-level community distribution</p></div></div>
      {message && <div className="dash-success">{message}</div>}
      <div className="dash-create-card">
        <form onSubmit={handleSave} className="auth-form" style={{ maxWidth: 400 }}>
          <div className="auth-form__group"><label className="auth-form__label">LEVEL 1 COMMISSION %</label><input type="number" className="auth-form__input" value={form.level_1_pct} onChange={(e) => setForm({...form, level_1_pct: parseFloat(e.target.value)})} step="0.1" min="0" max="100" /></div>
          <div className="auth-form__group"><label className="auth-form__label">DECAY FACTOR</label><input type="number" className="auth-form__input" value={form.decay_factor} onChange={(e) => setForm({...form, decay_factor: parseFloat(e.target.value)})} step="0.05" min="0.1" max="1" />
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Each level = previous level × decay factor</span></div>
          <button type="submit" className="laser-btn">SAVE SETTINGS</button>
        </form>
      </div>
      <h3 className="dash-home__section-title" style={{ marginTop: 32 }}>DISTRIBUTION PREVIEW</h3>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead><tr><th>LEVEL</th><th>COMMISSION %</th><th>VISUAL</th></tr></thead>
          <tbody>
            {levels.map((l) => (
              <tr key={l.level}>
                <td>Level {l.level}</td><td className="text-green">{l.pct}%</td>
                <td><div style={{ width: `${Math.max(4, parseFloat(l.pct) * 3)}px`, height: 8, background: 'var(--accent)', borderRadius: 4 }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
