import { Link } from 'react-router-dom'
import ScrollReveal from '../components/ScrollReveal'
import AnimatedGradient from '../components/ui/AnimatedGradient'
import Sneak from '../components/ui/Sneak'

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

const instruments = [
  { icon: '\u20AC$', pair: 'EUR/USD', sub: 'EUR/USD', spread: '0.06 pips', leverage: '1:500' },
  { icon: '\uD83E\uDD47', pair: 'XAU/USD', sub: 'XAU/USD', spread: '0.12 pips', leverage: '1:200' },
  { icon: '\u20BF', pair: 'BTC/USD', sub: 'BTC/USD', spread: '10 pips', leverage: '1:100' },
  { icon: '\u00A3$', pair: 'GBP/USD', sub: 'GBP/USD', spread: '0.08 pips', leverage: '1:500' },
]

const reviews = [
  {
    text: '"The 0.06 pip spreads on XAU/USD transformed my scalping strategy. Execution is flawless even during NFP releases."',
    initials: 'AK',
    name: 'Alex K.',
    role: 'Forex Scalper, London',
  },
  {
    text: '"The 1-hour crypto withdrawal guarantee is a game changer. SwisTrade\'s speed on digital assets is unmatched in the industry."',
    initials: 'MV',
    name: 'Marco V.',
    role: 'Crypto Trader, Dubai',
  },
  {
    text: '"We launched our brokerage using their white-label. The setup was minimal compared to the institutional-grade tech we received."',
    initials: 'SJ',
    name: 'Sarah J.',
    role: 'White-Label Partner',
  },
]

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <AnimatedGradient
          config={{
            preset: 'custom',
            color1: '#050505',
            color2: '#BFFF00',
            color3: '#050505',
            rotation: -30,
            proportion: 15,
            scale: 0.35,
            speed: 15,
            distortion: 3,
            swirl: 45,
            swirlIterations: 8,
            softness: 85,
            offset: -200,
            shape: 'Edge',
            shapeSize: 40,
          }}
          noise={{ opacity: 0.12, scale: 1.5 }}
          style={{ opacity: 0.6 }}
        />

        <Sneak
          text="&lt;40MS"
          className="hero__sneak"
        />

        <div className="hero__content">
          <div className="hero__meta-top">
            <span className="hero__badge">
              <span className="status-dot" />
              SEGREGATED FUNDS
            </span>
            <span className="hero__badge">SSL ENCRYPTED</span>
            <span className="hero__badge">
              <span className="status-dot" />
              LIVE TRADING CONDITIONS
            </span>
          </div>

          <h1 className="hero__headline">
            EXECUTE ORDERS IN <span className="accent">&lt;40MS</span>
            <span className="hero__typing-cursor" />
          </h1>

          <p className="hero__desc">
            Experience zero-latency execution on forex, crypto, and XAU/USD metals. Ultra-low spreads from 0.06 pips with crypto withdrawals processed in under 1 hour.
          </p>

          <div className="hero__actions">
            <a href="#" className="laser-btn">OPEN LIVE ACCOUNT</a>
            <a href="#" className="laser-btn laser-btn--outline">TRY DEMO</a>
          </div>
        </div>
      </section>

      {/* Stats */}
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

      {/* Why Section */}
      <section className="why-section">
        <div className="why-section__header">
          <span className="mono-label">WHY SWISTRADE</span>
          <h2 className="section-title">WHY TRADERS CHOOSE SWISTRADE</h2>
          <p className="section-subtitle">
            Access institutional-grade trading infrastructure with the flexibility and speed your strategies demand.
          </p>
        </div>

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

      {/* Markets Section */}
      <section className="markets-section">
        <div className="markets-section__inner">
          <div>
            <span className="mono-label">GLOBAL MARKETS</span>
            <h2 className="section-title" style={{ marginTop: 16 }}>
              TRADE GLOBAL MARKETS WITH COMPETITIVE CONDITIONS
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 16, lineHeight: 1.8 }}>
              Access deep liquidity across multiple asset classes. All strategies permitted including scalping, hedging, and algorithmic trading.
            </p>
            <ul className="markets-section__list">
              <li>Leverage up to 1:500 on forex pairs</li>
              <li>No requotes, deep market depth</li>
              <li>Swap-free Islamic accounts available</li>
              <li>Minimum deposit from $25</li>
            </ul>
            <a href="#" className="laser-btn">START TRADING</a>
          </div>

          <div>
            <div className="mono-label" style={{ marginBottom: 24 }}>POPULAR INSTRUMENTS</div>
            <table className="instruments-table">
              <thead>
                <tr>
                  <th className="instruments-table__header">INSTRUMENT</th>
                  <th className="instruments-table__header">SPREAD</th>
                  <th className="instruments-table__header">LEVERAGE</th>
                </tr>
              </thead>
              <tbody>
                {instruments.map((inst) => (
                  <tr key={inst.pair} className="instruments-table__row">
                    <td className="instruments-table__cell">
                      <div className="instruments-table__pair">
                        <div className="instruments-table__pair-icon">{inst.icon}</div>
                        <div>
                          <div className="instruments-table__pair-name">{inst.pair}</div>
                        </div>
                      </div>
                    </td>
                    <td className="instruments-table__cell">{inst.spread}</td>
                    <td className="instruments-table__cell">{inst.leverage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="reviews-section">
        <div className="reviews-section__header">
          <span className="mono-label">TESTIMONIALS</span>
          <h2 className="section-title">TRUSTED BY TRADERS WORLDWIDE</h2>
          <p className="section-subtitle">
            See what our community has to say about trading with SwisTrade.
          </p>
        </div>

        <div className="reviews-grid">
          {reviews.map((r) => (
            <ScrollReveal key={r.name}>
              <div className="review-card">
                <p className="review-card__text">{r.text}</p>
                <div className="review-card__author">
                  <div className="review-card__avatar">{r.initials}</div>
                  <div>
                    <div className="review-card__name">{r.name}</div>
                    <div className="review-card__role">{r.role}</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="final-cta__inner">
          <h2 className="section-title">READY TO TRADE WITH INSTITUTIONAL SPEED?</h2>
          <p className="section-subtitle">
            Join thousands of traders who trust SwisTrade for lightning-fast execution, ultra-low spreads, and reliable crypto payouts.
          </p>
          <div className="final-cta__actions">
            <a href="#" className="laser-btn">OPEN LIVE ACCOUNT</a>
            <Link to="/" className="laser-btn laser-btn--outline">SIGN IN</Link>
          </div>
        </div>
      </section>
    </>
  )
}
