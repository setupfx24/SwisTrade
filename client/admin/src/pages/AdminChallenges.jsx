import { useState, useEffect } from 'react'
import { adminApi } from '../services/admin'
import { challengesApi } from '../services/dashboard'

export default function AdminChallenges() {
  const [challenges, setChallenges] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ title: '', description: '', type: 'daily', category: 'best_performer', start_at: '', end_at: '', entry_fee: 0, rewards: {} })

  useEffect(() => { loadChallenges() }, [])
  const loadChallenges = async () => { try { const { data } = await challengesApi.list(); setChallenges(data) } catch { /* empty */ } }

  const handleCreate = async (e) => {
    e.preventDefault()
    try { await adminApi.createChallenge(form); setMessage('Challenge created!'); setShowAdd(false); loadChallenges() }
    catch (err) { setMessage(err.response?.data?.detail || 'Failed') }
  }

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div><h2 className="dash-page__title">CHALLENGES</h2><p className="dash-page__subtitle">Create and manage competitions</p></div>
        <button className="laser-btn laser-btn--sm" onClick={() => setShowAdd(!showAdd)}>{showAdd ? 'CANCEL' : '+ CREATE CHALLENGE'}</button>
      </div>
      {message && <div className="dash-success">{message}</div>}
      {showAdd && (
        <div className="dash-create-card">
          <form onSubmit={handleCreate} className="auth-form" style={{ maxWidth: 600 }}>
            <div className="auth-form__group"><label className="auth-form__label">TITLE</label><input className="auth-form__input" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required /></div>
            <div className="auth-form__group"><label className="auth-form__label">DESCRIPTION</label><textarea className="auth-form__input" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="auth-form__group"><label className="auth-form__label">TYPE</label>
                <select className="auth-form__input" value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}><option value="daily">DAILY</option><option value="weekly">WEEKLY</option><option value="monthly">MONTHLY</option></select></div>
              <div className="auth-form__group"><label className="auth-form__label">CATEGORY</label>
                <select className="auth-form__input" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}><option value="best_performer">BEST PERFORMER</option><option value="best_lot_handler">BEST LOT HANDLER</option><option value="best_holder">BEST HOLDER</option><option value="best_positive">BEST POSITIVE</option></select></div>
              <div className="auth-form__group"><label className="auth-form__label">START DATE</label><input type="datetime-local" className="auth-form__input" value={form.start_at} onChange={(e) => setForm({...form, start_at: e.target.value})} required /></div>
              <div className="auth-form__group"><label className="auth-form__label">END DATE</label><input type="datetime-local" className="auth-form__input" value={form.end_at} onChange={(e) => setForm({...form, end_at: e.target.value})} required /></div>
              <div className="auth-form__group"><label className="auth-form__label">ENTRY FEE ($)</label><input type="number" className="auth-form__input" value={form.entry_fee} onChange={(e) => setForm({...form, entry_fee: parseFloat(e.target.value)})} min="0" /></div>
            </div>
            <button type="submit" className="laser-btn" style={{ marginTop: 12 }}>CREATE CHALLENGE</button>
          </form>
        </div>
      )}
      <div className="dash-prop-grid">
        {challenges.map((c) => (
          <div key={c.id} className="dash-prop-card">
            <div className="dash-prop-card__header"><span className="dash-prop-card__type">{c.type.toUpperCase()}</span><span className={`dash-status dash-status--${c.status}`}>{c.status.toUpperCase()}</span></div>
            <div className="dash-prop-card__size">{c.title}</div>
            <div className="dash-prop-card__rules"><div>Category: {c.category.replace('_',' ')}</div><div>Participants: {c.participant_count}</div><div>Fee: {c.entry_fee > 0 ? `$${c.entry_fee}` : 'FREE'}</div><div>Start: {new Date(c.start_at).toLocaleDateString()}</div></div>
          </div>
        ))}
      </div>
    </div>
  )
}
