import { useState, useEffect } from 'react'
import { adminApi } from '../../services/admin'

export default function AdminTrades() {
  const [trades, setTrades] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('open')
  const [message, setMessage] = useState('')

  useEffect(() => { loadTrades() }, [page, statusFilter])

  const loadTrades = async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 50 }
      if (statusFilter) params.status = statusFilter
      const { data } = await adminApi.trades(params)
      setTrades(data.trades); setTotal(data.total)
    } catch { /* empty */ } finally { setLoading(false) }
  }

  const handleForceClose = async (tradeId) => {
    const price = prompt('Close price:')
    if (!price) return
    try {
      const { data } = await adminApi.closeTrade(tradeId, parseFloat(price))
      setMessage(`Trade closed. P&L: $${data.pnl}`)
      loadTrades()
    } catch { setMessage('Failed to close') }
  }

  const handleModify = async (tradeId) => {
    const field = prompt('Field to modify (open_price, spread_charged, swap_charged, commission_charged, pnl):')
    if (!field) return
    const value = prompt(`New value for ${field}:`)
    if (!value) return
    try {
      await adminApi.modifyTrade(tradeId, { [field]: parseFloat(value) })
      setMessage(`Trade ${field} modified`)
      loadTrades()
    } catch { setMessage('Modify failed') }
  }

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div><h2 className="dash-page__title">TRADE MANAGEMENT</h2><p className="dash-page__subtitle">View and modify all platform trades</p></div>
      </div>
      {message && <div className="dash-success">{message}</div>}
      <div className="dash-tabs">
        {['open', 'closed', 'pending', ''].map((s) => (
          <button key={s || 'all'} className={`dash-tab ${statusFilter === s ? 'dash-tab--active' : ''}`}
            onClick={() => { setStatusFilter(s); setPage(1) }}>{s ? s.toUpperCase() : 'ALL'}</button>
        ))}
      </div>
      {loading ? <div className="dash-loading">Loading...</div> : trades.length === 0 ? <div className="dash-empty"><p>No trades found.</p></div> : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead><tr><th>USER</th><th>INSTRUMENT</th><th>DIR</th><th>LOT</th><th>OPEN</th><th>CLOSE/CURRENT</th><th>P&L</th><th>SPREAD</th><th>SWAP</th><th>COMM</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.id} className={t.is_admin_modified ? 'dash-table__highlight' : ''}>
                  <td style={{ fontSize: 10, fontFamily: 'monospace' }}>{t.user_id.slice(-8)}</td>
                  <td><strong>{t.instrument}</strong></td>
                  <td><span className={`dash-direction dash-direction--${t.direction}`}>{t.direction.toUpperCase()}</span></td>
                  <td>{t.lot_size}</td>
                  <td>{t.open_price}</td>
                  <td>{t.close_price || t.current_price}</td>
                  <td className={t.pnl >= 0 ? 'text-green' : 'text-red'}>${t.pnl}</td>
                  <td>${t.spread_charged}</td>
                  <td>${t.swap_charged}</td>
                  <td>${t.commission_charged}</td>
                  <td><span className={`dash-status dash-status--${t.status}`}>{t.status.toUpperCase()}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {t.status === 'open' && <button className="dash-btn-sm dash-btn-sm--red" onClick={() => handleForceClose(t.id)}>CLOSE</button>}
                      <button className="dash-btn-sm" onClick={() => handleModify(t.id)}>MODIFY</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {total > 50 && (
        <div className="dash-pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>PREV</button>
          <span className="mono-label">PAGE {page}</span>
          <button disabled={page >= Math.ceil(total / 50)} onClick={() => setPage(p => p + 1)}>NEXT</button>
        </div>
      )}
    </div>
  )
}
