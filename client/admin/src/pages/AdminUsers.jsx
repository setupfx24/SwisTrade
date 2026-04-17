import { useState, useEffect } from 'react'
import { adminApi } from '../services/admin'
import api from '../services/api'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { loadUsers() }, [page])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 20 }
      if (search) params.search = search
      const { data } = await adminApi.users(params)
      setUsers(data.users)
      setTotal(data.total)
    } catch { /* empty */ } finally { setLoading(false) }
  }

  const viewUser = async (userId) => {
    setDetailLoading(true)
    try {
      const { data } = await adminApi.userDetail(userId)
      setSelectedUser(data)
    } catch { /* empty */ } finally { setDetailLoading(false) }
  }

  const handleAction = async (userId, action, reason) => {
    try {
      await adminApi.userAction(userId, { action, reason })
      setMessage(`Action '${action}' applied`)
      loadUsers()
      if (selectedUser) viewUser(userId)
    } catch { setMessage('Action failed') }
  }

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h2 className="dash-page__title">USER MANAGEMENT</h2>
          <p className="dash-page__subtitle">{total} total users</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="auth-form__input" style={{ width: 250 }} placeholder="Search by email or name..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadUsers()} />
          <button className="dash-btn-sm" onClick={loadUsers}>SEARCH</button>
        </div>
      </div>

      {message && <div className="dash-success">{message}</div>}

      {selectedUser ? (
        <div className="dash-create-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <h3 className="dash-create-card__title">USER DETAIL</h3>
            <button className="dash-btn-sm" onClick={() => setSelectedUser(null)}>CLOSE</button>
          </div>
          {detailLoading ? <div className="dash-loading">Loading...</div> : (
            <>
              <div className="admin-user-detail">
                <div className="dash-home__cards" style={{ marginBottom: 24 }}>
                  <div className="dash-card"><span className="dash-card__label">NAME</span><span className="dash-card__value" style={{ fontSize: 16 }}>{selectedUser.user.name}</span></div>
                  <div className="dash-card"><span className="dash-card__label">EMAIL</span><span className="dash-card__value" style={{ fontSize: 14 }}>{selectedUser.user.email}</span></div>
                  <div className="dash-card"><span className="dash-card__label">ROLE</span><span className="dash-card__value" style={{ fontSize: 14 }}>{selectedUser.user.role}</span></div>
                  <div className="dash-card"><span className="dash-card__label">KYC</span><span className="dash-card__value" style={{ fontSize: 14 }}>{selectedUser.user.kyc_status}</span></div>
                  <div className="dash-card"><span className="dash-card__label">WALLET</span><span className="dash-card__value text-green">${selectedUser.wallet_balance.toFixed(2)}</span></div>
                  <div className="dash-card"><span className="dash-card__label">ACCOUNTS</span><span className="dash-card__value">{selectedUser.accounts_count}</span></div>
                  <div className="dash-card"><span className="dash-card__label">TRADES</span><span className="dash-card__value">{selectedUser.total_trades}</span></div>
                  <div className="dash-card"><span className="dash-card__label">TOTAL P&L</span><span className={`dash-card__value ${selectedUser.total_pnl >= 0 ? 'text-green' : 'text-red'}`}>${selectedUser.total_pnl.toFixed(2)}</span></div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                  {!selectedUser.user.is_blocked ? (
                    <button className="dash-btn-sm dash-btn-sm--red" onClick={() => handleAction(selectedUser.user.id, 'block', prompt('Block reason:'))}>BLOCK USER</button>
                  ) : (
                    <button className="dash-btn-sm" onClick={() => handleAction(selectedUser.user.id, 'unblock')}>UNBLOCK USER</button>
                  )}
                  {!selectedUser.user.is_trading_restricted ? (
                    <button className="dash-btn-sm dash-btn-sm--red" onClick={() => handleAction(selectedUser.user.id, 'restrict_trading')}>RESTRICT TRADING</button>
                  ) : (
                    <button className="dash-btn-sm" onClick={() => handleAction(selectedUser.user.id, 'unrestrict_trading')}>ALLOW TRADING</button>
                  )}
                  {selectedUser.user.kyc_status === 'pending' && (
                    <>
                      <button className="dash-btn-sm" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}
                        onClick={() => handleAction(selectedUser.user.id, 'approve_kyc')}>APPROVE KYC</button>
                      <button className="dash-btn-sm dash-btn-sm--red"
                        onClick={() => handleAction(selectedUser.user.id, 'reject_kyc', prompt('Rejection reason:'))}>REJECT KYC</button>
                    </>
                  )}

                  {/* Fund Actions */}
                  <button className="dash-btn-sm" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}
                    onClick={async () => {
                      const amt = prompt('Amount to ADD to wallet:')
                      if (!amt) return
                      const note = prompt('Note (optional):') || ''
                      try {
                        const { data } = await api.post('/admin/users/add-fund', { user_id: selectedUser.user.id, amount: parseFloat(amt), note })
                        setMessage(data.message)
                        viewUser(selectedUser.user.id)
                      } catch (err) { setMessage(err.response?.data?.detail || 'Failed') }
                    }}>+ ADD FUND</button>

                  <button className="dash-btn-sm dash-btn-sm--red"
                    onClick={async () => {
                      const amt = prompt('Amount to DEDUCT from wallet:')
                      if (!amt) return
                      const note = prompt('Reason (optional):') || ''
                      try {
                        const { data } = await api.post('/admin/users/deduct-fund', { user_id: selectedUser.user.id, amount: parseFloat(amt), note })
                        setMessage(data.message)
                        viewUser(selectedUser.user.id)
                      } catch (err) { setMessage(err.response?.data?.detail || 'Failed') }
                    }}>- DEDUCT FUND</button>

                  <button className="dash-btn-sm" style={{ color: '#ffaa00', borderColor: '#ffaa00' }}
                    onClick={async () => {
                      if (!confirm(`Login as ${selectedUser.user.email}? This action is logged.`)) return
                      try {
                        const { data } = await api.post(`/admin/users/${selectedUser.user.id}/login-as`)
                        // Open user dashboard in new tab with impersonation token
                        const userUrl = `http://localhost:5173/dashboard?token=${data.access_token}`
                        window.open(userUrl, '_blank')
                        setMessage(`Logged in as ${selectedUser.user.email} in new tab`)
                      } catch (err) { setMessage(err.response?.data?.detail || 'Failed') }
                    }}>LOGIN AS USER</button>
                </div>

                {selectedUser.accounts.length > 0 && (
                  <>
                    <h4 className="mono-label" style={{ marginBottom: 12 }}>ACCOUNTS</h4>
                    <div className="dash-table-wrap" style={{ marginBottom: 24 }}>
                      <table className="dash-table">
                        <thead><tr><th>TYPE</th><th>NUMBER</th><th>BALANCE</th><th>EQUITY</th><th>P&L</th></tr></thead>
                        <tbody>
                          {selectedUser.accounts.map((a) => (
                            <tr key={a.id}><td>{a.type}</td><td>{a.number}</td><td>${a.balance.toFixed(2)}</td><td>${a.equity.toFixed(2)}</td><td className={a.total_pnl >= 0 ? 'text-green' : 'text-red'}>${a.total_pnl}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {selectedUser.recent_sessions?.length > 0 && (
                  <>
                    <h4 className="mono-label" style={{ marginBottom: 12 }}>RECENT LOGINS</h4>
                    <div className="dash-table-wrap">
                      <table className="dash-table">
                        <thead><tr><th>DEVICE</th><th>IP</th><th>ACTIVE</th><th>DATE</th></tr></thead>
                        <tbody>
                          {selectedUser.recent_sessions.map((s, i) => (
                            <tr key={i}><td style={{ fontSize: 11 }}>{s.device}</td><td>{s.ip}</td><td>{s.active ? 'YES' : 'NO'}</td><td>{new Date(s.created_at).toLocaleString()}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          {loading ? <div className="dash-loading">Loading users...</div> : (
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead><tr><th>NAME</th><th>EMAIL</th><th>ROLE</th><th>KYC</th><th>STATUS</th><th>JOINED</th><th>ACTION</th></tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td><span className="dash-badge">{u.role}</span></td>
                      <td><span className={`dash-status dash-status--${u.kyc_status === 'approved' ? 'approved' : u.kyc_status === 'pending' ? 'pending' : 'rejected'}`}>{u.kyc_status}</span></td>
                      <td>{u.is_blocked ? <span className="text-red">BLOCKED</span> : u.is_trading_restricted ? <span style={{ color: '#ffaa00' }}>RESTRICTED</span> : <span className="text-green">ACTIVE</span>}</td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td><button className="dash-btn-sm" onClick={() => viewUser(u.id)}>VIEW</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {total > 20 && (
            <div className="dash-pagination">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>PREV</button>
              <span className="mono-label">PAGE {page}</span>
              <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>NEXT</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
