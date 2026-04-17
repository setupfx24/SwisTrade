import { useState, useEffect } from 'react'
import { adminApi } from '../services/admin'

export default function AdminRisk() {
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadPositions() }, [])
  const loadPositions = async () => {
    try { const { data } = await adminApi.netPositions(); setPositions(data) }
    catch { /* empty */ } finally { setLoading(false) }
  }

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div><h2 className="dash-page__title">RISK MANAGEMENT</h2><p className="dash-page__subtitle">Net positions across all instruments</p></div>
        <button className="dash-btn-sm" onClick={loadPositions}>REFRESH</button>
      </div>
      {loading ? <div className="dash-loading">Loading...</div> : positions.length === 0 ? <div className="dash-empty"><p>No open positions.</p></div> : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead><tr><th>INSTRUMENT</th><th>BUY LOTS</th><th>SELL LOTS</th><th>NET LOTS</th><th>BUY COUNT</th><th>SELL COUNT</th><th>NET P&L</th></tr></thead>
            <tbody>
              {positions.map((p) => (
                <tr key={p.instrument}>
                  <td><strong>{p.instrument}</strong></td>
                  <td className="text-green">{p.buy_lots}</td>
                  <td className="text-red">{p.sell_lots}</td>
                  <td className={p.net_lots >= 0 ? 'text-green' : 'text-red'}>{p.net_lots}</td>
                  <td>{p.buy_count}</td><td>{p.sell_count}</td>
                  <td className={p.net_pnl >= 0 ? 'text-green' : 'text-red'}>${p.net_pnl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
