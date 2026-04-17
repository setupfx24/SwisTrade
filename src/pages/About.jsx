import ScrollReveal from '../components/ScrollReveal'

const values = [
  { title: 'TRADER-FIRST', desc: 'Every decision we make starts with what\'s best for our traders.' },
  { title: 'INNOVATION', desc: 'Continuously pushing boundaries with cutting-edge technology.' },
  { title: 'TRUST', desc: 'Building long-term relationships through transparency and reliability.' },
  { title: 'GLOBAL ACCESS', desc: 'Making institutional-grade trading available to everyone, everywhere.' },
]

const numbers = [
  { value: '150+', label: 'COUNTRIES SERVED' },
  { value: '50K+', label: 'ACTIVE TRADERS' },
  { value: '$500M+', label: 'DAILY VOLUME' },
  { value: '99.9%', label: 'UPTIME' },
]

const team = [
  { initials: 'AC', name: 'ALEX CHEN', role: 'CEO & CO-FOUNDER', desc: 'Former Goldman Sachs trader with 15+ years in institutional trading.' },
  { initials: 'SJ', name: 'SARAH JOHNSON', role: 'CTO & CO-FOUNDER', desc: 'Tech lead at Bloomberg, expert in low-latency trading systems.' },
  { initials: 'MR', name: 'MICHAEL ROBERTS', role: 'HEAD OF COMPLIANCE', desc: 'Former SEC regulator, ensures full regulatory compliance globally.' },
]

export default function About() {
  return (
    <>
      <section className="page-hero">
        <span className="mono-label">ABOUT SWISTRADE</span>
        <h1 className="section-title">REVOLUTIONIZING GLOBAL TRADING</h1>
        <p className="section-subtitle">
          We're on a mission to democratize trading by providing everyone with institutional-grade tools, transparent pricing, and complete financial freedom.
        </p>
      </section>

      <section className="about-story">
        <div className="about-story__content">
          <h2 className="section-title" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: 32 }}>OUR STORY</h2>
          <p>
            SwisTrade was founded with a simple belief: trading should be accessible, transparent, and fair for everyone. We saw traders struggling with high fees, slow withdrawals, and limited access to global markets. We decided to change that.
          </p>
          <p>
            Today, SwisTrade serves thousands of traders across 150+ countries, providing them with the tools and freedom they deserve. We're not just a broker&mdash;we're a movement toward financial independence.
          </p>
          <p>
            Our commitment is simple: provide the best trading experience with zero compromises on security, speed, or transparency.
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: 80 }}>
          <span className="mono-label">OUR VISION</span>
          <h2 className="section-title" style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)', marginTop: 16 }}>
            TO BECOME THE WORLD'S MOST TRUSTED TRADING PLATFORM BY PUTTING TRADERS FIRST.
          </h2>
        </div>

        <div className="values-grid">
          {values.map((v) => (
            <ScrollReveal key={v.title}>
              <div className="value-card">
                <h3 className="value-card__title">{v.title}</h3>
                <p className="value-card__desc">{v.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="numbers-grid">
          {numbers.map((n) => (
            <ScrollReveal key={n.label}>
              <div className="number-item">
                <div className="number-item__value">{n.value}</div>
                <div className="number-item__label">{n.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="team-section">
        <div style={{ textAlign: 'center' }}>
          <span className="mono-label">OUR PEOPLE</span>
          <h2 className="section-title" style={{ marginTop: 16 }}>LEADERSHIP TEAM</h2>
          <p className="section-subtitle" style={{ margin: '16px auto 0' }}>
            Led by industry veterans from top financial institutions and technology companies.
          </p>
        </div>
        <div className="team-grid">
          {team.map((t) => (
            <ScrollReveal key={t.name}>
              <div className="team-card">
                <div className="team-card__avatar">{t.initials}</div>
                <h3 className="team-card__name">{t.name}</h3>
                <div className="team-card__role">{t.role}</div>
                <p className="team-card__desc">{t.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </>
  )
}
