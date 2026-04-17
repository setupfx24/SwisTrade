import { useState, useEffect } from 'react'
import { adminApi } from '../../services/admin'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.dashboard().then(({ data }) => setStats(data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="dash-loading">Loading dashboard...</div>
  if (!stats) return <div className="dash-empty"><p>Failed to load dashboard</p></div>

  const cards = [
    { label: 'TOTAL USERS', value: stats.users.total },
    { label: 'ACTIVE USERS', value: stats.users.active },
    { label: 'BLOCKED USERS', value: stats.users.blocked, red: true },
    { label: 'TOTAL ACCOUNTS', value: stats.accounts.total },
    { label: 'WALLET BALANCE (ALL)', value: `$${stats.finances.total_wallet_balance.toLocaleString()}`, green: true },
    { label: 'TOTAL DEPOSITED', value: `$${stats.finances.total_deposited.toLocaleString()}`, green: true },
    { label: 'TOTAL WITHDRAWN', value: `$${stats.finances.total_withdrawn.toLocaleString()}` },
    { label: 'OPEN TRADES', value: stats.trades.open },
    { label: 'CLOSED TRADES', value: stats.trades.closed },
    { label: 'PROP ACTIVE', value: stats.prop.active },
    { label: 'PROP FUNDED', value: stats.prop.passed, green: true },
    { label: 'PROP BLOWN', value: stats.prop.blown, red: true },
    { label: 'ACTIVE IBS', value: stats.business.total_ibs },
    { label: 'ACTIVE CHALLENGES', value: stats.challenges.active },
  ]

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h2 className="dash-page__title">ADMIN DASHBOARD</h2>
          <p className="dash-page__subtitle">Platform overview</p>
        </div>
      </div>
      <div className="admin-stats-grid">
        {cards.map((c) => (
          <div key={c.label} className="dash-card">
            <span className="dash-card__label">{c.label}</span>
            <span className={`dash-card__value ${c.green ? 'text-green' : ''} ${c.red ? 'text-red' : ''}`}>{c.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
