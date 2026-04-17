import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          <div>
            <div className="footer__brand-name">
              SWIS<span>TRADE</span>
            </div>
            <p className="footer__brand-desc">
              Professional multi-asset trading platform. Licensed under Investment Dealer Licence No. MAK2109#8161, St. Lucia.
            </p>
            <p className="footer__brand-desc">
              <strong style={{ color: 'var(--text-primary)' }}>UK Office:</strong><br />
              Office 9364hn, 3 Fitzroy Place, Glasgow City Centre, UK, G3 7RH
            </p>
          </div>

          <div>
            <div className="footer__col-title">PRODUCTS</div>
            <ul className="footer__col-links">
              <li><Link to="/platforms">Trading Platforms</Link></li>
              <li><Link to="/white-label">White Label</Link></li>
              <li><a href="#">Open Live Account</a></li>
              <li><a href="#">Demo Account</a></li>
            </ul>
          </div>

          <div>
            <div className="footer__col-title">COMPANY</div>
            <ul className="footer__col-links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/partnerships">Partnerships</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer__col-title">SUPPORT</div>
            <ul className="footer__col-links">
              <li><Link to="/contact">Contact Support</Link></li>
              <li><a href="tel:+19082280305">+1 (908) 228-0305</a></li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span className="mono-label">&copy; 2026 SWISTRADE. ALL RIGHTS RESERVED.</span>
          <div className="footer__bottom-links">
            <Link to="/privacy">PRIVACY POLICY</Link>
            <Link to="/terms">TERMS OF SERVICE</Link>
            <Link to="/risk-disclosure">RISK DISCLOSURE</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
