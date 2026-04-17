import ScrollReveal from '../components/ScrollReveal'

const platforms = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: 'DESKTOP TERMINAL',
    desc: 'Full-featured trading platform with advanced charting, automated trading, and customizable workspaces.',
    features: ['100+ Chart Tools', '50+ Indicators', 'Algorithmic Trading', 'Custom Workspaces'],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
    title: 'MOBILE TRADING',
    desc: 'Trade on the go with our powerful mobile app. Full functionality in your pocket.',
    features: ['Real-time Quotes', 'Push Notifications', 'One-Click Trading', 'Biometric Login'],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
    title: 'WEB PLATFORM',
    desc: 'Access your account from any browser. No download required, instant access.',
    features: ['Browser-based', 'No Installation', 'Full Features', 'Secure Trading'],
  },
]

const platformFeatures = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    title: 'LIGHTNING FAST',
    desc: 'Execute trades in under 40ms with our optimized infrastructure.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: 'ADVANCED CHARTING',
    desc: '100+ drawing tools and 50+ technical indicators.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'SECURE TRADING',
    desc: 'Bank-level security with 2FA and encryption.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" /><rect x="8" y="7" width="8" height="6" rx="1" />
      </svg>
    ),
    title: 'MULTI-MONITOR',
    desc: 'Support for up to 4 monitors with customizable layouts.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
    title: 'MOBILE SYNC',
    desc: 'Seamless synchronization across all devices.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
    title: 'GLOBAL MARKETS',
    desc: 'Access 50+ forex pairs, crypto, metals, and indices.',
  },
]

export default function Platforms() {
  return (
    <>
      <section className="page-hero">
        <span className="mono-label">CROSS-PLATFORM TRADING</span>
        <h1 className="section-title">PROFESSIONAL TRADING TERMINALS FOR ALL TRADERS</h1>
        <p className="section-subtitle">
          Access institutional-grade platforms on desktop, web, and mobile. 100+ chart tools, 50+ indicators, and execution speeds under 40ms.
        </p>
      </section>

      <div className="platform-cards">
        {platforms.map((p) => (
          <ScrollReveal key={p.title}>
            <div className="platform-card">
              <div className="platform-card__icon">{p.icon}</div>
              <h3 className="platform-card__title">{p.title}</h3>
              <p className="platform-card__desc">{p.desc}</p>
              <ul className="platform-card__features">
                {p.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <section className="why-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="why-section__header">
          <span className="mono-label">CAPABILITIES</span>
          <h2 className="section-title">PLATFORM FEATURES</h2>
          <p className="section-subtitle">
            Everything you need for professional trading, built by traders for traders.
          </p>
        </div>

        <div className="bento-grid">
          {platformFeatures.map((f) => (
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
          <h2 className="section-title">READY TO START TRADING?</h2>
          <p className="section-subtitle">
            Experience professional trading platforms with institutional-grade features.
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
