import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AnimatedGradient from '../components/ui/AnimatedGradient'
import { useAuth } from '../hooks/useAuth'

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading, error, clearAuthError } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearAuthError()
    const formData = new FormData(e.target)
    const result = await login({
      email: formData.get('email'),
      password: formData.get('password'),
    })
    if (!result.error) {
      navigate('/dashboard')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-page__form-side">
        <div className="auth-page__form-container">
          <div className="auth-page__header">
            <Link to="/" className="auth-page__logo">
              SWIS<span className="auth-page__logo-accent">TRADE</span>
            </Link>
          </div>

          <div className="auth-page__title-group">
            <h1 className="auth-page__title">SIGN IN TO YOUR ACCOUNT</h1>
            <p className="auth-page__subtitle">Enter your credentials below to access your trading dashboard</p>
          </div>

          {error && (
            <div className="auth-form__error">{error}</div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} autoComplete="on">
            <div className="auth-form__group">
              <label className="auth-form__label" htmlFor="signin-email">EMAIL</label>
              <input
                id="signin-email"
                name="email"
                type="email"
                className="auth-form__input"
                placeholder="trader@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-form__group">
              <label className="auth-form__label" htmlFor="signin-password">PASSWORD</label>
              <div className="auth-form__password-wrap">
                <input
                  id="signin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-form__input"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-form__eye-btn"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="auth-form__options">
              <a href="#" className="auth-form__forgot">FORGOT PASSWORD?</a>
            </div>

            <button type="submit" className="laser-btn auth-form__submit" disabled={isLoading}>
              {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>

          <div className="auth-form__divider">
            <span className="auth-form__divider-line" />
            <span className="auth-form__divider-text">OR CONTINUE WITH</span>
            <span className="auth-form__divider-line" />
          </div>

          <button type="button" className="auth-form__social-btn" onClick={() => console.log('Google sign-in')}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            CONTINUE WITH GOOGLE
          </button>

          <p className="auth-form__toggle">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="auth-form__toggle-link">SIGN UP</Link>
          </p>
        </div>
      </div>

      <div className="auth-page__visual-side">
        <AnimatedGradient
          config={{
            preset: 'custom',
            color1: '#050505',
            color2: '#BFFF00',
            color3: '#0a0a0a',
            rotation: -30,
            proportion: 20,
            scale: 0.4,
            speed: 12,
            distortion: 3,
            swirl: 50,
            swirlIterations: 8,
            softness: 90,
            offset: -150,
            shape: 'Edge',
            shapeSize: 35,
          }}
          noise={{ opacity: 0.15, scale: 1.5 }}
        />
        <div className="auth-page__visual-content">
          <div className="auth-page__visual-quote">
            <p className="auth-page__visual-quote-text">
              &ldquo;Execute with precision. Trade with confidence.&rdquo;
            </p>
            <span className="mono-label">SWISTRADE PLATFORM</span>
          </div>
          <div className="auth-page__visual-stats">
            <div className="auth-page__visual-stat">
              <span className="auth-page__visual-stat-value">&lt;40MS</span>
              <span className="mono-label">EXECUTION</span>
            </div>
            <div className="auth-page__visual-stat">
              <span className="auth-page__visual-stat-value">0.06</span>
              <span className="mono-label">PIPS SPREAD</span>
            </div>
            <div className="auth-page__visual-stat">
              <span className="auth-page__visual-stat-value">1:500</span>
              <span className="mono-label">LEVERAGE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
