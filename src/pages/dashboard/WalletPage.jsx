/**
 * SwisTrade — Wallet Dashboard Page
 * Deposit, withdraw, transfer, transaction history.
 */

import { useState, useEffect } from 'react'
import { walletApi, accountsApi } from '../../services/dashboard'

export default function WalletPage() {
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [accounts, setAccounts] = useState([])
  const [memoData, setMemoData] = useState(null)
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Form states
  const [depositAmount, setDepositAmount] = useState('')
  const [depositMethod, setDepositMethod] = useState('crypto_usdt')
  const [depositHash, setDepositHash] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawMethod, setWithdrawMethod] = useState('crypto_usdt')
  const [transferAmount, setTransferAmount] = useState('')
  const [transferDirection, setTransferDirection] = useState('wallet_to_account')
  const [transferAccountId, setTransferAccountId] = useState('')

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    try {
      const [w, t, a, m] = await Promise.all([
        walletApi.get(), walletApi.transactions(), accountsApi.list(), walletApi.getMemoTag(),
      ])
      setWallet(w.data)
      setTransactions(t.data.transactions)
      setAccounts(a.data.accounts)
      setMemoData(m.data)
    } catch { /* empty */ } finally { setLoading(false) }
  }

  const handleDeposit = async (e) => {
    e.preventDefault(); setActionLoading(true); setError(''); setMessage('')
    try {
      await walletApi.deposit({ amount: parseFloat(depositAmount), method: depositMethod, crypto_txn_hash: depositHash, memo_tag: memoData?.memo_tag })
      setMessage('Deposit request submitted! Admin will verify and credit your wallet.')
      setDepositAmount(''); setDepositHash('')
      loadAll()
    } catch (err) { setError(err.response?.data?.detail || 'Deposit failed') }
    finally { setActionLoading(false) }
  }

  const handleWithdraw = async (e) => {
    e.preventDefault(); setActionLoading(true); setError(''); setMessage('')
    try {
      await walletApi.withdraw({ amount: parseFloat(withdrawAmount), method: withdrawMethod })
      setMessage('Withdrawal request submitted! Processing within 1 hour for crypto.')
      setWithdrawAmount('')
      loadAll()
    } catch (err) { setError(err.response?.data?.detail || 'Withdrawal failed') }
    finally { setActionLoading(false) }
  }

  const handleTransfer = async (e) => {
    e.preventDefault(); setActionLoading(true); setError(''); setMessage('')
    try {
      await walletApi.transfer({ amount: parseFloat(transferAmount), direction: transferDirection, account_id: transferAccountId })
      setMessage('Transfer completed!')
      setTransferAmount('')
      loadAll()
    } catch (err) { setError(err.response?.data?.detail || 'Transfer failed') }
    finally { setActionLoading(false) }
  }

  if (loading) return <div className="dash-loading">Loading wallet...</div>

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h2 className="dash-page__title">WALLET</h2>
          <p className="dash-page__subtitle">Manage your funds</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="dash-wallet-balance">
        <div className="dash-wallet-balance__amount">${wallet?.balance?.toFixed(2) || '0.00'}</div>
        <div className="dash-wallet-balance__label">AVAILABLE BALANCE</div>
        <div className="dash-wallet-balance__stats">
          <div><span className="mono-label">DEPOSITED</span><span>${wallet?.total_deposited?.toFixed(2)}</span></div>
          <div><span className="mono-label">WITHDRAWN</span><span>${wallet?.total_withdrawn?.toFixed(2)}</span></div>
          <div><span className="mono-label">TRANSFERRED</span><span>${wallet?.total_transferred?.toFixed(2)}</span></div>
        </div>
      </div>

      {message && <div className="dash-success">{message}</div>}
      {error && <div className="auth-form__error">{error}</div>}

      {/* Tabs */}
      <div className="dash-tabs">
        {['overview', 'deposit', 'withdraw', 'transfer'].map((t) => (
          <button key={t} className={`dash-tab ${tab === t ? 'dash-tab--active' : ''}`}
            onClick={() => { setTab(t); setError(''); setMessage('') }}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === 'deposit' && (
        <div className="dash-create-card">
          <h3 className="dash-create-card__title">DEPOSIT FUNDS</h3>
          {memoData && (
            <div className="dash-memo-box">
              <p className="mono-label">YOUR MEMO TAG: <strong style={{ color: 'var(--accent)', fontSize: 14 }}>{memoData.memo_tag}</strong></p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>{memoData.instructions}</p>
            </div>
          )}
          <form onSubmit={handleDeposit} className="auth-form" style={{ maxWidth: 500 }}>
            <div className="auth-form__group">
              <label className="auth-form__label">AMOUNT (USD)</label>
              <input type="number" className="auth-form__input" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="1000" min="1" required />
            </div>
            <div className="auth-form__group">
              <label className="auth-form__label">METHOD</label>
              <select className="auth-form__input" value={depositMethod} onChange={(e) => setDepositMethod(e.target.value)}>
                <option value="crypto_usdt">USDT (TRC20/ERC20)</option>
                <option value="crypto_btc">Bitcoin (BTC)</option>
                <option value="crypto_eth">Ethereum (ETH)</option>
                <option value="bank_wire">Bank Wire Transfer</option>
              </select>
            </div>
            {depositMethod.startsWith('crypto') && (
              <div className="auth-form__group">
                <label className="auth-form__label">TRANSACTION HASH</label>
                <input type="text" className="auth-form__input" value={depositHash} onChange={(e) => setDepositHash(e.target.value)} placeholder="0x..." />
              </div>
            )}
            <button type="submit" className="laser-btn" disabled={actionLoading}>{actionLoading ? 'SUBMITTING...' : 'SUBMIT DEPOSIT'}</button>
          </form>
        </div>
      )}

      {tab === 'withdraw' && (
        <div className="dash-create-card">
          <h3 className="dash-create-card__title">WITHDRAW FUNDS</h3>
          <form onSubmit={handleWithdraw} className="auth-form" style={{ maxWidth: 500 }}>
            <div className="auth-form__group">
              <label className="auth-form__label">AMOUNT (USD)</label>
              <input type="number" className="auth-form__input" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="500" min="1" max={wallet?.balance} required />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Available: ${wallet?.balance?.toFixed(2)}</span>
            </div>
            <div className="auth-form__group">
              <label className="auth-form__label">METHOD</label>
              <select className="auth-form__input" value={withdrawMethod} onChange={(e) => setWithdrawMethod(e.target.value)}>
                <option value="crypto_usdt">USDT</option>
                <option value="crypto_btc">Bitcoin</option>
                <option value="crypto_eth">Ethereum</option>
                <option value="bank_wire">Bank Wire</option>
              </select>
            </div>
            <button type="submit" className="laser-btn" disabled={actionLoading}>{actionLoading ? 'SUBMITTING...' : 'REQUEST WITHDRAWAL'}</button>
          </form>
        </div>
      )}

      {tab === 'transfer' && (
        <div className="dash-create-card">
          <h3 className="dash-create-card__title">INTERNAL TRANSFER</h3>
          <form onSubmit={handleTransfer} className="auth-form" style={{ maxWidth: 500 }}>
            <div className="auth-form__group">
              <label className="auth-form__label">DIRECTION</label>
              <select className="auth-form__input" value={transferDirection} onChange={(e) => setTransferDirection(e.target.value)}>
                <option value="wallet_to_account">Wallet → Trading Account</option>
                <option value="account_to_wallet">Trading Account → Wallet</option>
              </select>
            </div>
            <div className="auth-form__group">
              <label className="auth-form__label">TRADING ACCOUNT</label>
              <select className="auth-form__input" value={transferAccountId} onChange={(e) => setTransferAccountId(e.target.value)} required>
                <option value="">Select account...</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.account_number} ({a.account_type.toUpperCase()}) - ${a.balance.toFixed(2)}</option>
                ))}
              </select>
            </div>
            <div className="auth-form__group">
              <label className="auth-form__label">AMOUNT (USD)</label>
              <input type="number" className="auth-form__input" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} placeholder="500" min="1" required />
            </div>
            <button type="submit" className="laser-btn" disabled={actionLoading}>{actionLoading ? 'TRANSFERRING...' : 'TRANSFER'}</button>
          </form>
        </div>
      )}

      {/* Transaction History */}
      {(tab === 'overview') && (
        <>
          <h3 className="dash-home__section-title" style={{ marginTop: 32 }}>TRANSACTION HISTORY</h3>
          {transactions.length === 0 ? (
            <div className="dash-empty"><p>No transactions yet.</p></div>
          ) : (
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>TYPE</th><th>METHOD</th><th>AMOUNT</th><th>STATUS</th><th>DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td><span className="dash-badge">{t.type.toUpperCase()}</span></td>
                      <td>{t.method.replace('_', ' ').toUpperCase()}</td>
                      <td>${t.amount.toFixed(2)}</td>
                      <td><span className={`dash-status dash-status--${t.status}`}>{t.status.toUpperCase()}</span></td>
                      <td>{new Date(t.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
