/**
 * SwisTrade — Dashboard Home
 * Overview page with account summary cards.
 */

import { useAuth } from '../../hooks/useAuth'

export default function DashboardHome() {
  const { user } = useAuth()

  const overviewCards = [
    { label: 'WALLET BALANCE', value: '$0.00', icon: 'wallet' },
    { label: 'TRADING ACCOUNTS', value: '0', icon: 'accounts' },
    { label: 'OPEN TRADES', value: '0', icon: 'trades' },
    { label: 'TOTAL P&L', value: '$0.00', icon: 'pnl' },
  ]

  return (
    <div className="dash-home">
      <div className="dash-home__welcome">
        <h2 className="dash-home__greeting">
          WELCOME BACK, <span className="accent">{user?.name?.toUpperCase() || 'TRADER'}</span>
        </h2>
        <p className="dash-home__subtitle">
          Here's your trading overview. Open an account to get started.
        </p>
      </div>

      <div className="dash-home__cards">
        {overviewCards.map((card) => (
          <div key={card.label} className="dash-card">
            <span className="dash-card__label">{card.label}</span>
            <span className="dash-card__value">{card.value}</span>
          </div>
        ))}
      </div>

      <div className="dash-home__quick-actions">
        <h3 className="dash-home__section-title">QUICK ACTIONS</h3>
        <div className="dash-home__action-grid">
          <button className="dash-action-btn">
            <span className="dash-action-btn__icon">+</span>
            <span className="dash-action-btn__label">OPEN ACCOUNT</span>
          </button>
          <button className="dash-action-btn">
            <span className="dash-action-btn__icon">$</span>
            <span className="dash-action-btn__label">DEPOSIT FUNDS</span>
          </button>
          <button className="dash-action-btn">
            <span className="dash-action-btn__icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </span>
            <span className="dash-action-btn__label">START TRADING</span>
          </button>
          <button className="dash-action-btn">
            <span className="dash-action-btn__icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </span>
            <span className="dash-action-btn__label">VERIFY KYC</span>
          </button>
        </div>
      </div>

      {user?.kyc_status === 'not_submitted' && (
        <div className="dash-home__alert">
          <span className="dash-home__alert-icon">!</span>
          <div>
            <strong>COMPLETE YOUR KYC</strong>
            <p>Upload your identity documents to unlock full trading features.</p>
          </div>
        </div>
      )}
    </div>
  )
}
