import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCurrentUser } from './store/authSlice'
import { restoreTokens } from './services/api'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import MobileNav from './components/MobileNav'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import Home from './pages/Home'
import Features from './pages/Features'
import Markets from './pages/Markets'
import Reviews from './pages/Reviews'
import Platforms from './pages/Platforms'
import WhiteLabel from './pages/WhiteLabel'
import About from './pages/About'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import RiskDisclosure from './pages/RiskDisclosure'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import DashboardHome from './pages/dashboard/DashboardHome'
import Accounts from './pages/dashboard/Accounts'
import WalletPage from './pages/dashboard/WalletPage'
import Trading from './pages/dashboard/Trading'
import Orders from './pages/dashboard/Orders'
import PropChallenges from './pages/dashboard/PropChallenges'
import CopyTrading from './pages/dashboard/CopyTrading'
import AlgoBots from './pages/dashboard/AlgoBots'
import Challenges from './pages/dashboard/Challenges'
import Business from './pages/dashboard/Business'
import Profile from './pages/dashboard/Profile'
import AccountLogs from './pages/dashboard/AccountLogs'
// Admin panel is a separate app at admin.swistrade.com (port 5174)

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function MarketingLayout() {
  return (
    <>
      <div className="noise-overlay" />
      <div className="refraction-glow refraction-glow--hero" />
      <div className="refraction-glow refraction-glow--mid" />
      <ScrollToTop />
      <Header />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/markets" element={<Markets />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/platforms" element={<Platforms />} />
          <Route path="/white-label" element={<WhiteLabel />} />
          <Route path="/partnerships" element={<WhiteLabel />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/risk-disclosure" element={<RiskDisclosure />} />
        </Routes>
      </main>
      <Footer />
      <MobileNav />
    </>
  )
}

function AuthLayout() {
  return (
    <>
      <div className="noise-overlay" />
      <ScrollToTop />
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </>
  )
}

function SessionRestore({ children }) {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (isAuthenticated) { setChecked(true); return }
    const { access } = restoreTokens()
    if (access) {
      dispatch(fetchCurrentUser()).finally(() => setChecked(true))
    } else {
      setChecked(true)
    }
  }, [])

  if (!checked) {
    return <div className="auth-loading"><div className="auth-loading__spinner" /></div>
  }
  return children
}

function AppRoutes() {
  const { pathname } = useLocation()
  const isAuth = pathname === '/signin' || pathname === '/signup'
  const isDashboard = pathname.startsWith('/dashboard')
  const isTrading = pathname.startsWith('/trade')

  if (isAuth) return <AuthLayout />

  // Trading terminal — full screen, no sidebar/topbar
  if (isTrading) {
    return (
      <>
        <ScrollToTop />
        <ProtectedRoute>
          <Routes>
            <Route path="/trade/:accountId" element={<Trading />} />
          </Routes>
        </ProtectedRoute>
      </>
    )
  }

  if (isDashboard) {
    return (
      <>
        <div className="noise-overlay" />
        <ScrollToTop />
        <ProtectedRoute>
          <Routes>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/dashboard/accounts" element={<Accounts />} />
              <Route path="/dashboard/orders" element={<Orders />} />
              <Route path="/dashboard/account-logs" element={<AccountLogs />} />
              <Route path="/dashboard/wallet" element={<WalletPage />} />
              <Route path="/dashboard/prop" element={<PropChallenges />} />
              <Route path="/dashboard/copy-trading" element={<CopyTrading />} />
              <Route path="/dashboard/bots" element={<AlgoBots />} />
              <Route path="/dashboard/challenges" element={<Challenges />} />
              <Route path="/dashboard/ib" element={<Business />} />
              <Route path="/dashboard/profile" element={<Profile />} />
            </Route>
          </Routes>
        </ProtectedRoute>
      </>
    )
  }

  return <MarketingLayout />
}

export default function App() {
  return (
    <BrowserRouter>
      <SessionRestore>
        <AppRoutes />
      </SessionRestore>
    </BrowserRouter>
  )
}
