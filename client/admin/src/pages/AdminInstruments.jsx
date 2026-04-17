import { useState, useEffect } from 'react'
import { instrumentsApi } from '../services/dashboard'
import { adminApi } from '../services/admin'

export default function AdminInstruments() {
  const [instruments, setInstruments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ symbol: '', display_name: '', segment: 'forex', pip_size: 0.0001, lot_size: 100000, min_lot: 0.01, max_lot: 100 })

  useEffect(() => { loadInstruments() }, [])
  const loadInstruments = async () => {
    try { const { data } = await instrumentsApi.list(); setInstruments(data) } catch { /* empty */ } finally { setLoading(false) }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    try { await adminApi.createInstrument(form); setMessage('Instrument added'); setShowAdd(false); loadInstruments() }
    catch (err) { setMessage(err.response?.data?.detail || 'Failed') }
  }

  const handleToggle = async (symbol) => {
    try { await adminApi.toggleInstrument(symbol); setMessage(`${symbol} toggled`); loadInstruments() } catch { /* empty */ }
  }

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div><h2 className="dash-page__title">INSTRUMENTS</h2><p className="dash-page__subtitle">{instruments.length} instruments</p></div>
        <button className="laser-btn laser-btn--sm" onClick={() => setShowAdd(!showAdd)}>{showAdd ? 'CANCEL' : '+ ADD INSTRUMENT'}</button>
      </div>
      {message && <div className="dash-success">{message}</div>}
      {showAdd && (
        <div className="dash-create-card">
          <form onSubmit={handleAdd} className="auth-form" style={{ maxWidth: 600 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="auth-form__group"><label className="auth-form__label">SYMBOL</label><input className="auth-form__input" value={form.symbol} onChange={(e) => setForm({...form, symbol: e.target.value})} required placeholder="EURUSD" /></div>
              <div className="auth-form__group"><label className="auth-form__label">DISPLAY NAME</label><input className="auth-form__input" value={form.display_name} onChange={(e) => setForm({...form, display_name: e.target.value})} required placeholder="EUR/USD" /></div>
              <div className="auth-form__group"><label className="auth-form__label">SEGMENT</label>
                <select className="auth-form__input" value={form.segment} onChange={(e) => setForm({...form, segment: e.target.value})}>
                  {['forex','crypto','metals','indices','energy','stocks'].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="auth-form__group"><label className="auth-form__label">PIP SIZE</label><input type="number" className="auth-form__input" value={form.pip_size} onChange={(e) => setForm({...form, pip_size: parseFloat(e.target.value)})} step="0.00001" /></div>
            </div>
            <button type="submit" className="laser-btn" style={{ marginTop: 12 }}>ADD INSTRUMENT</button>
          </form>
        </div>
      )}
      {loading ? <div className="dash-loading">Loading...</div> : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead><tr><th>SYMBOL</th><th>NAME</th><th>SEGMENT</th><th>PIP</th><th>LOT SIZE</th><th>MIN/MAX LOT</th><th>HOURS</th><th>ACTION</th></tr></thead>
            <tbody>
              {instruments.map((i) => (
                <tr key={i.symbol}>
                  <td><strong>{i.symbol}</strong></td><td>{i.display_name}</td><td><span className="dash-badge">{i.segment}</span></td>
                  <td>{i.pip_size}</td><td>{i.lot_size.toLocaleString()}</td><td>{i.min_lot} / {i.max_lot}</td><td>{i.trading_hours}</td>
                  <td><button className="dash-btn-sm" onClick={() => handleToggle(i.symbol)}>TOGGLE</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
