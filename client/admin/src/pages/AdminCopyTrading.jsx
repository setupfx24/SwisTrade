import { useState, useEffect } from 'react'
import { adminApi } from '../services/admin'

export default function AdminCopyTrading() {
  const [masters, setMasters] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => { loadMasters() }, [])
  const loadMasters = async () => { try { const { data } = await adminApi.copyMasters(); setMasters(data) } catch { /* empty */ } finally { setLoading(false) } }

  const handleReview = async (id, action) => {
    try { await adminApi.reviewMaster(id, action); setMessage(`Master ${action}d`); loadMasters() } catch { /* empty */ }
  }

  return (
    <div className="dash-page">
      <div className="dash-page__header"><div><h2 className="dash-page__title">COPY TRADING / PAMM</h2><p className="dash-page__subtitle">Manage master applications and PAMM accounts</p></div></div>
      {message && <div className="dash-success">{message}</div>}
      {loading ? <div className="dash-loading">Loading...</div> : masters.length === 0 ? <div className="dash-empty"><p>No master applications.</p></div> : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead><tr><th>NAME</th><th>EMAIL</th><th>STATUS</th><th>SUBSCRIBERS</th><th>P&L</th><th>CHARGE/TRADE</th><th>ACTIONS</th></tr></thead>
            <tbody>
              {masters.map((m) => (
                <tr key={m.id}>
                  <td><strong>{m.user_name}</strong></td><td>{m.user_email}</td>
                  <td><span className={`dash-status dash-status--${m.status}`}>{m.status.toUpperCase()}</span></td>
                  <td>{m.subscriber_count}</td><td className={m.total_pnl >= 0 ? 'text-green' : 'text-red'}>${m.total_pnl}</td><td>${m.charge_per_trade}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {m.status === 'pending' && <><button className="dash-btn-sm" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }} onClick={() => handleReview(m.id, 'approve')}>APPROVE</button><button className="dash-btn-sm dash-btn-sm--red" onClick={() => handleReview(m.id, 'reject')}>REJECT</button></>}
                      {m.status === 'approved' && <button className="dash-btn-sm dash-btn-sm--red" onClick={() => handleReview(m.id, 'block')}>BLOCK</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
