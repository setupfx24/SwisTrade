import { Link, useLocation } from 'react-router-dom'

export default function MobileNav() {
  const location = useLocation()
  const isActive = (path) => location.pathname === path ? 'mobile-nav__item mobile-nav__item--active' : 'mobile-nav__item'

  return (
    <nav className="mobile-nav">
      <Link to="/" className={isActive('/')} aria-label="Home">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
      </Link>
      <Link to="/features" className={isActive('/features')} aria-label="Features">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
      </Link>
      <Link to="/markets" className={isActive('/markets')} aria-label="Markets">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      </Link>
      <Link to="/reviews" className={isActive('/reviews')} aria-label="Reviews">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      </Link>
    </nav>
  )
}
