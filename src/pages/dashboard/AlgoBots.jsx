/**
 * SwisTrade — Algo Bots Page
 * Create bots, get webhook URLs, view signal history.
 */

import { useState, useEffect } from 'react'
import { botsApi, accountsApi } from '../../services/dashboard'

export default function AlgoBots() {
  const [bots, setBots] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [selectedBot, setSelectedBot] = useState(null)
  const [signals, setSignals] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Create form
  const [botName, setBotName] = useState('')
  const [botAccount, setBotAccount] = useState('')
  const [botLotSize, setBotLotSize] = useState(0.01)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [b, a] = await Promise.all([botsApi.list(), accountsApi.list()])
      setBots(b.data); setAccounts(a.data.accounts.filter(ac => ac.is_funded))
    } catch { /* empty */ } finally { setLoading(false) }
  }

  const handleCreate = async (e) => {
    e.preventDefault(); setCreating(true); setError('')
    try {
      const { data } = await botsApi.create({ account_id: botAccount, name: botName, default_lot_size: botLotSize })
      setMessage(`Bot created! Webhook: ${data.webhook_url}`)
      setShowCreate(false); setBotName(''); loadData()
    } catch (err) { setError(err.response?.data?.detail || 'Failed') }
    finally { setCreating(false) }
  }

  const loadSignals = async (botId) => {
    const { data } = await botsApi.signals(botId)
    setSignals(data.signals)
    setSelectedBot(botId)
  }

  const toggleBot = async (botId) => {
    await botsApi.toggle(botId); loadData()
  }

  if (loading) return <div className="dash-loading">Loading...</div>

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h2 className="dash-page__title">ALGO BOTS</h2>
          <p className="dash-page__subtitle">Connect TradingView strategies for auto-execution</p>
        </div>
        <button className="laser-btn laser-btn--sm" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'CANCEL' : '+ NEW BOT'}
        </button>
      </div>

      {message && <div className="dash-success">{message}</div>}
      {error && <div className="auth-form__error">{error}</div>}

      {showCreate && (
        <div className="dash-create-card">
          <h3 className="dash-create-card__title">CREATE BOT</h3>
          <form onSubmit={handleCreate} className="auth-form" style={{ maxWidth: 500 }}>
            <div className="auth-form__group">
              <label className="auth-form__label">BOT NAME</label>
              <input className="auth-form__input" value={botName} onChange={(e) => setBotName(e.target.value)} required placeholder="My EURUSD Bot" />
            </div>
            <div className="auth-form__group">
              <label className="auth-form__label">TRADING ACCOUNT</label>
              <select className="auth-form__input" value={botAccount} onChange={(e) => setBotAccount(e.target.value)} required>
                <option value="">Select funded account...</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.account_number} - ${a.balance.toFixed(2)}</option>
                ))}
              </select>
            </div>
            <div className="auth-form__group">
              <label className="auth-form__label">DEFAULT LOT SIZE</label>
              <input type="number" className="auth-form__input" value={botLotSize} onChange={(e) => setBotLotSize(parseFloat(e.target.value))} step="0.01" min="0.01" />
            </div>
            <button type="submit" className="laser-btn" disabled={creating}>{creating ? 'CREATING...' : 'CREATE BOT'}</button>
          </form>
        </div>
      )}

      <div className="dash-accounts-grid">
        {bots.length === 0 ? <div className="dash-empty"><p>No bots created yet.</p></div> : bots.map((b) => (
          <div key={b.id} className="dash-account-card">
            <div className="dash-account-card__header">
              <span className="dash-account-card__type">{b.status.toUpperCase()}</span>
              <button className="dash-btn-sm" onClick={() => toggleBot(b.id)}>{b.status === 'active' ? 'PAUSE' : 'ACTIVATE'}</button>
            </div>
            <div className="dash-account-card__number">{b.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', wordBreak: 'break-all', margin: '8px 0' }}>
              Webhook: <span style={{ color: 'var(--accent)' }}>{b.webhook_url}</span>
            </div>
            <div className="dash-account-card__meta">
              <div><span className="dash-account-card__label">SIGNALS</span><span>{b.total_signals}</span></div>
              <div><span className="dash-account-card__label">TRADES</span><span>{b.total_trades_executed}</span></div>
              <div><span className="dash-account-card__label">P&L</span><span className={b.total_pnl >= 0 ? 'text-green' : 'text-red'}>${b.total_pnl}</span></div>
            </div>
            <button className="dash-btn-sm" onClick={() => loadSignals(b.id)}>VIEW SIGNALS</button>
          </div>
        ))}
      </div>

      {selectedBot && signals.length > 0 && (
        <>
          <h3 className="dash-home__section-title" style={{ marginTop: 32 }}>SIGNAL HISTORY</h3>
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead><tr><th>ACTION</th><th>INSTRUMENT</th><th>LOT</th><th>PRICE</th><th>STATUS</th><th>TIME</th></tr></thead>
              <tbody>
                {signals.map((s) => (
                  <tr key={s.id}>
                    <td><span className={`dash-direction dash-direction--${s.action}`}>{s.action.toUpperCase()}</span></td>
                    <td>{s.instrument}</td><td>{s.lot_size}</td><td>{s.price}</td>
                    <td><span className={`dash-status dash-status--${s.status}`}>{s.status.toUpperCase()}</span></td>
                    <td>{new Date(s.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
