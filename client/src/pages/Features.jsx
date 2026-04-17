import { Link } from 'react-router-dom'
import ScrollReveal from '../components/ScrollReveal'

const stats = [
  { label: 'RAW SPREADS FROM', value: '0.06', unit: 'PIPS' },
  { label: 'EXECUTION SPEED', value: '<40', unit: 'MS' },
  { label: 'COMMISSION PER LOT', value: '$2', unit: 'FLAT' },
  { label: 'CRYPTO WITHDRAWALS', value: '\u22641', unit: 'HOUR' },
]

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    title: 'ZERO LATENCY EXECUTION',
    desc: 'Orders processed in under 40ms with direct market access to tier-1 liquidity providers worldwide.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
    title: 'INSTANT CRYPTO FUNDING',
    desc: 'Deposit via BTC, ETH, or USDT instantly. Withdrawals processed within 1 hour, 24/7.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: 'MULTI-ASSET TRADING',
    desc: 'Trade 50+ forex pairs, 20+ cryptocurrencies, XAU/USD metals, indices, and global stocks.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: 'CROSS-PLATFORM ACCESS',
    desc: 'Trade on desktop, web, or mobile with full MT4/MT5 compatibility and native SwisTrade apps.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'NEGATIVE BALANCE PROTECTION',
    desc: 'Your account is protected from going below zero. Trade with confidence and controlled risk.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    title: '24/7 EXPERT SUPPORT',
    desc: 'Dedicated support team available around the clock. Reach us at +1 (908) 228-0305.',
  },
]

export default function Features() {
  return (
    <>
      <section className="page-hero">
        <span className="mono-label">PLATFORM FEATURES</span>
        <h1 className="section-title">WHY TRADERS CHOOSE SWISTRADE</h1>
        <p className="section-subtitle">
          Access institutional-grade trading infrastructure with the flexibility and speed your strategies demand.
        </p>
      </section>

      <ScrollReveal>
        <div className="stats">
          <div className="stats__grid">
            {stats.map((s) => (
              <div key={s.label} className="stats__item">
                <div className="stats__label">{s.label}</div>
                <div className="stats__value">{s.value}</div>
                <div className="stats__unit">{s.unit}</div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      <section className="why-section">
        <div className="bento-grid">
          {features.map((f) => (
            <ScrollReveal key={f.title}>
              <div className="bento-card">
                <div className="bento-card__icon">{f.icon}</div>
                <h3 className="bento-card__title">{f.title}</h3>
                <p className="bento-card__desc">{f.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <div className="final-cta__inner">
          <h2 className="section-title">READY TO TRADE WITH INSTITUTIONAL SPEED?</h2>
          <p className="section-subtitle">
            Join thousands of traders who trust SwisTrade for lightning-fast execution, ultra-low spreads, and reliable crypto payouts.
          </p>
          <div className="final-cta__actions">
            <a href="#" className="laser-btn">OPEN LIVE ACCOUNT</a>
            <a href="#" className="laser-btn laser-btn--outline">TRY DEMO</a>
          </div>
        </div>
      </section>
    </>
  )
}
