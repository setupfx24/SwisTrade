/**
 * SwisTrade — Accounts Dashboard Page
 * Create trading accounts (6 types), view balances, manage leverage.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { accountsApi } from '../../services/dashboard'

const ACCOUNT_TYPES = [
  { value: 'ecn', label: 'ECN', desc: 'Ultra-tight spreads, direct market access' },
  { value: 'standard', label: 'STANDARD', desc: 'Best for beginners, balanced conditions' },
  { value: 'raw', label: 'RAW', desc: 'Zero markup, commission-based' },
  { value: 'elite', label: 'ELITE', desc: 'Premium features, lowest charges (KYC required)' },
  { value: 'islamic', label: 'ISLAMIC', desc: 'Swap-free, Shariah compliant' },
  { value: 'cent', label: 'CENT', desc: 'Micro lots, perfect for practice' },
]

export default function Accounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [createType, setCreateType] = useState('standard')
  const [createLeverage, setCreateLeverage] = useState(100)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => { loadAccounts() }, [])

  const loadAccounts = async () => {
    try {
      const { data } = await accountsApi.list()
      setAccounts(data.accounts)
    } catch { /* empty */ } finally { setLoading(false) }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      await accountsApi.create({ account_type: createType, leverage: createLeverage })
      setShowCreate(false)
      loadAccounts()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create account')
    } finally { setCreating(false) }
  }

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h2 className="dash-page__title">TRADING ACCOUNTS</h2>
          <p className="dash-page__subtitle">Create and manage your trading accounts</p>
        </div>
        <button className="laser-btn laser-btn--sm" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'CANCEL' : '+ NEW ACCOUNT'}
        </button>
      </div>

      {showCreate && (
        <div className="dash-create-card">
          <h3 className="dash-create-card__title">OPEN NEW ACCOUNT</h3>
          {error && <div className="auth-form__error">{error}</div>}
          <form onSubmit={handleCreate} className="dash-create-form">
            <div className="dash-create-form__types">
              {ACCOUNT_TYPES.map((t) => (
                <label key={t.value} className={`dash-type-option ${createType === t.value ? 'dash-type-option--active' : ''}`}>
                  <input type="radio" name="type" value={t.value} checked={createType === t.value}
                    onChange={(e) => setCreateType(e.target.value)} />
                  <span className="dash-type-option__label">{t.label}</span>
                  <span className="dash-type-option__desc">{t.desc}</span>
                </label>
              ))}
            </div>
            <div className="dash-create-form__row">
              <div className="auth-form__group">
                <label className="auth-form__label">LEVERAGE</label>
                <select className="auth-form__input" value={createLeverage} onChange={(e) => setCreateLeverage(Number(e.target.value))}>
                  {[1, 10, 50, 100, 200, 300, 500].map((l) => (
                    <option key={l} value={l}>1:{l}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="laser-btn" disabled={creating}>
                {creating ? 'CREATING...' : 'CREATE ACCOUNT'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="dash-loading">Loading accounts...</div>
      ) : accounts.length === 0 ? (
        <div className="dash-empty">
          <p>No trading accounts yet. Create your first account to start trading.</p>
        </div>
      ) : (() => {
        // Hide all prop accounts — they show in Prop Challenges page
        const nonProp = accounts.filter(a => !a.is_prop_account)
        const isBlown = (a) => a.is_funded && a.equity <= 0

        return (
          <div className="dash-accounts-list">
            {nonProp.length === 0 ? (
              <div className="dash-empty"><p>No trading accounts yet. Create your first account to start trading.</p></div>
            ) : nonProp.map((a) => {
              const blown = isBlown(a)
              return (
                <div key={a.id} className={`dash-account-wide ${blown ? 'dash-account-wide--blown' : a.is_funded ? '' : 'dash-account-wide--unfunded'}`}>
                  <div className="dash-account-wide__left">
                    <div className="dash-account-wide__top">
                      <span className="dash-account-card__type">{a.account_type.toUpperCase()}</span>
                      <span className={`dash-account-card__status ${blown ? 'dash-account-card__status--blown' : a.is_funded ? 'dash-account-card__status--funded' : ''}`}>
                        {blown ? 'BLOWN' : a.is_funded ? 'LIVE' : 'DEMO'}
                      </span>
                    </div>
                    <div className="dash-account-wide__number">{a.account_number}</div>
                    <div style={{ fontFamily: 'Geist Mono', fontSize: 9, color: blown ? '#ff5050' : 'var(--text-secondary)', letterSpacing: '0.1em', marginTop: 2 }}>
                      {blown ? 'ACCOUNT BLOWN — TRADING DISABLED' : a.is_funded ? 'TRADING ACCOUNT' : 'UNFUNDED ACCOUNT'}
                    </div>
                  </div>

                  <div className="dash-account-wide__stats">
                    <div className="dash-account-wide__stat">
                      <span className="dash-account-card__label">BALANCE</span>
                      <span className="dash-account-wide__value">${a.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="dash-account-wide__stat">
                      <span className="dash-account-card__label">EQUITY</span>
                      <span className={`dash-account-wide__value ${blown ? 'text-red' : ''}`}>${a.equity.toFixed(2)}</span>
                    </div>
                    <div className="dash-account-wide__stat">
                      <span className="dash-account-card__label">LEVERAGE</span>
                      <span className="dash-account-wide__value">1:{a.leverage}</span>
                    </div>
                    <div className="dash-account-wide__stat">
                      <span className="dash-account-card__label">P&L</span>
                      <span className={`dash-account-wide__value ${a.total_pnl >= 0 ? 'text-green' : 'text-red'}`}>${a.total_pnl.toFixed(2)}</span>
                    </div>
                    <div className="dash-account-wide__stat">
                      <span className="dash-account-card__label">TRADES</span>
                      <span className="dash-account-wide__value">{a.total_trades}</span>
                    </div>
                    <div className="dash-account-wide__stat">
                      <span className="dash-account-card__label">WIN RATE</span>
                      <span className="dash-account-wide__value">{a.win_rate}%</span>
                    </div>
                  </div>

                  <div className="dash-account-wide__actions">
                    {blown ? (
                      <button className="dash-btn-sm" onClick={() => navigate(`/dashboard/account-logs?account=${a.id}`)}>
                        VIEW LOGS
                      </button>
                    ) : (
                      <>
                        {a.is_funded ? (
                          <button className="laser-btn laser-btn--sm" onClick={() => navigate(`/trade/${a.id}`)}>
                            TRADE
                          </button>
                        ) : (
                          <button className="laser-btn laser-btn--sm" onClick={() => navigate('/dashboard/wallet')}>
                            FUND
                          </button>
                        )}
                        <button className="dash-btn-sm" onClick={() => navigate(`/dashboard/account-logs?account=${a.id}`)}>
                          LOGS
                        </button>
                        <button
                          className="dash-btn-sm dash-btn-sm--red"
                          onClick={async () => {
                            if (!confirm(`Delete account ${a.account_number}? ${a.balance > 0 ? `Transfer $${a.balance.toFixed(2)} to wallet first.` : ''}`)) return
                            try {
                              await accountsApi.delete(a.id)
                              loadAccounts()
                            } catch (err) {
                              alert(err.response?.data?.detail || 'Cannot delete account')
                            }
                          }}
                        >
                          DELETE
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })()}
    </div>
  )
}
