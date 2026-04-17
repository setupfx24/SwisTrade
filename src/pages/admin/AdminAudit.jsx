import { useState, useEffect } from 'react'
import { adminApi } from '../../services/admin'

export default function AdminAudit() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadLogs() }, [page])
  const loadLogs = async () => {
    setLoading(true)
    try { const { data } = await adminApi.auditLog({ page, per_page: 50 }); setLogs(data.logs); setTotal(data.total) }
    catch { /* empty */ } finally { setLoading(false) }
  }

  return (
    <div className="dash-page">
      <div className="dash-page__header"><div><h2 className="dash-page__title">AUDIT LOG</h2><p className="dash-page__subtitle">All admin actions are recorded</p></div></div>
      {loading ? <div className="dash-loading">Loading...</div> : logs.length === 0 ? <div className="dash-empty"><p>No audit logs yet.</p></div> : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead><tr><th>ADMIN</th><th>ACTION</th><th>ENTITY</th><th>CHANGES</th><th>TIME</th></tr></thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td style={{ fontSize: 10, fontFamily: 'monospace' }}>{l.admin_id.slice(-8)}</td>
                  <td><span className="dash-badge">{l.action_type}</span></td>
                  <td>{l.entity_type} ({l.entity_id.slice(-8)})</td>
                  <td style={{ fontSize: 11, maxWidth: 200, overflow: 'hidden' }}>{JSON.stringify(l.changes).slice(0, 100)}</td>
                  <td>{new Date(l.timestamp).toLocaleString()}</td>
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
