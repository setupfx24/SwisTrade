import { useState, useEffect } from 'react'
import { adminApi } from '../services/admin'
import { propApi } from '../services/dashboard'

export default function AdminProp() {
  const [settings, setSettings] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    prop_type: 'one_step', account_size: 10000, price: 99, phases_count: 1,
    max_daily_loss_pct: 5, max_total_loss_pct: 10, profit_target_pct: 8,
    min_trading_days: 5, sl_required: true, max_lot_size: 10, max_leverage: 100,
  })

  useEffect(() => { loadSettings() }, [])
  const loadSettings = async () => { try { const { data } = await propApi.available(); setSettings(data) } catch { /* empty */ } }

  const handleCreate = async (e) => {
    e.preventDefault()
    try { await adminApi.createPropSettings(form); setMessage('Prop challenge created'); setShowAdd(false); loadSettings() }
    catch (err) { setMessage(err.response?.data?.detail || 'Failed') }
  }

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div><h2 className="dash-page__title">PROP CHALLENGE SETTINGS</h2><p className="dash-page__subtitle">Configure prop challenges users can buy</p></div>
        <button className="laser-btn laser-btn--sm" onClick={() => setShowAdd(!showAdd)}>{showAdd ? 'CANCEL' : '+ CREATE PROP'}</button>
      </div>
      {message && <div className="dash-success">{message}</div>}
      {showAdd && (
        <div className="dash-create-card">
          <form onSubmit={handleCreate} className="auth-form" style={{ maxWidth: 600 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div className="auth-form__group"><label className="auth-form__label">TYPE</label>
                <select className="auth-form__input" value={form.prop_type} onChange={(e) => setForm({...form, prop_type: e.target.value, phases_count: e.target.value === 'two_step' ? 2 : 1})}>
                  <option value="one_step">ONE STEP</option><option value="two_step">TWO STEP</option><option value="instant_fund">INSTANT FUND</option>
                </select>
              </div>
              <div className="auth-form__group"><label className="auth-form__label">ACCOUNT SIZE ($)</label><input type="number" className="auth-form__input" value={form.account_size} onChange={(e) => setForm({...form, account_size: parseFloat(e.target.value)})} /></div>
              <div className="auth-form__group"><label className="auth-form__label">PRICE ($)</label><input type="number" className="auth-form__input" value={form.price} onChange={(e) => setForm({...form, price: parseFloat(e.target.value)})} /></div>
              <div className="auth-form__group"><label className="auth-form__label">DAILY LOSS %</label><input type="number" className="auth-form__input" value={form.max_daily_loss_pct} onChange={(e) => setForm({...form, max_daily_loss_pct: parseFloat(e.target.value)})} /></div>
              <div className="auth-form__group"><label className="auth-form__label">TOTAL LOSS %</label><input type="number" className="auth-form__input" value={form.max_total_loss_pct} onChange={(e) => setForm({...form, max_total_loss_pct: parseFloat(e.target.value)})} /></div>
              <div className="auth-form__group"><label className="auth-form__label">PROFIT TARGET %</label><input type="number" className="auth-form__input" value={form.profit_target_pct} onChange={(e) => setForm({...form, profit_target_pct: parseFloat(e.target.value)})} /></div>
              <div className="auth-form__group"><label className="auth-form__label">MIN DAYS</label><input type="number" className="auth-form__input" value={form.min_trading_days} onChange={(e) => setForm({...form, min_trading_days: parseInt(e.target.value)})} /></div>
              <div className="auth-form__group"><label className="auth-form__label">MAX LOT</label><input type="number" className="auth-form__input" value={form.max_lot_size} onChange={(e) => setForm({...form, max_lot_size: parseFloat(e.target.value)})} /></div>
              <div className="auth-form__group"><label className="auth-form__label">MAX LEVERAGE</label><input type="number" className="auth-form__input" value={form.max_leverage} onChange={(e) => setForm({...form, max_leverage: parseInt(e.target.value)})} /></div>
            </div>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '12px 0', fontSize: 13 }}>
              <input type="checkbox" checked={form.sl_required} onChange={(e) => setForm({...form, sl_required: e.target.checked})} /> SL Required
            </label>
            <button type="submit" className="laser-btn">CREATE PROP CHALLENGE</button>
          </form>
        </div>
      )}
      <div className="dash-prop-grid">
        {settings.map((s) => (
          <div key={s.id} className="dash-prop-card">
            <div className="dash-prop-card__header"><span className="dash-prop-card__type">{s.prop_type.replace('_', ' ').toUpperCase()}</span><span className="dash-prop-card__phases">{s.phases_count} PHASE{s.phases_count > 1 ? 'S' : ''}</span></div>
            <div className="dash-prop-card__size">${s.account_size.toLocaleString()}</div>
            <div className="dash-prop-card__price">Price: ${s.price}</div>
            <div className="dash-prop-card__rules">
              <div>Daily Loss: {s.rules.max_daily_loss_pct}%</div><div>Total Loss: {s.rules.max_total_loss_pct}%</div>
              <div>Target: {s.rules.profit_target_pct}%</div><div>Min Days: {s.rules.min_trading_days}</div>
              <div>SL: {s.rules.sl_required ? 'YES' : 'NO'}</div><div>Max Lot: {s.rules.max_lot_size}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
