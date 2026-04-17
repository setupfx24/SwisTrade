/**
 * SwisTrade — Prop Challenges Page
 * Browse available challenges, purchase, track active props.
 */

import { useState, useEffect } from 'react'
import { propApi } from '../../services/dashboard'

export default function PropChallenges() {
  const [tab, setTab] = useState('available')
  const [available, setAvailable] = useState([])
  const [myChallenges, setMyChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [a, m] = await Promise.all([propApi.available(), propApi.myChallenges()])
      setAvailable(a.data)
      setMyChallenges(m.data)
    } catch { /* empty */ } finally { setLoading(false) }
  }

  const handlePurchase = async (settingsId) => {
    if (!confirm('Purchase this prop challenge? Amount will be deducted from your wallet.')) return
    setPurchasing(true); setError(''); setMessage('')
    try {
      const { data } = await propApi.purchase(settingsId)
      setMessage(data.message)
      loadData()
      setTab('my')
    } catch (err) { setError(err.response?.data?.detail || 'Purchase failed') }
    finally { setPurchasing(false) }
  }

  if (loading) return <div className="dash-loading">Loading...</div>

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h2 className="dash-page__title">PROP CHALLENGES</h2>
          <p className="dash-page__subtitle">Get funded to trade with our capital</p>
        </div>
      </div>

      {message && <div className="dash-success">{message}</div>}
      {error && <div className="auth-form__error">{error}</div>}

      <div className="dash-tabs">
        <button className={`dash-tab ${tab === 'available' ? 'dash-tab--active' : ''}`} onClick={() => setTab('available')}>AVAILABLE</button>
        <button className={`dash-tab ${tab === 'my' ? 'dash-tab--active' : ''}`} onClick={() => setTab('my')}>MY CHALLENGES ({myChallenges.length})</button>
      </div>

      {tab === 'available' && (
        <div className="dash-prop-grid">
          {available.length === 0 ? <div className="dash-empty"><p>No prop challenges available. Admin needs to create prop settings.</p></div> : available.map((p) => (
            <div key={p.id} className="dash-prop-card">
              <div className="dash-prop-card__header">
                <span className="dash-prop-card__type">{p.prop_type.replace('_', ' ').toUpperCase()}</span>
                <span className="dash-prop-card__phases">{p.phases_count} PHASE{p.phases_count > 1 ? 'S' : ''}</span>
              </div>
              <div className="dash-prop-card__size">${p.account_size.toLocaleString()}</div>
              <div className="dash-prop-card__price">Price: ${p.price}</div>
              <div className="dash-prop-card__rules">
                <div>Daily Loss: {p.rules.max_daily_loss_pct}%</div>
                <div>Total Loss: {p.rules.max_total_loss_pct}%</div>
                <div>Profit Target: {p.rules.profit_target_pct}%</div>
                <div>Min Days: {p.rules.min_trading_days}</div>
                <div>SL Required: {p.rules.sl_required ? 'YES' : 'NO'}</div>
                <div>Max Lot: {p.rules.max_lot_size}</div>
              </div>
              <button className="laser-btn" disabled={purchasing} onClick={() => handlePurchase(p.id)}>
                {purchasing ? 'PURCHASING...' : `BUY $${p.price}`}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'my' && (
        <div className="dash-prop-grid">
          {myChallenges.length === 0 ? <div className="dash-empty"><p>No active prop challenges.</p></div> : myChallenges.map((p) => (
            <div key={p.id} className={`dash-prop-card dash-prop-card--${p.status}`}>
              <div className="dash-prop-card__header">
                <span className="dash-prop-card__type">{p.prop_type.replace('_', ' ').toUpperCase()}</span>
                <span className={`dash-status dash-status--${p.status}`}>{p.status.toUpperCase()}</span>
              </div>
              <div className="dash-prop-card__size">${p.account_size.toLocaleString()}</div>
              {p.trading_account && (
                <div className="dash-prop-card__account">
                  <div>Account: {p.trading_account.account_number}</div>
                  <div>Balance: ${p.trading_account.balance.toFixed(2)}</div>
                  <div>Equity: ${p.trading_account.equity.toFixed(2)}</div>
                </div>
              )}
              <div className="dash-prop-card__phase">Phase {p.current_phase}/{p.total_phases}</div>
              {p.is_blown && <div className="dash-prop-card__blown">BLOWN: {p.blown_reason}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
