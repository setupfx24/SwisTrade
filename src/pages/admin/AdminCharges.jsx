import { useState, useEffect } from 'react'
import { adminApi } from '../../services/admin'

export default function AdminCharges() {
  const [charges, setCharges] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ level: 'default', target_id: '', instrument_id: '', spread_markup: 0, swap_long: 0, swap_short: 0, commission_per_lot: 0 })

  useEffect(() => { loadCharges() }, [])
  const loadCharges = async () => { try { const { data } = await adminApi.charges(); setCharges(data) } catch { /* empty */ } finally { setLoading(false) } }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await adminApi.setCharge({ ...form, target_id: form.target_id || undefined, instrument_id: form.instrument_id || undefined })
      setMessage('Charge saved'); setShowAdd(false); loadCharges()
    } catch (err) { setMessage(err.response?.data?.detail || 'Failed') }
  }

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div><h2 className="dash-page__title">CHARGE MANAGEMENT</h2><p className="dash-page__subtitle">Priority: User {'>'} Account Type {'>'} Default</p></div>
        <button className="laser-btn laser-btn--sm" onClick={() => setShowAdd(!showAdd)}>{showAdd ? 'CANCEL' : '+ SET CHARGE'}</button>
      </div>
      {message && <div className="dash-success">{message}</div>}
      {showAdd && (
        <div className="dash-create-card">
          <form onSubmit={handleSubmit} className="auth-form" style={{ maxWidth: 600 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="auth-form__group"><label className="auth-form__label">LEVEL</label>
                <select className="auth-form__input" value={form.level} onChange={(e) => setForm({...form, level: e.target.value})}>
                  <option value="default">DEFAULT (all)</option><option value="account_type">ACCOUNT TYPE</option><option value="user">USER SPECIFIC</option>
                </select>
              </div>
              <div className="auth-form__group"><label className="auth-form__label">TARGET ID</label><input className="auth-form__input" value={form.target_id} onChange={(e) => setForm({...form, target_id: e.target.value})} placeholder="ecn / user_id" /></div>
              <div className="auth-form__group"><label className="auth-form__label">INSTRUMENT</label><input className="auth-form__input" value={form.instrument_id} onChange={(e) => setForm({...form, instrument_id: e.target.value})} placeholder="EURUSD (empty=all)" /></div>
              <div className="auth-form__group"><label className="auth-form__label">SPREAD MARKUP (PIPS)</label><input type="number" className="auth-form__input" value={form.spread_markup} onChange={(e) => setForm({...form, spread_markup: parseFloat(e.target.value)})} step="0.01" /></div>
              <div className="auth-form__group"><label className="auth-form__label">SWAP LONG</label><input type="number" className="auth-form__input" value={form.swap_long} onChange={(e) => setForm({...form, swap_long: parseFloat(e.target.value)})} step="0.01" /></div>
              <div className="auth-form__group"><label className="auth-form__label">SWAP SHORT</label><input type="number" className="auth-form__input" value={form.swap_short} onChange={(e) => setForm({...form, swap_short: parseFloat(e.target.value)})} step="0.01" /></div>
              <div className="auth-form__group"><label className="auth-form__label">COMMISSION/LOT</label><input type="number" className="auth-form__input" value={form.commission_per_lot} onChange={(e) => setForm({...form, commission_per_lot: parseFloat(e.target.value)})} step="0.1" /></div>
            </div>
            <button type="submit" className="laser-btn" style={{ marginTop: 12 }}>SAVE CHARGE</button>
          </form>
        </div>
      )}
      {loading ? <div className="dash-loading">Loading...</div> : charges.length === 0 ? <div className="dash-empty"><p>No charge settings. Defaults will be used (0).</p></div> : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead><tr><th>LEVEL</th><th>TARGET</th><th>INSTRUMENT</th><th>SPREAD</th><th>SWAP L/S</th><th>COMMISSION</th><th>PRIORITY</th></tr></thead>
            <tbody>
              {charges.map((c) => (
                <tr key={c.id}>
                  <td><span className="dash-badge">{c.level.toUpperCase()}</span></td>
                  <td>{c.target_id || 'ALL'}</td><td>{c.instrument_id || 'ALL'}</td>
                  <td>{c.spread_markup} pips</td><td>{c.swap_long} / {c.swap_short}</td><td>${c.commission_per_lot}</td><td>{c.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
